import { Suspense } from "react";
import { useLoaderData, Await } from "react-router";
import type { Route } from "./+types/dashboard";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
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
import { DashboardSkeleton } from "~/blocks/dashboard/dashboard-skeleton";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { dashboardData: Promise.resolve({ inventoryStats: null, salesData: [], expensesData: [] }) };
  }

  const dashboardData = Promise.all([
    prisma.inventoryItem.aggregate({
      where: { userId: user.id, status: 'IN_STOCK' },
      _sum: { purchasePrice: true },
      _count: true,
    }),
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { expenses: true, inventoryItem: true },
      orderBy: { saleDate: 'desc' },
    }),
    prisma.expense.findMany({
      where: { userId: user.id },
    }),
  ]).then(([inventoryStats, salesData, expensesData]) => ({
    inventoryStats: {
      _count: inventoryStats?._count || 0,
      _sum: { purchasePrice: Number(inventoryStats?._sum?.purchasePrice || 0) }
    },
    salesData: salesData.map(s => ({
      ...s,
      salePrice: Number(s.salePrice),
      inventoryItem: {
        ...s.inventoryItem,
        purchasePrice: Number(s.inventoryItem.purchasePrice),
      }
    })),
    expensesData: expensesData.map(e => ({
      ...e,
      amount: Number(e.amount)
    }))
  }));

  return { dashboardData };
}

export default function DashboardPage() {
  const { dashboardData } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <DashboardHeader />
      <AIInsightsPanel />
      <Suspense fallback={<DashboardSkeleton />}>
        <Await resolve={dashboardData}>
          {({ inventoryStats, salesData, expensesData }) => (
            <>
              <StatsCardsRow stats={inventoryStats} sales={salesData} expenses={expensesData} />
              <CashFlowChart sales={salesData} expenses={expensesData} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
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