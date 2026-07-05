/**
 * POST /api/webhooks/orders
 *
 * Webhook endpoint for external e-commerce platforms to notify FlipTrack of a
 * completed sale. On a valid, authenticated request the endpoint will:
 *   1. Verify the HMAC-SHA256 signature against the Integration secret.
 *   2. Validate the JSON payload with Zod.
 *   3. Locate the matching InventoryItem (sku + optional size).
 *   4. Atomically mark it SOLD and create a Sale record in a single transaction.
 *
 * Authentication model
 * ─────────────────────
 * No session cookie is used (webhooks are server-to-server). Instead the
 * calling platform must:
 *   • Store the FlipTrack webhook secret (the plain-text `accessToken` from the
 *     Integration record) in its own config.
 *   • Compute HMAC-SHA256(secret, rawRequestBody) and send it as
 *     `X-FlipTrack-Signature: sha256=<hex>` on every request.
 *
 * The payload's `userId` + `platform` fields are used solely to look up the
 * correct Integration row and its secret. After signature verification the
 * trusted platform value is read from `integration.platform`, not the payload,
 * to prevent "sender lied about platform" bugs.
 */

import type { Route } from "./+types/api.webhooks.orders";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";
import { decrypt } from "~/utils/encryption.server";

const prisma = new PrismaClient();

// ─── Constants mirroring Prisma enums ─────────────────────────────────────────

const MARKETPLACE_VALUES = [
  "STOCKX",
  "GOAT",
  "EBAY",
  "FLIGHTCLUB",
  "STADIUMGOODS",
  "AMAZON",
  "MERCARI",
  "POSHMARK",
  "FACEBOOK",
  "SHOPIFY",
  "GRAILED",
  "DEPOP",
  "OFFERUP",
  "IN_PERSON",
  "OTHER",
] as const;

const CURRENCY_VALUES = ["USD", "CAD", "GBP", "EUR", "AUD", "JPY"] as const;

// ─── Zod validation schema ─────────────────────────────────────────────────────

