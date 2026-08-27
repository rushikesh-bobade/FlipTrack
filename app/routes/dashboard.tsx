import { Suspense } from "react";
import { useLoaderData, Await } from "react-router";
import type { Route } from "./+types/dashboard";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import { Prisma } from "@prisma/client";
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
import { prisma } from "~/utils/db.server";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PRIVATE_NO_STORE,
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
        statsCardsData: { activeInventoryCount: 0, activeInventoryCost: 0, totalRevenue: 0, totalGrossProfit: 0, totalExpenses: 0, roi: 0 },
        cashFlowChartData: [] as any[],
        topBrandsChartData: [] as any[],
        salesByMarketplaceChartData: [] as any[],
        expenseCategoriesChartData: [] as any[],
        topSellingItemsData: [] as any[],
        recentSalesData: [] as any[]
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
  });

  // Fetch only necessary fields to reduce memory
  const rawSalesPromise = prisma.sale.findMany({
    where: saleWhereClause,
    select: {
      id: true,
      saleDate: true,
      salePrice: true,
      platformFee: true,
      shippingCost: true,
      marketplace: true,
      inventoryItem: {
        select: {
          id: true,
          name: true,
          sku: true,
          brand: true,
          purchasePrice: true
        }
      }
    },
    orderBy: { saleDate: "desc" },
  });

  const rawExpensesPromise = prisma.expense.findMany({
    where: expenseWhereClause,
    select: {
      id: true,
      date: true,
      amount: true,
      category: true,
    }
  });

  const deferredData = Promise.all([statsPromise, rawSalesPromise, rawExpensesPromise]).then(
    ([inventoryStats, rawSales, rawExpenses]) => {
      
      // Calculate StatsCardsRow data
      const activeInventoryCount = inventoryStats._count || 0;
      const activeInventoryCost = Number(inventoryStats._sum?.purchasePrice || 0);
      
      let totalRevenue = 0;
      let totalGrossProfit = 0;
      let totalExpenses = 0;
      
      rawSales.forEach(s => {
        totalRevenue += Number(s.salePrice);
        const profit = Number(s.salePrice) - Number(s.inventoryItem.purchasePrice) - Number(s.platformFee) - Number(s.shippingCost);
        totalGrossProfit += profit;
      });
      
      rawExpenses.forEach(e => {
        totalExpenses += Number(e.amount);
      });
      
      const roi = (activeInventoryCost + totalExpenses) > 0 
        ? ((totalGrossProfit - totalExpenses) / (activeInventoryCost + totalExpenses)) * 100 
        : 0;

      const statsCardsData = {
        activeInventoryCount,
        activeInventoryCost,
        totalRevenue,
        totalGrossProfit,
        totalExpenses,
        roi
      };

      // Calculate CashFlowChart data
      const cashFlowGroups: Record<string, { revenue: number, profit: number }> = {};
      rawSales.forEach(s => {
        const dateStr = s.saleDate.toISOString().split("T")[0];
        const profit = Number(s.salePrice) - Number(s.inventoryItem.purchasePrice) - Number(s.platformFee) - Number(s.shippingCost);
        if (!cashFlowGroups[dateStr]) cashFlowGroups[dateStr] = { revenue: 0, profit: 0 };
        cashFlowGroups[dateStr].revenue += Number(s.salePrice);
        cashFlowGroups[dateStr].profit += profit;
      });

      const cashFlowChartData = Object.keys(cashFlowGroups)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map(date => ({
          name: date,
          Revenue: cashFlowGroups[date].revenue,
          Profit: cashFlowGroups[date].profit
        }));

      // Calculate TopBrandsChart data
      const brandGroups: Record<string, number> = {};
      rawSales.forEach(s => {
        const brand = s.inventoryItem.brand || "Unbranded";
        if (!brandGroups[brand]) brandGroups[brand] = 0;
        brandGroups[brand]++;
      });
      const topBrandsChartData = Object.keys(brandGroups)
        .map(name => ({ name, value: brandGroups[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Calculate SalesByMarketplacePie data
      const marketplaceGroups: Record<string, number> = {};
      rawSales.forEach(s => {
        const mp = s.marketplace.replace(/_/g, " ");
        if (!marketplaceGroups[mp]) marketplaceGroups[mp] = 0;
        marketplaceGroups[mp]++;
      });
      const salesByMarketplaceChartData = Object.keys(marketplaceGroups)
        .map(name => ({
          name,
          value: Math.round((marketplaceGroups[name] / (rawSales.length || 1)) * 100)
        }))
        .sort((a, b) => b.value - a.value);

      // Calculate ExpenseCategoriesChart data
      const expenseCatGroups: Record<string, number> = {};
      rawExpenses.forEach(e => {
        const cat = String(e.category || "OTHER").replace(/_/g, " ");
        if (!expenseCatGroups[cat]) expenseCatGroups[cat] = 0;
        expenseCatGroups[cat] += Number(e.amount);
      });
      const expenseCategoriesChartData = Object.keys(expenseCatGroups)
        .map(name => ({
          name,
          value: expenseCatGroups[name]
        }))
        .sort((a, b) => b.value - a.value);

      // Calculate TopSellingItemsTable data
      const itemStats: Record<string, { id: string, name: string, sold: number, profit: number, revenue: number }> = {};
      rawSales.forEach(s => {
        const sku = s.inventoryItem.sku;
        const profit = Number(s.salePrice) - Number(s.inventoryItem.purchasePrice) - Number(s.platformFee) - Number(s.shippingCost);
        if (!itemStats[sku]) {
          itemStats[sku] = { id: s.inventoryItem.id, name: s.inventoryItem.name, sold: 0, profit: 0, revenue: 0 };
        }
        itemStats[sku].sold++;
        itemStats[sku].profit += profit;
        itemStats[sku].revenue += Number(s.salePrice);
      });
      const topSellingItemsData = Object.values(itemStats)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5);

      // Recent Sales (take 5)
      const recentSalesData = rawSales.slice(0, 5).map(s => ({
        ...s,
        salePrice: Number(s.salePrice),
        platformFee: Number(s.platformFee),
        shippingCost: Number(s.shippingCost),
        inventoryItem: {
          ...s.inventoryItem,
          purchasePrice: Number(s.inventoryItem.purchasePrice),
        }
      }));

      return {
        statsCardsData,
        cashFlowChartData,
        topBrandsChartData,
        salesByMarketplaceChartData,
        expenseCategoriesChartData,
        topSellingItemsData,
        recentSalesData
      };
    }
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
          {({ 
            statsCardsData, 
            cashFlowChartData, 
            topBrandsChartData, 
            salesByMarketplaceChartData, 
            expenseCategoriesChartData, 
            topSellingItemsData, 
            recentSalesData 
          }) => (
            <>
              <StatsCardsRow {...statsCardsData} />
              <CashFlowChart chartData={cashFlowChartData} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--space-6)",
                  marginBottom: "var(--space-6)",
                }}
              >
                <TopBrandsChart chartData={topBrandsChartData} />
                <SalesByMarketplacePie chartData={salesByMarketplaceChartData} />
                <ExpenseCategoriesChart chartData={expenseCategoriesChartData} />
              </div>
              <TopSellingItemsTable items={topSellingItemsData} />
              <RecentSales sales={recentSalesData} />
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

