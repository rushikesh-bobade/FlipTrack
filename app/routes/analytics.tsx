import { useLoaderData } from "react-router";
import type { Route } from "./+types/analytics";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./analytics.module.css";
import { StaleInventoryCard } from "~/blocks/analytics/StaleInventoryCard";
import { ProfitForecast } from "~/blocks/analytics/ProfitForecast";
import { CACHE_PRIVATE_NO_STORE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PRIVATE_NO_STORE,
  };
}

const prisma = new PrismaClient();
const STALE_THRESHOLD_DAYS = 60;

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      staleItems: [],
      forecast: {
        totalInventoryCost: 0,
        totalEstimatedMarketValue: 0,
        projectedProfit: 0,
        projectedMarginPct: 0,
        itemsMissingMarketData: 0,
      },
    };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - STALE_THRESHOLD_DAYS);

  // Pull every in-stock item once, with its most recent MarketPrice snapshot,
  // then derive both the stale-inventory list and the profit forecast from
  // the same result set instead of hitting the DB twice.
  const inStockItems = await prisma.inventoryItem.findMany({
    where: { userId: user.id, status: "IN_STOCK" },
    include: {
      priceHistory: {
        orderBy: { fetchedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { purchaseDate: "asc" },
  });

  const now = Date.now();

  const normalized = inStockItems.map((item) => {
    const snapshot = item.priceHistory[0];
    const estimatedMarketValue = snapshot ? Number(snapshot.lastSold ?? snapshot.askPrice ?? 0) || null : null;

    return {
      ...item,
      purchasePrice: Number(item.purchasePrice),
      askingPrice: item.askingPrice != null ? Number(item.askingPrice) : null,
      estimatedMarketValue,
      daysInStock: Math.floor((now - item.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)),
    };
  });

  const staleItems = normalized.filter((item) => item.purchaseDate < cutoffDate);

  let totalInventoryCost = 0;
  let totalEstimatedMarketValue = 0;
  let itemsMissingMarketData = 0;

  for (const item of normalized) {
    totalInventoryCost += item.purchasePrice;
    if (item.estimatedMarketValue != null) {
      totalEstimatedMarketValue += item.estimatedMarketValue;
    } else {
      totalEstimatedMarketValue += item.askingPrice ?? item.purchasePrice;
      itemsMissingMarketData += 1;
    }
  }

  const projectedProfit = totalEstimatedMarketValue - totalInventoryCost;
  const projectedMarginPct = totalInventoryCost > 0 ? (projectedProfit / totalInventoryCost) * 100 : 0;

  return {
    staleItems,
    forecast: {
      totalInventoryCost,
      totalEstimatedMarketValue,
      projectedProfit,
      projectedMarginPct,
      itemsMissingMarketData,
    },
  };
}

export default function AnalyticsPage() {
  const { staleItems, forecast } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <ProfitForecast forecast={forecast} />
      <StaleInventoryCard items={staleItems} />
    </div>
  );
}