const WebhookOrderSchema = z.object({
  /** FlipTrack user ID — used to look up the integration secret. */
  userId: z.string().uuid(),

  /**
   * Platform identifier. Must match an existing Integration row for this user.
   * After signature verification the trusted value is taken from the Integration
   * record, not this field, to prevent platform-spoofing.
   */
  platform: z.enum(MARKETPLACE_VALUES),

  /** Product SKU — must match an InventoryItem owned by userId. */
  sku: z.string().min(1),

  /**
   * Variant size (shoe size, clothing size, storage capacity, etc.).
   * Required when the user holds multiple unsold items with the same SKU.
   */
  size: z.string().optional(),

  /** Final sale price in the specified currency. */
  salePrice: z.number().positive(),

  /** Platform/marketplace fee deducted from the payout. */
  platformFee: z.number().min(0).default(0),

  /** Shipping cost charged to or by the seller. */
  shippingCost: z.number().min(0).default(0),

  /** ISO 4217 currency code. Defaults to USD. */
  currency: z.enum(CURRENCY_VALUES).default("USD"),

  /**
   * ISO 8601 date-time string for when the sale occurred.
   * Defaults to the request arrival time when omitted.
   */
  saleDate: z.string().optional(),

  /** Platform handle or username of the buyer, if available. */
  buyerHandle: z.string().optional(),

  /** Shipment tracking number, if available. */
  trackingNumber: z.string().optional(),

  /** Free-form notes to attach to the Sale record. */
  notes: z.string().optional(),
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Constant-time HMAC-SHA256 signature comparison.
 * `signatureHeader` is expected to be either `sha256=<hex>` or bare `<hex>`.
 * Returns `false` on any error (wrong length, bad encoding, etc.).
 */
function verifySignature(rawBody: string, secret: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const candidateHex = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;
  const computedHex = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  // timingSafeEqual requires equal-length buffers; a length mismatch would leak
  // information if we compared directly, so we compare against the computed value.
  try {
    return crypto.timingSafeEqual(Buffer.from(computedHex, "hex"), Buffer.from(candidateHex, "hex"));
  } catch {
    // Buffer.from() throws if the hex string is malformed or wrong length.
    return false;
  }
}

/**
 * JSON.parse wrapper that returns `undefined` instead of throwing.
 * Used for the pre-signature parse so that malformed bodies do not
 * produce useful error signals before authentication.
 */
function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  // Only POST is accepted.
  if (request.method.toUpperCase() !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Read the raw body once. This exact string is used for HMAC verification AND
  // for the authoritative Zod parse — a second JSON.parse call is never made,
  // ensuring both operations operate on identical data.
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("X-FlipTrack-Signature");

  // ── Step 1: Pre-signature parse ──────────────────────────────────────────────
  //
  // Extract `userId` and `platform` so we can look up the integration secret.
  // We intentionally return a generic 401 for all failures here — malformed JSON,
  // missing fields, wrong types — to avoid giving unauthenticated probers any
  // signal about which part of the request was wrong.
  const preBody = safeJsonParse(rawBody);
  const preUserId = typeof (preBody as any)?.userId === "string" ? ((preBody as any).userId as string) : undefined;
  const prePlatform =
    typeof (preBody as any)?.platform === "string"
      ? ((preBody as any).platform as string).toUpperCase()
      : undefined;

  if (!preUserId || !prePlatform) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Step 2: Integration lookup ───────────────────────────────────────────────
  //
  // We return 401 (not 404) even when the integration is missing, to avoid
  // confirming that a particular userId/platform pair does or doesn't exist.
  let integration: { id: string; platform: string; accessToken: string } | null;
  try {
    integration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId: preUserId,
          platform: prePlatform,
        },
      },
      select: { id: true, platform: true, accessToken: true },
    });
  } catch (err) {
    console.error("[webhook/orders] Integration lookup failed:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!integration) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Step 3: Signature verification ──────────────────────────────────────────

  let webhookSecret: string;
  try {
    webhookSecret = decrypt(integration.accessToken);
  } catch (err) {
    console.error("[webhook/orders] Failed to decrypt integration secret:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!verifySignature(rawBody, webhookSecret, signatureHeader)) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Step 4: Authoritative Zod validation ────────────────────────────────────
  //
  // We parse rawBody a second time here, but this is the SAME string read above —
  // not a new network read — so the data is identical. The pre-parse above only
  // pulled two fields for secret-lookup; all business logic uses this result.
  const bodyParsed = safeJsonParse(rawBody);
  if (bodyParsed === undefined) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = WebhookOrderSchema.safeParse(bodyParsed);
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: validation.error.issues,
        acceptedMarketplaces: MARKETPLACE_VALUES,
        acceptedCurrencies: CURRENCY_VALUES,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { sku, size, salePrice, platformFee, shippingCost, currency, saleDate, buyerHandle, trackingNumber, notes } =
    validation.data;

  // Use the platform stored in the Integration record — not the payload value —
  // to prevent a compromised sender from tagging sales to a different platform.
  const trustedPlatform = integration.platform as (typeof MARKETPLACE_VALUES)[number];

  // ── Step 5: Inventory lookup (unambiguous) ───────────────────────────────────

  let matchingItems: { id: string; status: string }[];
  try {
    matchingItems = await prisma.inventoryItem.findMany({
      where: {
        userId: preUserId,
        sku,
        ...(size !== undefined ? { size } : {}),
        status: { not: "SOLD" },
      },
      select: { id: true, status: true },
    });
  } catch (err) {
    console.error("[webhook/orders] Inventory lookup failed:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // No unsold matches — check for idempotency (item may already be SOLD from a
  // previous delivery of this same webhook event).
  if (matchingItems.length === 0) {
    try {
      const alreadySold = await prisma.inventoryItem.findFirst({
        where: {
          userId: preUserId,
          sku,
          ...(size !== undefined ? { size } : {}),
          status: "SOLD",
        },
        select: { id: true, sale: { select: { id: true } } },
      });

      if (alreadySold?.sale) {
        return new Response(
          JSON.stringify({
            skipped: true,
            message: "Item is already marked as SOLD — duplicate webhook delivery?",
            saleId: alreadySold.sale.id,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch {
      // Best-effort idempotency check; fall through to 404 if it fails.
    }

    return new Response(
      JSON.stringify({
        error: "Inventory item not found",
        detail: "No unsold item with this SKU exists for the given user.",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Ambiguous match — cannot safely determine which physical item was sold.
  // Caller must resend with a `size` field to disambiguate.
  if (matchingItems.length > 1) {
    return new Response(
      JSON.stringify({
        error: "Multiple items match this SKU; size is required to disambiguate",
        matchCount: matchingItems.length,
        hint: "Include the `size` field in your webhook payload (e.g. \"size\": \"10\") to target the correct item.",
      }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const item = matchingItems[0];

  // ── Step 6: Atomic SOLD transition + Sale creation ───────────────────────────

  let sale: { id: string };
  try {
    sale = await prisma.$transaction(async (tx) => {
      // Mark the inventory item as SOLD.
      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { status: "SOLD" },
      });

      // Create the corresponding Sale record.
      return tx.sale.create({
        data: {
          userId: preUserId,
          inventoryItemId: item.id,
          salePrice,
          platformFee,
          shippingCost,
          saleDate: saleDate ? new Date(saleDate) : new Date(),
          marketplace: trustedPlatform,
          currency,
          buyerHandle: buyerHandle ?? null,
          trackingNumber: trackingNumber ?? null,
          notes: notes ?? null,
        },
        select: { id: true },
      });
    });
  } catch (err: any) {
    // P2002: unique constraint violation on Sale.inventoryItemId.
    // This means a concurrent request already processed this item — treat as
    // an idempotent success rather than an error.
    if (err?.code === "P2002") {
      return new Response(
        JSON.stringify({
          skipped: true,
          message: "Sale record already created for this item (race condition resolved).",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("[webhook/orders] Transaction failed:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, saleId: sale.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
