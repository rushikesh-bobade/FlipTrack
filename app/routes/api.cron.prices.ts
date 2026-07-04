import type { Route } from "./+types/api.cron.prices";
import { PrismaClient } from "@prisma/client";
import { runAllScrapers } from "~/services/scrapers";
import { waitUntil } from "@vercel/functions";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  // Protect with cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch unique SKU/Size combinations
  const items = await prisma.inventoryItem.findMany({
    select: { sku: true, size: true },
    distinct: ["sku", "size"],
  });

  // Detach the scraping process so the HTTP request doesn't timeout
  waitUntil((async () => {
    try {
      for (const item of items) {
        if (item.sku && item.size) {
          await runAllScrapers(item.sku, item.size);
        }
      }
      console.log(`Cron scraping completed for ${items.length} items`);
    } catch (error) {
      console.error("Background scraping job failed:", error);
    }
  })());

  return new Response(JSON.stringify({ success: true, count: items.length, status: "queued" }), { 
    status: 202,
    headers: { "Content-Type": "application/json" }
  });
}
