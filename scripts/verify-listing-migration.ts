/**
 * Verification for issue #157, run after migrate-marketplace-to-listings.ts
 * and BEFORE applying migration 20260713000001_drop_inventoryitem_marketplace_fields.
 *
 * Confirms every InventoryItem with a legacy marketplace has a matching
 * Listing, so the old columns are safe to drop.
 *
 * Usage:
 *   npx tsx scripts/verify-listing-migration.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const itemsWithMarketplace = await prisma.inventoryItem.findMany({
    where: { marketplace: { not: null } },
    include: { listings: true },
  });

  const unmigrated = itemsWithMarketplace.filter(
    (item) => !item.listings.some((l) => l.marketplace === item.marketplace),
  );

  const totalListings = await prisma.listing.count();

  console.log(`InventoryItems with legacy marketplace set: ${itemsWithMarketplace.length}`);
  console.log(`Total Listing rows: ${totalListings}`);
  console.log(`InventoryItems missing a matching Listing: ${unmigrated.length}`);

  if (unmigrated.length > 0) {
    console.error(
      "❌ Not safe to drop legacy columns yet. Unmigrated item ids:",
      unmigrated.map((i) => i.id),
    );
    process.exitCode = 1;
    return;
  }

  console.log("✅ All items migrated. Safe to apply the Phase B migration.");
}

main().finally(() => prisma.$disconnect());
