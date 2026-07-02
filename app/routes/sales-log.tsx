import { useState, useEffect } from "react";
import { useLoaderData, useActionData } from "react-router";
import type { Route } from "./+types/sales-log";
import { toast } from "sonner";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./sales-log.module.css";
import { SalesHeader } from "~/blocks/sales-log/sales-header";
import { SalesSummaryCards } from "~/blocks/sales-log/sales-summary-cards";
import { SalesTable } from "~/blocks/sales-log/sales-table";
import { LogSaleModal } from "~/blocks/sales-log/log-sale-modal";
import { DeleteSaleModal } from "~/blocks/sales-log/delete-sale-modal";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { sales: [], inventory: [] };

  const [sales, inventory] = await Promise.all([
    prisma.sale.findMany({
      where: { userId: user.id },
      include: { inventoryItem: true },
      orderBy: { saleDate: "desc" },
    }),
    prisma.inventoryItem.findMany({
      where: { userId: user.id, status: "IN_STOCK" },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  console.log("Logged in user:");
console.log(user.id, user.email);

const allSales = await prisma.sale.findMany({
  select: {
    id: true,
    userId: true,
  },
});

console.log("All sales:", allSales);

console.log("Filtered sales:", sales);
  const serializedSales = sales.map((sale) => ({
  ...sale,
  salePrice: Number(sale.salePrice.toString()),
  inventoryItem: {
    ...sale.inventoryItem,
    purchasePrice: Number(sale.inventoryItem.purchasePrice.toString()),
  },
}));

return {
  sales: serializedSales,
  inventory,
};
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
    if (intent === "delete") {
    const saleId = formData.get("saleId") as string;

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale) {
      return { ok: false };
    }

    await prisma.$transaction([
      prisma.sale.delete({
        where: { id: saleId },
      }),
      prisma.inventoryItem.update({
        where: { id: sale.inventoryItemId },
        data: {
          status: "IN_STOCK",
        },
      }),
    ]);

    return { ok: true, intent: "delete" };
  }
  return { ok: true, intent };
}

export default function SalesLogPage() {
  const { sales, inventory } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showLogSale, setShowLogSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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
      <SalesSummaryCards sales={sales} />
      
<SalesTable
  sales={sales}
  onEdit={(sale) => {
    setSelectedSale(sale);
    setShowEdit(true);
    console.log("EDIT CLICKED:", sale);
  }}
  onDelete={(sale) => {
    setSelectedSale(sale);
    setShowDelete(true);
    console.log("DELETE CLICKED:", sale);
  }}
/>
{showLogSale && (
  <LogSaleModal
    inventory={inventory}
    onClose={() => setShowLogSale(false)}
  />
)}

{showDelete && selectedSale && (
  <DeleteSaleModal
    saleId={selectedSale.id}
    onClose={() => setShowDelete(false)}
  />
)}
      {showLogSale && <LogSaleModal inventory={inventory} onClose={() => setShowLogSale(false)} />}
    </div>
  );
}
