-- AlterTable: Add imageUrl column to InventoryItem for storing image URLs
-- This migration is a safe no-op if the column already exists (idempotent via IF NOT EXISTS).
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
