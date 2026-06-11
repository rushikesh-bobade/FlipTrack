import { useState, useEffect } from "react";
import { useLoaderData, useActionData } from "react-router";
import type { Route } from "./+types/inventory-management";
import { toast } from "sonner";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./inventory-management.module.css";
import { InventoryHeader } from "~/blocks/inventory-management/inventory-header";
import { InventoryTable } from "~/blocks/inventory-management/inventory-table";
import { BulkActionsBar } from "~/blocks/inventory-management/bulk-actions-bar";
import { AddItemModal } from "~/blocks/inventory-management/add-item-modal";
import { ImportExcelModal } from "~/blocks/inventory-management/import-excel-modal";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { items: [] };

  const items = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      priceHistory: {
        orderBy: { fetchedAt: "desc" },
        take: 1
      }
    }
  });

  const formattedItems = items.map(item => ({
    ...item,
    marketValue: item.priceHistory[0]?.askPrice ? Number(item.priceHistory[0].askPrice) : null,
  }));

  return { items: formattedItems };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string;
    const size = formData.get("size") as string;
    const purchasePrice = Number(formData.get("purchasePrice"));

    await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        sku,
        name,
        brand,
        size,
        purchasePrice,
        purchaseDate: new Date(),
        condition: "DEADSTOCK",
        status: "IN_STOCK",
      }
    });
  } else if (intent === "update") {
    const itemId = formData.get("itemId") as string;
    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string;
    const size = formData.get("size") as string;
    const purchasePrice = Number(formData.get("purchasePrice"));
    
    await prisma.inventoryItem.update({
      where: { id: itemId, userId: user.id },
      data: {
        sku,
        name,
        brand,
        size,
        purchasePrice,
      }
    });
  } else if (intent === "bulk-delete") {
    const ids = formData.getAll("id");
    await prisma.inventoryItem.deleteMany({
      where: { id: { in: ids }, userId: user.id }
    });
  } else if (intent === "bulk-mark-sold") {
    const ids = formData.getAll("id");
    await prisma.inventoryItem.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { status: "SOLD" }
    });
  } else if (intent === "export-csv") {
    const ids = formData.getAll("id");
    const items = await prisma.inventoryItem.findMany({
      where: { id: { in: ids }, userId: user.id },
      include: {
        priceHistory: {
          orderBy: { fetchedAt: "desc" },
          take: 1
        }
      }
    });

    const csvContent = items.map(item => {
      return [
        item.sku,
        item.name,
        item.brand,
        item.size,
        item.purchasePrice,
        item.marketValue,
      ].join(",");
    }).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
  }
}