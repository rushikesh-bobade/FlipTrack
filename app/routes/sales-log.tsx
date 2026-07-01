import { useState, useEffect } from "react";
import { useLoaderData, useActionData, useSearchParams } from "react-router";
import type { Route } from "./+types/sales-log";
import { toast } from "sonner";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./sales-log.module.css";
import { SalesHeader } from "~/blocks/sales-log/sales-header";
import { SalesSummaryCards } from "~/blocks/sales-log/sales-summary-cards";
import { SalesTable } from "~/blocks/sales-log/sales-table";
import { LogSaleModal } from "~/blocks/sales-log/log-sale-modal";
import type { SortField, SortDirection } from "~/blocks/sales-log/sales-table";

const prisma = new PrismaClient();

// Helper function to validate sort parameters
function getSortParams(searchParams: URLSearchParams): { field: SortField; direction: SortDirection } {
  const validFields: SortField[] = ['item', 'marketplace', 'salePrice', 'saleDate', 'margin', 'profit'];
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { sales: [], inventory: [], totalCount: 0, sortField: 'saleDate', sortDirection: 'desc', currentPage: 1, pageSize: 10 };

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
  let needsPostSorting = false;
  
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
    case 'margin':
    case 'profit':
      // For calculated fields, we need to sort after fetching
      needsPostSorting = true;
      orderBy = { saleDate: 'desc' }; // Fallback for initial fetch
      break;
    default:
      orderBy = { saleDate: 'desc' };
  }

  // Fetch sales with pagination and sorting
  const [sales, totalCount, inventory] = await Promise.all([
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { inventoryItem: true },
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
    }),
    prisma.sale.count({
      where: { userId: user.id },
    }),
    prisma.inventoryItem.findMany({
      where: { userId: user.id, status: "IN_STOCK" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // For margin and profit sorting, we need to sort after fetching
  let sortedSales = sales;
  if (needsPostSorting) {
    sortedSales = [...sales].sort((a, b) => {
      const aCost = Number(a.inventoryItem?.purchasePrice || 0);
      const bCost = Number(b.inventoryItem?.purchasePrice || 0);
      const aPrice = Number(a.salePrice);
      const bPrice = Number(b.salePrice);
      
      let aValue, bValue;
      if (field === 'margin') {
        aValue = aPrice > 0 ? ((aPrice - aCost) / aPrice) * 100 : 0;
        bValue = bPrice > 0 ? ((bPrice - bCost) / bPrice) * 100 : 0;
      } else { // profit
        aValue = aPrice - aCost;
        bValue = bPrice - bCost;
      }
      
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  return { 
    sales: sortedSales, 
    inventory, 
    totalCount,
    sortField: field,
    sortDirection: direction,
    currentPage: page,
    pageSize
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const inventoryItemId = formData.get("inventoryItemId") as string;
    const salePrice = Number(formData.get("salePrice"));
    const saleDate = new Date(formData.get("saleDate") as string);
    const marketplace = formData.get("marketplace") as any;
    const trackingNumber = formData.get("trackingNumber") as string;

    await prisma.$transaction([
      prisma.sale.create({
        data: {
          userId: user.id,
          inventoryItemId,
          salePrice,
          saleDate,
          marketplace,
          trackingNumber,
        }
      }),
      prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { status: "SOLD" }
      })
    ]);
  }

  return { ok: true, intent };
}

export default function SalesLogPage() {
  const { sales, inventory, totalCount, sortField, sortDirection, currentPage, pageSize } = useLoaderData<typeof loader>();
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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  return (
    <div className={styles.page}>
      <SalesHeader onLogSale={() => setShowLogSale(true)} />
      <SalesSummaryCards sales={sales} />
      <SalesTable 
        sales={sales} 
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
      {showLogSale && <LogSaleModal inventory={inventory} onClose={() => setShowLogSale(false)} />}
    </div>
  );
}