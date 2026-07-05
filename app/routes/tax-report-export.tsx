import { useLoaderData } from "react-router";
import type { Route } from "./+types/tax-report-export";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import { CACHE_PRIVATE_NO_STORE } from "~/utils/cache-headers";
import styles from "./tax-report-export.module.css";
import { TaxReportHeader } from "~/blocks/tax-report-export/tax-report-header";
import { ReportGenerator } from "~/blocks/tax-report-export/report-generator";
import { ReportPreview } from "~/blocks/tax-report-export/report-preview";
import { ExportOptions } from "~/blocks/tax-report-export/export-options";
import { ReportHistory } from "~/blocks/tax-report-export/report-history";

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

  const currentYear = new Date().getFullYear();

  if (!user) {
    return { sales: [], expenses: [], taxYear: currentYear };
  }

  const url = new URL(request.url);
  const taxYear = Number(url.searchParams.get("year")) || currentYear;

  const startDate = new Date(`${taxYear}-01-01T00:00:00Z`);
  const endDate = new Date(`${taxYear}-12-31T23:59:59Z`);

  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: {
        userId: user.id,
        saleDate: { gte: startDate, lte: endDate },
      },
      include: { inventoryItem: true },
      orderBy: { saleDate: "asc" },
    }),
    prisma.expense.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  // Serialize Prisma Decimal fields before passing to client components
  const serializedSales = sales.map((s) => ({
    ...s,
    salePrice: Number(s.salePrice),
    inventoryItem: {
      ...s.inventoryItem,
      purchasePrice: Number(s.inventoryItem.purchasePrice),
      askingPrice: s.inventoryItem.askingPrice
        ? Number(s.inventoryItem.askingPrice)
        : null,
    },
  }));

  const serializedExpenses = expenses.map((e) => ({
    ...e,
    amount: Number(e.amount),
  }));

  return { sales: serializedSales, expenses: serializedExpenses, taxYear };
}

export default function TaxReportExportPage() {
  const { sales, expenses, taxYear } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <TaxReportHeader />
      <ReportGenerator taxYear={taxYear} />
      <ReportPreview sales={sales} expenses={expenses} taxYear={taxYear} />
      <ExportOptions taxYear={taxYear} />
      <ReportHistory />
    </div>
  );
}
