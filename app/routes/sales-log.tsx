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
      totalPages: 0,
      summary: { totalSalesCount: 0, totalRevenue: 0, totalProfit: 0 },
    };

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Number(url.searchParams.get("pageSize")) || 10;

  const [totalSales, sales, metricsResult] = await Promise.all([
    prisma.sale.count({ where: { userId: user.id } }),
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { inventoryItem: true },
      orderBy: { saleDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.$queryRaw<{ totalRevenue: number; totalProfit: number }[]>`
  SELECT
    COALESCE(SUM(s."salePrice"), 0) AS "totalRevenue",
    COALESCE(
      SUM(
        s."salePrice"
        - i."purchasePrice"
        - s."platformFee"
        - s."shippingCost"
      ),
      0
    ) AS "totalProfit"
  FROM "Sale" s
  JOIN "InventoryItem" i
    ON s."inventoryItemId" = i.id
  WHERE s."userId" = ${user.id}
`
  ]);

  const totalRevenue = Number(metricsResult[0]?.totalRevenue || 0);
  const totalProfit = Number(metricsResult[0]?.totalProfit || 0);

  return {
    sales: sales.map(s => ({
      ...s,
      salePrice: Number(s.salePrice),
      inventoryItem: {
        ...s.inventoryItem,
        purchasePrice: Number(s.inventoryItem.purchasePrice),
      }
    })),
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

    const platformFee = Number(formData.get("platformFee") || 0);
    const shippingCost = Number(formData.get("shippingCost") || 0);

    const saleDate = new Date(formData.get("saleDate") as string);
    const marketplace = formData.get("marketplace") as any;
    const trackingNumber = formData.get("trackingNumber") as string;

    await prisma.$transaction([
      prisma.sale.create({
        data: {
          userId: user.id,
          inventoryItemId,
          salePrice,
          platformFee,
          shippingCost,
          saleDate,
          marketplace,
          trackingNumber,
        },
      }),
      prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { status: "SOLD" },
      }),
    ]);
  }

  return { ok: true, intent };
}

export default function SalesLogPage() {
  const { sales, totalPages, summary } = useLoaderData<typeof loader>();
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
      {showLogSale && <LogSaleModal onClose={() => setShowLogSale(false)} />}
    </div>
  );
}
