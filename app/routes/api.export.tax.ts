import type { Route } from "./+types/api.export.tax";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const year = url.searchParams.get("year") || new Date().getFullYear().toString();
  
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year}-12-31T23:59:59Z`);

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode("Type,Date,Description,Category,Amount,COGS,Net Impact\n"));
      
      const take = 100;
      let skipSales = 0;
      while (true) {
        const sales = await prisma.sale.findMany({
          where: { 
            userId: user.id,
            saleDate: { gte: startDate, lte: endDate }
          },
          include: { inventoryItem: true },
          orderBy: { saleDate: 'asc' },
          skip: skipSales,
          take
        });
        if (sales.length === 0) break;
        
        let chunk = "";
        sales.forEach(s => {
          const revenue = Number(s.salePrice);
          const cogs = Number(s.inventoryItem.purchasePrice);
          const net = revenue - cogs;
          chunk += `Sale,${s.saleDate.toISOString().split('T')[0]},"${s.inventoryItem.name} (${s.inventoryItem.sku})",${s.marketplace},${revenue},${cogs},${net}\n`;
        });
        controller.enqueue(new TextEncoder().encode(chunk));
        skipSales += take;
      }

      let skipExpenses = 0;
      while (true) {
        const expenses = await prisma.expense.findMany({
          where: { 
            userId: user.id,
            date: { gte: startDate, lte: endDate }
          },
          orderBy: { date: 'asc' },
          skip: skipExpenses,
          take
        });
        if (expenses.length === 0) break;
        
        let chunk = "";
        expenses.forEach(e => {
          const amount = Number(e.amount);
          chunk += `Expense,${e.date.toISOString().split('T')[0]},"${e.description || ''}",${e.type},0,0,-${amount}\n`;
        });
        controller.enqueue(new TextEncoder().encode(chunk));
        skipExpenses += take;
      }
      
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="fliptrack_tax_report_${year}.csv"`,
    }
  });
}
