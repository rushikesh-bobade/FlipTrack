import { Marketplace } from "@prisma/client";
import { prisma } from "~/utils/db.server";
export interface PriceResult {
  marketplace: Marketplace;
  sku: string;
  size: string;
  askPrice: number | null;
  lastSold: number | null;
  bidPrice: number | null;
  fetchedAt: Date;
  url: string;
}

export async function runAllScrapers(sku: string, size: string) {
  // Stub for scraper logic
  console.log(`Running scrapers for ${sku} - ${size}`);
  
  // Fake result
  const result: PriceResult = {
    marketplace: "STOCKX",
    sku,
    size,
    askPrice: Math.floor(Math.random() * 500) + 100,
    lastSold: Math.floor(Math.random() * 500) + 100,
    bidPrice: Math.floor(Math.random() * 500) + 100,
    fetchedAt: new Date(),
    url: "https://stockx.com",
  };

  // Upsert to database
  await prisma.marketPrice.create({
    data: {
      sku: result.sku,
      size: result.size,
      marketplace: result.marketplace,
      askPrice: result.askPrice,
      lastSold: result.lastSold,
      bidPrice: result.bidPrice,
      fetchedAt: result.fetchedAt,
    }
  });

  return [result];
}
