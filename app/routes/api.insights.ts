import type { Route } from "./+types/api.insights";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

const prisma = new PrismaClient();

export async function action({ request }: Route.ActionArgs) {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    // 1. Gather User's data for the prompt
    const [sales, inventory, expenses] = await Promise.all([
      prisma.sale.findMany({ where: { userId: user.id }, include: { inventoryItem: true }, orderBy: { saleDate: 'desc' }, take: 100 }),
      prisma.inventoryItem.findMany({ where: { userId: user.id, status: 'IN_STOCK' } }),
      prisma.expense.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 50 }),
    ]);

    let totalRevenue = 0;
    let totalCostOfSold = 0;
    sales.forEach(s => {
      totalRevenue += Number(s.salePrice);
      totalCostOfSold += Number(s.inventoryItem.purchasePrice) + Number(s.platformFee) + Number(s.shippingCost);
    });
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const netProfit = totalRevenue - totalCostOfSold - totalExpenses;
    const inventoryValue = inventory.reduce((acc, item) => acc + Number(item.purchasePrice), 0);

    const promptData = `
    Business Summary:
    Total Revenue: $${totalRevenue.toFixed(2)}
    Net Profit: $${netProfit.toFixed(2)}
    Current Inventory Value: $${inventoryValue.toFixed(2)} (Count: ${inventory.length})

    Recent Sales: ${sales.slice(0, 5).map(s => `${s.inventoryItem.name} sold for $${s.salePrice} on ${s.marketplace}`).join(", ")}
    Recent Expenses: ${expenses.slice(0, 5).map(e => `$${e.amount} for ${e.type}`).join(", ")}
    `;

    const systemPrompt = `You are an expert AI business coach for a sneaker and streetwear reseller. 
    Analyze the user's business metrics and provide 3 concise, actionable bullet points of advice to improve their margins, cash flow, or operations. Keep it punchy, professional, and directly tied to their data. No fluff. Do not use markdown headers, just return a bulleted list.`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: promptData,
    });

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Insights Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate insights" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
