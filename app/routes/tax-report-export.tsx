import { useLoaderData } from "react-router";
import type { Route } from "./+types/tax-report-export";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./tax-report-export.module.css";
import { TaxReportHeader } from "~/blocks/tax-report-export/tax-report-header";
import { ReportGenerator } from "~/blocks/tax-report-export/report-generator";
import { ReportPreview } from "~/blocks/tax-report-export/report-preview";
import { ExportOptions } from "~/blocks/tax-report-export/export-options";
import { ReportHistory } from "~/blocks/tax-report-export/report-history";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { sales: [], expenses: [] };

  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { inventoryItem: true },
      orderBy: { saleDate: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
  ]);

  const serializedSales = sales.map(s => {
    const salePrice = Number(s.salePrice);
    const purchasePrice = Number(s.inventoryItem.purchasePrice);
    const profit = salePrice - purchasePrice;
    return {
      id: s.id,
      item: s.inventoryItem.name,
      salePrice,
      marketplace: s.marketplace,
      date: s.saleDate.toISOString().slice(0, 10),
      profit,
      margin: salePrice > 0 ? Math.round((profit / salePrice) * 100) : 0,
    };
  });

  const serializedExpenses = expenses.map(e => ({
    ...e,
    amount: Number(e.amount),
  }));

  return { sales: serializedSales, expenses: serializedExpenses };
}

export default function TaxReportExportPage() {
  const { sales, expenses } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <TaxReportHeader />
      <ReportGenerator />
      <ReportPreview sales={sales} expenses={expenses} />
      <ExportOptions />
      <ReportHistory />
    </div>
  );
}
