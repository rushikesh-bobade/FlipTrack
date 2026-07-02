import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import type { Route } from "./+types/api.ai.insights";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    const body = await request.json();
    const rawInventory = body.inventory ? JSON.parse(body.inventory) : [];

    if (rawInventory.length === 0) {
      return new Response(JSON.stringify({ insights: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const insights = [];

    // FIX 2: Using for...of loop to process sequentially and avoid Groq 429 Rate Limits
    for (const item of rawInventory) {
      try {
        // FIX 1: Removed simulated array, using actual item.priceHistory from Prisma loader
        const actualPriceHistory = item.priceHistory || [];

        const { text } = await generateText({
          model: groq('llama-3.3-70b-versatile'),
          system: `You are an expert sneaker reseller analyst. Analyze price data and provide actionable insights.
                   Always respond with pure JSON in this exact format: {"trend": "string", "recommendation": "BUY"|"SELL"|"HOLD", "reasoning": "string", "targetPrice": number, "confidence": number}`,
          prompt: `
            Product: ${item.name} (SKU: ${item.sku})
            Price history (from DB): ${JSON.stringify(actualPriceHistory)}
            User's purchase price: ${item.purchasePrice}
            
            Provide a price trend analysis and buy/sell/hold recommendation based on the data.
          `,
        });

        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedJson = JSON.parse(jsonStr);

        insights.push({
          id: item.id,
          name: item.name,
          sku: item.sku,
          purchasePrice: Number(item.purchasePrice),
          recommendation: parsedJson.recommendation || "HOLD",
          confidence: parsedJson.confidence || 0.8,
          reasoning: parsedJson.reasoning || parsedJson.trend || "Analysis complete.",
          targetPrice: parsedJson.targetPrice || Number(item.purchasePrice) * 1.2,
        });
      } catch (err) {
        console.error(`Error analyzing item ${item.sku}:`, err);
        // Fallback item so the whole loop doesn't crash if one item fails
        insights.push({
          id: item.id,
          name: item.name,
          sku: item.sku,
          purchasePrice: Number(item.purchasePrice),
          recommendation: "HOLD",
          confidence: 0.5,
          reasoning: "AI engine analysis failed temporarily.",
          targetPrice: Number(item.purchasePrice),
        });
      }
    }

    return new Response(JSON.stringify({ insights }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("API Action handling error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}