-- Drop marketplace-specific fields from InventoryItem (Phase B)
ALTER TABLE "InventoryItem" DROP COLUMN "marketplace",
DROP COLUMN "askingPrice";