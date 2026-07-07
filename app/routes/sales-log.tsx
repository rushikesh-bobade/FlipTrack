import { useState, useEffect, Suspense } from "react";
import { useLoaderData, useActionData, useSearchParams, Await } from "react-router";
import type { Route } from "./+types/sales-log";
import { toast } from "sonner";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./sales-log.module.css";
import { SalesHeader } from "~/blocks/sales-log/sales-header";
import { SalesSummaryCards } from "~/blocks/sales-log/sales-summary-cards";
import { SalesTable } from "~/blocks/sales-log/sales-table";
import { LogSaleModal } from "~/blocks/sales-log/log-sale-modal";
import type { SortField, SortDirection } from "~/blocks/sales-log/sales-table";
import { CACHE_PRIVATE_NO_STORE } from "~/utils/cache-headers";
import { IconLoader2 } from "@tabler/icons-react";

const prisma = new PrismaClient();

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PRIVATE_NO_STORE,
  };
}

// Helper function to validate sort parameters
function getSortParams(searchParams: URLSearchParams): { field: SortField; direction: SortDirection } {
  // Only allow sortable database columns (removed 'margin' and 'profit')
  const validFields: SortField[] = ['item', 'marketplace', 'salePrice', 'saleDate'];
  const validDirections: SortDirection[] = ['asc', 'desc'];
  
  const field = searchParams.get('sort') as SortField;
  const direction = searchParams.get('dir') as SortDirection;
  
  return {
    field: validFields.includes(field) ? field : 'saleDate',
    direction: validDirections.includes(direction) ? direction : 'desc',
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await getUserFromRequest(request, supabase);

  if (!user) {
    return {
      deferredData: Promise.resolve({
        sales: [] as any[],
        totalCount: 0,
        totalPages: 0,
        summary: { totalSalesCount: 0, totalRevenue: 0, totalProfit: 0 },
        sortField: 'saleDate' as SortField,
        sortDirection: 'desc' as SortDirection,
        currentPage: 1,
        pageSize: 10,
      }),
    };
  }

  // Get URL search params
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const { field, direction } = getSortParams(searchParams);
  
  // Get pagination params
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Build orderBy object based on sort field
  let orderBy: any = {};
  
  switch (field) {
    case 'item':
      orderBy = { inventoryItem: { name: direction } };
      break;
    case 'marketplace':
      orderBy = { marketplace: direction };
      break;
    case 'salePrice':
      orderBy = { salePrice: direction };
      break;
    case 'saleDate':
      orderBy = { saleDate: direction };
      break;
    default:
      orderBy = { saleDate: 'desc' };
  }

  // Fetch all data in parallel as promises (deferred)
  const countPromise = prisma.sale.count({ 
    where: { userId: user.id } 
  });
  
  const salesPromise = prisma.sale.findMany({
    where: { userId: user.id },
    include: { inventoryItem: true },
    orderBy: orderBy,
    skip: skip,
    take: pageSize,
  }).then((sales) =>
    sales.map(s => ({
      ...s,
      salePrice: Number(s.salePrice),
      inventoryItem: {
        ...s.inventoryItem,
        purchasePrice: Number(s.inventoryItem.purchasePrice),
      }
    }))
  );

  const rawQueryPromise = prisma.$queryRaw<{ totalRevenue: number; totalProfit: number }[]>`
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
  `;

  const deferredData = Promise.all([countPromise, salesPromise, rawQueryPromise]).then(
    ([totalSales, formattedSales, metricsResult]) => {
      const totalRevenue = Number(metricsResult[0]?.totalRevenue || 0);
      const totalProfit = Number(metricsResult[0]?.totalProfit || 0);

      return {
        sales: formattedSales,
        totalCount: totalSales,
        totalPages: Math.ceil(totalSales / pageSize),
        summary: {
          totalSalesCount: totalSales,
          totalRevenue,
          totalProfit,
        },
        sortField: field,
        sortDirection: direction,
        currentPage: page,
        pageSize,
      };
    }
  );

  return { deferredData };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await getUserFromRequest(request, supabase);
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

    // Validate the type up front so a malformed request fails gracefully
    if (typeof inventoryItemId !== "string" || !inventoryItemId) {
      return new Response("Bad Request", { status: 400 });
    }

    // Verify the item belongs to the current user
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

  return { ok: true, intent };
}

export default function SalesLogPage() {
  const { deferredData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showLogSale, setShowLogSale] = useState(false);

  useEffect(() => {
    if (actionData?.ok) {
      if (actionData.intent === "create") {
        toast.success("Sale logged successfully");
        setShowLogSale(false);
      }
    }
  }, [actionData]);

  const handleSort = (field: SortField) => {
    const currentField = searchParams.get('sort') || 'saleDate';
    const currentDir = searchParams.get('dir') || 'desc';
    
    let newDirection: SortDirection;
    if (field === currentField) {
      newDirection = currentDir === 'asc' ? 'desc' : 'asc';
    } else {
      newDirection = 'desc';
    }
    
    // Reset to page 1 when sorting
    const params = new URLSearchParams(searchParams);
    params.set('sort', field);
    params.set('dir', newDirection);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className={styles.page}>
      <SalesHeader onLogSale={() => setShowLogSale(true)} />
      <Suspense
        fallback={
          <div className={styles.loadingContainer}>
            <IconLoader2 size={32} className={styles.spin} />
            <span>Loading sales data...</span>
          </div>
        }
      >
        <Await resolve={deferredData}>
          {({ sales, summary, sortField, sortDirection, totalCount, pageSize }) => (
            <>
              <SalesSummaryCards summary={summary} />
              <SalesTable 
                sales={sales}
                sortField={sortField as SortField}
                sortDirection={sortDirection as SortDirection}
                onSort={handleSort}
                totalCount={totalCount}
                pageSize={pageSize}
              />
            </>
          )}
        </Await>
      </Suspense>
      {showLogSale && <LogSaleModal onClose={() => setShowLogSale(false)} />}
    </div>
  );
}