import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import type { Route } from "./+types/api.ai.ocr";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const ExtractedReceiptSchema = z.object({
  sku: z.string().describe("The product SKU or model number found on the receipt/invoice. Empty string if not found."),
  name: z.string().describe("The full product name found on the receipt/invoice. Empty string if not found."),
  purchasePrice: z
    .number()
    .nullable()
    .describe("The unit purchase price as a number (no currency symbols). Null if not found."),
});

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid form data." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const imageFile = formData.get("image");

  if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
    return new Response(JSON.stringify({ ok: false, error: "No image file provided." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Limit file size to 10 MB
  if (imageFile.size > 10 * 1024 * 1024) {
    return new Response(JSON.stringify({ ok: false, error: "Image is too large. Please upload an image under 10 MB." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(imageFile.type)) {
    return new Response(JSON.stringify({ ok: false, error: "Unsupported image format. Use JPEG, PNG, or WebP." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${imageFile.type};base64,${base64}`;

    const { object } = await generateObject({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      schema: ExtractedReceiptSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: dataUrl,
            },
            {
              type: "text",
              text: `You are an expert at reading wholesale invoices, retail receipts, and product labels.
Carefully examine this image and extract the following fields:
- sku: The product's SKU, model number, style code, or item number (e.g. "DD1391-100", "AJ1-CHI-10"). Return an empty string if not found.
- name: The full product name or description (e.g. "Air Jordan 1 Retro High OG Chicago"). Return an empty string if not found.
- purchasePrice: The unit purchase/cost price as a plain number without currency symbols (e.g. 170.00). Return null if not found.

Return only the extracted data. Do not guess or fabricate values — only extract what is clearly visible in the image.`,
            },
          ],
        },
      ],
    });

    return new Response(JSON.stringify({ ok: true, data: object }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/ai/ocr] Vision extraction failed:", message);
    return new Response(
      JSON.stringify({ ok: false, error: "AI extraction failed. Please try again or fill the form manually." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
