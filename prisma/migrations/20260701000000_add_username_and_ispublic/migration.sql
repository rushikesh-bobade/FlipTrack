-- Add username to User model
ALTER TABLE "User" ADD COLUMN "username" TEXT;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Add isPublic to InventoryItem model
ALTER TABLE "InventoryItem" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
