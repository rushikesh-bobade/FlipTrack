import { Suspense } from "react";
import { useLoaderData, Await } from "react-router";
import type { Route } from "./+types/dashboard";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import { PrismaClient, Prisma } from "@prisma/client";
import styles from "./dashboard.module.css";
import { DashboardHeader } from "~/blocks/dashboard/dashboard-header";
import { StatsCardsRow } from "~/blocks/dashboard/stats-cards-row";
import { CashFlowChart } from "~/blocks/dashboard/cash-flow-chart";
import { TopBrandsChart } from "~/blocks/dashboard/top-brands-chart";
import { SalesByMarketplacePie } from "~/blocks/dashboard/sales-by-marketplace-pie";
import { TopSellingItemsTable } from "~/blocks/dashboard/top-selling-items-table";
import { RecentSales } from "~/blocks/dashboard/recent-sales";
import { ExpenseCategoriesChart } from "~/blocks/dashboard/expense-categories-chart";
import { AIInsightsPanel } from "~/blocks/dashboard/ai-insights-panel";
import { CACHE_PRIVATE_NO_STORE } from "~/utils/cache-headers";
import { IconLoader2 } from "@tabler/icons-react";

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
  } = await getUserFromRequest(request, supabase);

  if (!user) {
    return {
      deferredData: Promise.resolve({
        inventoryStats: { _count: 0, _sum: { purchasePrice: 0 } },
        salesData: [] as any[],
        expensesData: [] as any[],
      }),
    };
  }

  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "month";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  const now = new Date();

  if (range === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === "3months") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 90);
  } else if (range === "year") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 365);
  } else if (range === "custom") {
    if (from) {
      const parsedFrom = new Date(from);
      if (!isNaN(parsedFrom.getTime())) {
        startDate = parsedFrom;
      }
    }
    if (to) {
      const parsedTo = new Date(to);
      if (!isNaN(parsedTo.getTime())) {
        endDate = parsedTo;
        endDate.setHours(23, 59, 59, 999);
      }
    }
  }

  const saleWhereClause: Prisma.SaleWhereInput = {
    userId: user.id,
    ...(startDate || endDate
      ? {
        saleDate: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
      }
      : {}),
  };

  const expenseWhereClause: Prisma.ExpenseWhereInput = {
    userId: user.id,
    ...(startDate || endDate
      ? {
        date: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
      }
      : {}),
  };

  const statsPromise = prisma.inventoryItem.aggregate({
    where: { userId: user.id, status: "IN_STOCK" },
    _sum: { purchasePrice: true },
    _count: true,
  }).then((stats) => ({
    _count: stats?._count || 0,
    _sum: { purchasePrice: Number(stats?._sum?.purchasePrice || 0) },
  }));

  const salesPromise = prisma.sale.findMany({
    where: saleWhereClause,
    include: { expenses: true, inventoryItem: true },
    orderBy: { saleDate: "desc" },
  }).then((sales) =>
    sales.map((s) => ({
      ...s,
      salePrice: Number(s.salePrice),
      platformFee: Number(s.platformFee),
      shippingCost: Number(s.shippingCost),
      inventoryItem: {
        ...s.inventoryItem,
        purchasePrice: Number(s.inventoryItem.purchasePrice),
      },
    }))
  );

  const expensesPromise = prisma.expense.findMany({
    where: expenseWhereClause,
  }).then((expenses) =>
    expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
    }))
  );

  const deferredData = Promise.all([statsPromise, salesPromise, expensesPromise]).then(
    ([inventoryStats, salesData, expensesData]) => ({
      inventoryStats,
      salesData,
      expensesData,
    })
  );

  return { deferredData };
}

export default function DashboardPage() {
  const { deferredData } = useLoaderData<typeof loader>();
  return (
    <div className={styles.page}>
      <DashboardHeader />
      <AIInsightsPanel />
      <Suspense
        fallback={
          <div className={styles.loadingContainer}>
            <IconLoader2 size={32} className={styles.spin} />
            <span>Loading dashboard data...</span>
          </div>
        }
      >
        <Await resolve={deferredData}>
          {({ inventoryStats, salesData, expensesData }) => (
            <>
              <StatsCardsRow stats={inventoryStats} sales={salesData} expenses={expensesData} />
              <CashFlowChart sales={salesData} expenses={expensesData} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--space-6)",
                  marginBottom: "var(--space-6)",
                }}
              >
                <TopBrandsChart sales={salesData} />
                <SalesByMarketplacePie sales={salesData} />
                <ExpenseCategoriesChart expenses={expensesData} />
              </div>
              <TopSellingItemsTable sales={salesData} />
              <RecentSales sales={salesData} />
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

