-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM (
    'ACTIVE',
    'SOLD',
    'ENDED',
    'DRAFT',
    'DELISTED',
    'DELIST_FAILED'
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "listingUrl" TEXT,
    "externalListingId" TEXT,
    "askingPrice" DECIMAL(10,2),
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "listedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delistedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_inventoryItemId_idx" ON "Listing"("inventoryItemId");

-- CreateIndex
CREATE INDEX "Listing_marketplace_idx" ON "Listing"("marketplace");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
