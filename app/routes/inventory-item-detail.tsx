import { useLoaderData } from "react-router";
import type { Route } from "./+types/inventory-item-detail";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./inventory-item-detail.module.css";
import { ItemHeader } from "~/blocks/inventory-item-detail/item-header";
import { ItemInfoCard } from "~/blocks/inventory-item-detail/item-info-card";
import { PriceHistoryChart } from "~/blocks/inventory-item-detail/price-history-chart";
import { MarketplaceComparison } from "~/blocks/inventory-item-detail/marketplace-comparison";
import { SalesHistory } from "~/blocks/inventory-item-detail/sales-history";
import { RelatedItems } from "~/blocks/inventory-item-detail/related-items";

const prisma = new PrismaClient();

export async function loader({ request, params }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { id } = params;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const item = await prisma.inventoryItem.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      sale: true,
      priceHistory: {
        orderBy: { fetchedAt: "desc" },
      },
    },
  });

  if (!item) {
    throw new Response("Not Found", { status: 404 });
  }

  const relatedItems = await prisma.inventoryItem.findMany({
    where: {
      userId: user.id,
      brand: item.brand,
      id: {
        not: item.id,
      },
    },
    take: 4,
  });

  return {
    item: {
      ...item,
      purchasePrice: Number(item.purchasePrice),
      askingPrice: item.askingPrice ? Number(item.askingPrice) : null,
      sale: item.sale
        ? {
            ...item.sale,
            salePrice: Number(item.sale.salePrice),
            platformFee: Number(item.sale.platformFee),
            shippingCost: Number(item.sale.shippingCost),
          }
        : null,
      priceHistory: item.priceHistory.map((ph) => ({
        ...ph,
        askPrice: ph.askPrice ? Number(ph.askPrice) : null,
        bidPrice: ph.bidPrice ? Number(ph.bidPrice) : null,
        lastSold: ph.lastSold ? Number(ph.lastSold) : null,
      })),
    },
    relatedItems,
  };
}


export default function InventoryItemDetailPage() {
  const { item, relatedItems } = useLoaderData<typeof loader>();

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className={styles.page}>
      <ItemHeader item={item} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "var(--space-6)",
          marginBottom: "var(--space-6)",
        }}
      >
        <ItemInfoCard item={item} />
        <PriceHistoryChart priceHistory={item.priceHistory} />
      </div>

      <MarketplaceComparison priceHistory={item.priceHistory}  />
      <SalesHistory sale={item.sale} />
      <RelatedItems items={relatedItems} />
    </div>
  );
}
