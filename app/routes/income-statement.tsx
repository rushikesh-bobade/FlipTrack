import styles from "./income-statement.module.css";
import { StatementHeader } from "~/blocks/income-statement/statement-header";
import { SummaryCards } from "~/blocks/income-statement/summary-cards";
import { MonthlyBreakdownChart } from "~/blocks/income-statement/monthly-breakdown-chart";
import { ExpenseCategoryBreakdown } from "~/blocks/income-statement/expense-category-breakdown";
import { DetailedStatementTable } from "~/blocks/income-statement/detailed-statement-table";
import { ExportOptions } from "~/blocks/income-statement/export-options";

import type { Route } from "./+types/income-statement";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "react-router";
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

  if (!user) return { sales: [], expenses: [] };

  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { inventoryItem: true },
      orderBy: { saleDate: "asc" },
    }),
    prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    }),
  ]);

  const serializedSales = sales.map((s) => ({
    ...s,
    salePrice: Number(s.salePrice),
    platformFee: Number(s.platformFee),
    shippingCost: Number(s.shippingCost),
    inventoryItem: {
      ...s.inventoryItem,
      purchasePrice: Number(s.inventoryItem.purchasePrice),
    },
  }));

  const serializedExpenses = expenses.map((e) => ({
    ...e,
    amount: Number(e.amount),
  }));

  return { sales: serializedSales, expenses: serializedExpenses };
}

export default function IncomeStatementPage() {
  const { sales, expenses } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <StatementHeader />
      <SummaryCards sales={sales} expenses={expenses} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "var(--space-6)",
          marginBottom: "var(--space-6)",
        }}
      >
        <MonthlyBreakdownChart sales={sales} expenses={expenses} />
        <ExpenseCategoryBreakdown expenses={expenses} />
      </div>
      <DetailedStatementTable sales={sales} expenses={expenses} />
      <ExportOptions />
    </div>
  );
}
