import { useState, useEffect } from "react";
import { useLoaderData, useActionData } from "react-router";
import type { Route } from "./+types/sales-log";
import { toast } from "sonner";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./sales-log.module.css";
import { SalesHeader } from "~/blocks/sales-log/sales-header";
import { SalesSummaryCards } from "~/blocks/sales-log/sales-summary-cards";
import { SalesTable } from "~/blocks/sales-log/sales-table";
import { LogSaleModal } from "~/blocks/sales-log/log-sale-modal";
import { Pagination } from "~/blocks/__global/pagination";
import { CACHE_PRIVATE_NO_STORE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PRIVATE_NO_STORE,
  };
}

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      sales: [],
      inventory: [],
      totalPages: 0,
      summary: { totalSalesCount: 0, totalRevenue: 0, totalProfit: 0 },
    };

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Number(url.searchParams.get("pageSize")) || 10;

  const [totalSales, sales, inventory, allSalesMetrics] = await Promise.all([
    prisma.sale.count({ where: { userId: user.id } }),
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { inventoryItem: true },
      orderBy: { saleDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inventoryItem.findMany({
      where: { userId: user.id, status: "IN_STOCK" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sale.findMany({
      where: { userId: user.id },
      select: {
        salePrice: true,
        inventoryItem: {
          select: { purchasePrice: true },
        },
      },
    }),
  ]);

  let totalRevenue = 0;
  let totalProfit = 0;
  allSalesMetrics.forEach((s) => {
    const salePrice = Number(s.salePrice);
    const cost = Number(s.inventoryItem.purchasePrice);
    totalRevenue += salePrice;
    totalProfit += salePrice - cost;
  });

  return {
    sales,
    inventory,
    totalPages: Math.ceil(totalSales / pageSize),
    summary: {
      totalSalesCount: totalSales,
      totalRevenue,
      totalProfit,
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const inventoryItemId = formData.get("inventoryItemId") as string;
    const salePrice = Number(formData.get("salePrice"));
    const saleDate = new Date(formData.get("saleDate") as string);
    const marketplace = formData.get("marketplace") as any;
    const trackingNumber = formData.get("trackingNumber") as string;

    // Verify the item belongs to the current user before logging a sale against it,
    // otherwise a tampered request could mark another user's inventory as sold.
    const ownedItem = await prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, userId: user.id },
      select: { id: true },
    });
    if (!ownedItem) {
      return new Response("Not Found", { status: 404 });
    }

    await prisma.$transaction([
      prisma.sale.create({
        data: {
          userId: user.id,
          inventoryItemId,
          salePrice,
          saleDate,
          marketplace,
          trackingNumber,
        },
      }),
      prisma.inventoryItem.update({
        where: { id: inventoryItemId, userId: user.id },
        data: { status: "SOLD" },
      }),
    ]);
  }

  return { ok: true, intent };
}

export default function SalesLogPage() {
  const { sales, inventory, totalPages, summary } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showLogSale, setShowLogSale] = useState(false);

  useEffect(() => {
    if (actionData?.ok) {
      if (actionData.intent === "create") {
        toast.success("Sale logged successfully");
        setShowLogSale(false);
      }
    }
  }, [actionData]);

  return (
    <div className={styles.page}>
      <SalesHeader onLogSale={() => setShowLogSale(true)} />
      <SalesSummaryCards sales={sales} summary={summary} />
      <SalesTable sales={sales} />
      <Pagination totalPages={totalPages} />
      {showLogSale && <LogSaleModal inventory={inventory} onClose={() => setShowLogSale(false)} />}
    </div>
  );
}
