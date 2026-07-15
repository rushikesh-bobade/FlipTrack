import { Suspense } from "react";
import { useLoaderData, Await } from "react-router";
import type { Route } from "./+types/income-statement";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./income-statement.module.css";
import { StatementHeader } from "~/blocks/income-statement/statement-header";
import { SummaryCards } from "~/blocks/income-statement/summary-cards";
import { MonthlyBreakdownChart } from "~/blocks/income-statement/monthly-breakdown-chart";
import { ExpenseCategoryBreakdown } from "~/blocks/income-statement/expense-category-breakdown";
import { DetailedStatementTable } from "~/blocks/income-statement/detailed-statement-table";
import { ExportOptions } from "~/blocks/income-statement/export-options";
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

  if (!user) return {
    deferredData: Promise.resolve({ sales: [] as any[], expenses: [] as any[] }),
  };

  const salesPromise = prisma.sale.findMany({
    where: { userId: user.id },
    include: { inventoryItem: true },
    orderBy: { saleDate: "asc" },
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
    where: { userId: user.id },
    orderBy: { date: "asc" },
  }).then((expenses) =>
    expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
    }))
  );

  const deferredData = Promise.all([salesPromise, expensesPromise]).then(([serializedSales, serializedExpenses]) => ({
    sales: serializedSales,
    expenses: serializedExpenses,
  }));

  return { deferredData };
}

export default function IncomeStatementPage() {
  const { deferredData } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <StatementHeader />
      <Suspense
        fallback={
          <div className={styles.loadingContainer}>
            <IconLoader2 size={32} className={styles.spin} />
            <span>Loading statement data...</span>
          </div>
        }
      >
        <Await resolve={deferredData}>
          {({ sales, expenses }) => (
            <>
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
            </>
          )}
        </Await>
      </Suspense>
      <ExportOptions />
    </div>
  );
}
