import { useLoaderData } from "react-router";
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

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { inventoryStats: null, salesData: [], expensesData: [] };
  }

  const [inventoryStats, salesData, expensesData] = await Promise.all([
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
  ]);

  const serializedStats = {
    _count: inventoryStats?._count || 0,
    _sum: { purchasePrice: Number(inventoryStats?._sum?.purchasePrice || 0) }
  };

  const serializedSales = salesData.map(s => ({
    ...s,
    salePrice: Number(s.salePrice),
    inventoryItem: {
      ...s.inventoryItem,
      purchasePrice: Number(s.inventoryItem.purchasePrice),
    }
  }));

  const serializedExpenses = expensesData.map(e => ({
    ...e,
    amount: Number(e.amount)
  }));

  // Group expenses by type
  const groupedExpenses = serializedExpenses.reduce((acc, expense) => {
    const type = expense.type;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  return { 
    inventoryStats: serializedStats, 
    salesData: serializedSales, 
    expensesData: serializedExpenses,
    groupedExpenses
  };
}

export default function DashboardPage() {
  const { inventoryStats, salesData, expensesData, groupedExpenses } = useLoaderData<typeof loader>();
  return (
    <div className={styles.page}>
      <DashboardHeader />
      <AIInsightsPanel />
      <StatsCardsRow stats={inventoryStats} sales={salesData} expenses={expensesData} />
      <CashFlowChart sales={salesData} expenses={expensesData} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <TopBrandsChart sales={salesData} />
        <SalesByMarketplacePie sales={salesData} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <ExpenseCategoriesChart groupedExpenses={groupedExpenses} />
      </div>
      <TopSellingItemsTable sales={salesData} />
      <RecentSales sales={salesData} />
    </div>
  );
}