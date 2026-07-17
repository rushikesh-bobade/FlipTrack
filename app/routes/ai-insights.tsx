import { useState, useEffect, Suspense } from "react";
import { useLoaderData, useFetcher, Await } from "react-router";
import type { Route } from "./+types/ai-insights";
import { PrismaClient } from "@prisma/client";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import styles from "./ai-insights.module.css";
import { AiInsightsHeader } from "~/blocks/ai-insights/ai-insights-header";
import { PlanGateMessage } from "~/blocks/ai-insights/plan-gate-message";
import { BatchAnalysisStatus } from "~/blocks/ai-insights/batch-analysis-status";
import { ItemAnalysisCards } from "~/blocks/ai-insights/item-analysis-cards";
import { DetailedAnalysisModal } from "~/blocks/ai-insights/detailed-analysis-modal";
import { IconLoader2 } from "@tabler/icons-react";

export interface AiInsightItem {
  id: string;
  name: string;
  sku: string;
  recommendation: 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  purchasePrice: number;
}

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const { supabase } = getSupabaseServerClient(request);
    const { data: { user } } = await getUserFromRequest(request, supabase);
    
    if (!user) {
      return { deferredData: Promise.resolve([] as any[]) };
    }

    const deferredData = prisma.inventoryItem.findMany({
      where: { userId: user.id },
      include: {
        priceHistory: true 
      }
    });

    return { deferredData };
  } catch (error) {
    console.error("Failed to load inventory for insights:", error);
    return { deferredData: Promise.resolve([] as any[]) };
  }
}

interface PageContentProps {
  inventory: any[];
}

function AiInsightsPageContent({ inventory }: PageContentProps) {
  const fetcher = useFetcher();
  const [insights, setInsights] = useState<AiInsightItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const isPro = true; 

  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).insights) {
      setInsights((fetcher.data as any).insights);
      setAnalyzing(false);
    }
  }, [fetcher.data]);

  const triggerAiAnalysis = () => {
    setAnalyzing(true);
    fetcher.submit(
      { inventory: JSON.stringify(inventory) },
      { method: "POST", action: "/api/ai/insights", encType: "application/json" }
    );
  };

  return (
    <>
      <AiInsightsHeader onAnalyzeAll={triggerAiAnalysis} isPro={isPro} />
      {!isPro && <PlanGateMessage />}
      {isPro && (analyzing || fetcher.state === "submitting") && (
        <BatchAnalysisStatus onCancel={() => setAnalyzing(false)} />
      )}
      
      {isPro && <ItemAnalysisCards data={insights} onSelectItem={setSelectedItem} />}
      
      {selectedItem && (
        <DetailedAnalysisModal 
          itemId={selectedItem} 
          data={insights} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </>
  );
}

export default function AiInsightsPage() {
  const { deferredData } = useLoaderData<typeof loader>();
  
  return (
    <div className={styles.page}>
      <Suspense
        fallback={
          <div className={styles.loadingContainer}>
            <IconLoader2 size={32} className={styles.spin} />
            <span>Loading insights data...</span>
          </div>
        }
      >
        <Await resolve={deferredData}>
          {(inventory) => <AiInsightsPageContent inventory={inventory} />}
        </Await>
      </Suspense>
    </div>
  );
}