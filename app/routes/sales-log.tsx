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
import { DeleteSaleModal } from "~/blocks/sales-log/delete-sale-modal";
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

  const [totalSales, sales, inventory, metricsResult] = await Promise.all([
    prisma.sale.count({ where: { userId: user.id } }),
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { inventoryItem: true },
      orderBy: { saleDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
      prisma.inventoryItem.findMany({
       where: {
        userId: user.id,
        status: "IN_STOCK",
  },
  orderBy: {
    createdAt: "desc",
  },
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
  sales: sales.map((sale) => ({
    ...sale,
    salePrice: Number(sale.salePrice),
    platformFee: Number(sale.platformFee),
    shippingCost: Number(sale.shippingCost),

    inventoryItem: {
      ...sale.inventoryItem,
      purchasePrice: Number(sale.inventoryItem.purchasePrice),
    },
  })),

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

     const platformFee  =  Number(formData.get("platformFee") || 0);
     const shippingCost = Number(formData.get("shippingCost") || 0);

    const saleDate = new Date(formData.get("saleDate") as string);
    const marketplace = formData.get("marketplace") as any;
    const trackingNumber = formData.get("trackingNumber") as string;

    // formData.get() can return null (missing field) or a File; the `as string`
    // cast hides that from tsc but Prisma would throw a 500 at runtime. Validate
    // the type up front so a malformed request fails gracefully with a 400.
    if (typeof inventoryItemId !== "string" || !inventoryItemId) {
      return new Response("Bad Request", { status: 400 });
    }

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
          platformFee,
          shippingCost,
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
 if (intent === "edit") {
  const saleId = formData.get("saleId") as string;
  const salePrice = Number(formData.get("salePrice"));
  const saleDate = new Date(formData.get("saleDate") as string);
  const marketplace = formData.get("marketplace") as any;
  const trackingNumber = formData.get("trackingNumber") as string;
  const platformFee = Number(formData.get("platformFee") || 0);
const shippingCost = Number(formData.get("shippingCost") || 0);

  const sale = await prisma.sale.findFirst({
    where: {
      id: saleId,
      userId: user.id,
    },
  });

  if (!sale) {
    return { ok: false };
  }

  await prisma.sale.update({
    where: {
      id: saleId,
    },
    data: {
      platformFee,
      shippingCost,
      salePrice,
      saleDate,
      marketplace,
      trackingNumber,
    },
  });

  return { ok: true, intent: "edit" };
}

    if (intent === "delete") {
    const saleId = formData.get("saleId") as string;

    const sale = await prisma.sale.findFirst({
      where: { id: saleId,
      userId: user.id,
       },
    });

    if (!sale) {
      return { ok: false };
    }

    await prisma.$transaction([
      prisma.sale.delete({
        where: { id: saleId },
      }),
      prisma.inventoryItem.update({
        where: { id: sale.inventoryItemId },
        data: {
          status: "IN_STOCK",
        },
      }),
    ]);

    return { ok: true, intent: "delete" };
  }
  return { ok: true, intent };
}

export default function SalesLogPage() {
  const { sales,inventory, totalPages, summary } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showLogSale, setShowLogSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

useEffect(() => {
  if (!actionData?.ok) return;

  if (actionData.intent === "create") {
    toast.success("Sale logged successfully");
    setShowLogSale(false);
  }

  if (actionData.intent === "edit") {
    toast.success("Sale updated successfully");
    setShowEdit(false);
  }

  if (actionData.intent === "delete") {
    toast.success("Sale deleted successfully");
    setShowDelete(false);
  }
}, [actionData]);

return (
  <div className={styles.page}>
    <SalesHeader onLogSale={() => setShowLogSale(true)} />

    <SalesSummaryCards
      sales={sales}
      summary={summary}
    />

    <SalesTable
      sales={sales}
      onEdit={(sale) => {
        setSelectedSale(sale);
        setShowEdit(true);
      }}
      onDelete={(sale) => {
        setSelectedSale(sale);
        setShowDelete(true);
      }}
    />

    <Pagination totalPages={totalPages} />

    {showLogSale && (
      <LogSaleModal
        inventory={inventory}
        onClose={() => setShowLogSale(false)}
      />
    )}

    {showEdit && (
      <LogSaleModal
        sale={selectedSale}
        inventory={inventory}
        onClose={() => setShowEdit(false)}
      />
    )}

    {showDelete && selectedSale && (
      <DeleteSaleModal
        saleId={selectedSale.id}
        onClose={() => setShowDelete(false)}
      />
    )}
  </div>
);
}
