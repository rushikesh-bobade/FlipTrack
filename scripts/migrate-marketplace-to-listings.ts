/**
 * One-off backfill for issue #157.
 *
 * Copies the legacy `InventoryItem.marketplace` / `InventoryItem.askingPrice`
 * fields into the new `Listing` table, one Listing per InventoryItem that
 * currently has a marketplace set.
 *
 * Safe to re-run: items that already have a matching Listing are skipped,
 * so this will not create duplicates if run more than once.
 *
 * Usage:
 *   npx tsx scripts/migrate-marketplace-to-listings.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.inventoryItem.findMany({
    where: { marketplace: { not: null } },
    include: { listings: true },
  });

  console.log(`Found ${items.length} inventory item(s) with a marketplace set.`);

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const alreadyMigrated = item.listings.some(
      (l) => l.marketplace === item.marketplace,
    );

    if (alreadyMigrated) {
      skipped++;
      continue;
    }

    await prisma.listing.create({
      data: {
        inventoryItemId: item.id,
        marketplace: item.marketplace!,
        askingPrice: item.askingPrice,
        status: item.status === "SOLD" ? "SOLD" : "ACTIVE",
        listedAt: item.createdAt,
      },
    });
    created++;
  }

  console.log(`Created ${created} listing(s). Skipped ${skipped} already-migrated item(s).`);
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
