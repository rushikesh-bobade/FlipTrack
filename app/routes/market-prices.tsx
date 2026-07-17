import { Suspense } from "react";
import { useLoaderData, Await } from "react-router";
import type { Route } from "./+types/market-prices";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./market-prices.module.css";
import { MarketPricesHeader } from "~/blocks/market-prices/market-prices-header";
import { PriceComparisonTable } from "~/blocks/market-prices/price-comparison-table";
import { PriceUpdateStatus } from "~/blocks/market-prices/price-update-status";
import { PriceAlertsQuickAdd } from "~/blocks/market-prices/price-alerts-quick-add";
import { CACHE_PRIVATE_SHARED_DATA } from "~/utils/cache-headers";
import { IconLoader2 } from "@tabler/icons-react";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PRIVATE_SHARED_DATA,
  };
}

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await getUserFromRequest(request, supabase);

  if (!user) {
    return {
      deferredData: Promise.resolve([] as any[]),
    };
  }

  // Fetch user's inventory to match SKUs against market prices (deferred)
  const deferredData = prisma.inventoryItem.findMany({
    where: { userId: user.id },
    select: { sku: true, size: true, name: true, purchasePrice: true },
  }).then(async (userItems) => {
    const skus = Array.from(new Set(userItems.map((i) => i.sku)));

    const prices = await prisma.marketPrice.findMany({
      where: { sku: { in: skus } },
      orderBy: { fetchedAt: "desc" },
    });

    // Map product names to prices based on SKU
    return prices.map((p) => {
      const matchingItem = userItems.find((i) => i.sku === p.sku && i.size === p.size);
      return {
        ...p,
        askPrice: p.askPrice ? Number(p.askPrice) : null,
        bidPrice: p.bidPrice ? Number(p.bidPrice) : null,
        lastSold: p.lastSold ? Number(p.lastSold) : null,
        productName: matchingItem ? matchingItem.name : "Unknown Product",
      };
    });
  });

  return { deferredData };
}

export default function MarketPricesPage() {
  const { deferredData } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <MarketPricesHeader />
      <PriceUpdateStatus />
      <Suspense
        fallback={
          <div className={styles.loadingContainer}>
            <IconLoader2 size={32} className={styles.spin} />
            <span>Loading market prices...</span>
          </div>
        }
      >
        <Await resolve={deferredData}>
          {(prices) => <PriceComparisonTable prices={prices} />}
        </Await>
      </Suspense>
      <PriceAlertsQuickAdd />
    </div>
  );
}
