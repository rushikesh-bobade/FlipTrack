import { useState } from "react";
import type { Route } from "./+types/price-alerts";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient, Marketplace, AlertDirection, NotificationChannel } from "@prisma/client";
import { useLoaderData, useSubmit } from "react-router";
import styles from "./price-alerts.module.css";
import { AlertsHeader } from "~/blocks/price-alerts/alerts-header";
import { PlanLimitWarning } from "~/blocks/price-alerts/plan-limit-warning";
import { CreateAlertForm } from "~/blocks/price-alerts/create-alert-form";
import { ActiveAlertsTable } from "~/blocks/price-alerts/active-alerts-table";
import { AlertHistory } from "~/blocks/price-alerts/alert-history";

interface AlertHistoryItem {
  id: string;
  sku: string;
  size: string;
  productName: string;
  marketplace: Marketplace;
  targetPrice: number;
  direction: AlertDirection;
  notificationChannel: NotificationChannel;
  isActive: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
  userId: string;
}

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { alerts: [] };

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return { alerts: alerts.map(a => ({ ...a, targetPrice: Number(a.targetPrice) })) };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const sku = formData.get("sku") as string;
    const size = formData.get("size") as string;
    const productName = formData.get("productName") as string;
    const marketplace = formData.get("marketplace") as Marketplace;
    const targetPrice = Number(formData.get("targetPrice"));
    const direction = formData.get("direction") as AlertDirection;
    const channel = formData.get("channel") as NotificationChannel;

    await prisma.priceAlert.create({
      data: {
        userId: user.id,
        sku, size, productName, marketplace, targetPrice, direction, notificationChannel: channel
      }
    });
  } else if (intent === "toggle") {
    const id = formData.get("id") as string;
    const isActive = formData.get("isActive") === "true";
    await prisma.priceAlert.update({
      where: { id, userId: user.id },
      data: { isActive: !isActive } // Toggle
    });
  } else if (intent === "delete") {
    const id = formData.get("id") as string;
    await prisma.priceAlert.delete({ where: { id, userId: user.id } });
  }

  return null;
}

export default function PriceAlertsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { alerts } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <AlertsHeader onCreateAlert={() => setShowCreate(true)} />
      <PlanLimitWarning />
      {showCreate && <CreateAlertForm onClose={() => setShowCreate(false)} />}
      <ActiveAlertsTable alerts={alerts} />
      <AlertHistory alerts={alerts.filter((a): a is AlertHistoryItem => Boolean(a.triggeredAt))} />
    </div>
  );
}
