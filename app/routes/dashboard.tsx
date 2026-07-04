import { useLoaderData } from "react-router";
import type { Route } from "./+types/dashboard";
import { getSupabaseServerClient } from "~/utils/supabase.server";
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

  if (!user) {
    return { inventoryStats: null, salesData: [], expensesData: [] };
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

  const [inventoryStats, salesData, expensesData] = await Promise.all([
    prisma.inventoryItem.aggregate({
      where: { userId: user.id, status: "IN_STOCK" },
      _sum: { purchasePrice: true },
      _count: true,
    }),
    prisma.sale.findMany({
      where: saleWhereClause,
      include: { expenses: true, inventoryItem: true },
      orderBy: { saleDate: "desc" },
    }),
    prisma.expense.findMany({
      where: expenseWhereClause,
    }),
  ]);

  const serializedStats = {
    _count: inventoryStats?._count || 0,
    _sum: { purchasePrice: Number(inventoryStats?._sum?.purchasePrice || 0) },
  };

  const serializedSales = salesData.map((s) => ({
    ...s,
    salePrice: Number(s.salePrice),
    platformFee: Number(s.platformFee),
    shippingCost: Number(s.shippingCost),
    inventoryItem: {
      ...s.inventoryItem,
      purchasePrice: Number(s.inventoryItem.purchasePrice),
    },
  }));

  const serializedExpenses = expensesData.map((e) => ({
    ...e,
    amount: Number(e.amount),
  }));

  return { inventoryStats: serializedStats, salesData: serializedSales, expensesData: serializedExpenses };
}

export default function DashboardPage() {
  const { inventoryStats, salesData, expensesData } = useLoaderData<typeof loader>();
  return (
    <div className={styles.page}>
      <DashboardHeader />
      <AIInsightsPanel />
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
    </div>
  );
}
