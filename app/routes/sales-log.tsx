import { Suspense, useState, useEffect } from "react";
import { useLoaderData, useActionData, Await } from "react-router";
import type { Route } from "./+types/sales-log";
import { toast } from "sonner";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./sales-log.module.css";
import { SalesHeader } from "~/blocks/sales-log/sales-header";
import { SalesSummaryCards } from "~/blocks/sales-log/sales-summary-cards";
import { SalesTable } from "~/blocks/sales-log/sales-table";
import { SalesTableSkeleton } from "~/blocks/sales-log/sales-log-skeleton";
import { LogSaleModal } from "~/blocks/sales-log/log-sale-modal";
import { Skeleton } from "~/blocks/__global/skeleton";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { salesData: Promise.resolve({ sales: [], inventory: [] }) };

  const salesData = Promise.all([
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { inventoryItem: true },
      orderBy: { saleDate: "desc" },
    }),
    prisma.inventoryItem.findMany({
      where: { userId: user.id, status: "IN_STOCK" },
      orderBy: { createdAt: "desc" },
    }),
  ]).then(([sales, inventory]) => ({ sales, inventory }));

  return { salesData };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const inventoryItemId = formData.get("inventoryItemId") as string;
    const salePrice = Number(formData.get("salePrice"));
    const saleDate = new Date(formData.get("saleDate") as string);
    const marketplace = formData.get("marketplace") as any;
    const trackingNumber = formData.get("trackingNumber") as string;

    await prisma.$transaction([
      prisma.sale.create({
        data: {
          userId: user.id,
          inventoryItemId,
          salePrice,
          saleDate,
          marketplace,
          trackingNumber,
        }
      }),
      prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { status: "SOLD" }
      })
    ]);
  }

  return { ok: true, intent };
}

export default function SalesLogPage() {
  const { salesData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showLogSale, setShowLogSale] = useState(false);

  useEffect(() => {
    if (actionData?.ok) {
      if (actionData.intent === "create") {
        toast.success("Sale logged successfully");
        setShowLogSale(false);
      }
    }
  }, [actionData]);

  return (
    <div className={styles.page}>
      <SalesHeader onLogSale={() => setShowLogSale(true)} />
      <Suspense fallback={
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Skeleton width="100%" height="80px" />
          <SalesTableSkeleton />
        </div>
      }>
        <Await resolve={salesData}>
          {({ sales, inventory }) => (
            <>
              <SalesSummaryCards sales={sales} />
              <SalesTable sales={sales} />
              {showLogSale && <LogSaleModal inventory={inventory} onClose={() => setShowLogSale(false)} />}
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}