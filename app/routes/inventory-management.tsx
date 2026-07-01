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
        // other fields could be updated here
      }
    });
  } else if (intent === "delete") {
    const itemId = formData.get("itemId") as string;
    await prisma.inventoryItem.delete({
      where: { id: itemId, userId: user.id } // Ensures the user owns the item
    });
  } else if (intent === "bulk-delete") {
    const ids = formData.getAll("ids") as string[];
    await prisma.inventoryItem.deleteMany({
      where: { id: { in: ids }, userId: user.id }
    });
  } else if (intent === "bulk-mark-sold") {
    const ids = formData.getAll("ids") as string[];
    await prisma.inventoryItem.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { status: "SOLD" }
    });
  } else if (intent === "import") {
    const raw = formData.get("items") as string;
    if (!raw) return { ok: false, intent, error: "No items data received." };

    const items: Record<string, unknown>[] = JSON.parse(raw);
    let imported = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const sku = String(row.sku ?? "").trim();
      const name = String(row.name ?? "").trim();
      const brand = String(row.brand ?? "").trim();
      const size = String(row.size ?? "").trim();
      const purchasePrice = parseFloat(String(row.purchasePrice ?? ""));

      if (!sku || !name || !brand || !size || isNaN(purchasePrice)) {
        errors.push({ row: i + 1, message: "Missing required fields (sku, name, brand, size, purchasePrice)" });
        continue;
      }

      try {
        await prisma.inventoryItem.create({
          data: {
            userId: user.id,
            sku,
            name,
            brand,
            size,
            purchasePrice,
            purchaseDate: row.purchaseDate
              ? new Date(String(row.purchaseDate))
              : new Date(),
            condition: (String(row.condition ?? "DEADSTOCK").toUpperCase().replace(/ /g, "_") as any) || "DEADSTOCK",
            status: (String(row.status ?? "IN_STOCK").toUpperCase().replace(/ /g, "_") as any) || "IN_STOCK",
            colorway: String(row.colorway ?? "") || undefined,
            marketplace: (String(row.marketplace ?? "").toUpperCase().replace(/ /g, "_") as any) || undefined,
            askingPrice: row.askingPrice ? parseFloat(String(row.askingPrice)) : undefined,
            notes: String(row.notes ?? "") || undefined,
            currency: (String(row.currency ?? "USD").toUpperCase() as any) || undefined,
            tags: row.tags ? String(row.tags).split(",").map((t) => t.trim()).filter(Boolean) : [],
          },
        });
        imported++;
      } catch (err: any) {
        if (err?.code === "P2002") {
          errors.push({ row: i + 1, message: `Duplicate SKU + size combination: ${sku} / ${size}` });
        } else {
          errors.push({ row: i + 1, message: err?.message || "Unknown error" });
        }
      }
    }

    return { ok: true, intent, imported, total: items.length, errors };
  }

  return { ok: true, intent };
}

export default function InventoryManagementPage() {
  const { items } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (actionData?.ok) {
      if (actionData.intent === "create") {
        toast.success("Item added successfully");
        setShowAddItem(false);
      } else if (actionData.intent === "update") {
        toast.success("Item updated");
        setEditingItem(null);
      } else if (actionData.intent === "delete") {
        toast.success("Item deleted");
      } else if (actionData.intent === "bulk-delete") {
        toast.success("Items deleted successfully");
        setSelected([]);
      }       else if (actionData.intent === "bulk-mark-sold") {
        toast.success("Items marked as sold");
        setSelected([]);
      } else if (actionData.intent === "import") {
        const d = actionData as any;
        if (d.imported > 0) {
          toast.success(`${d.imported} of ${d.total} items imported successfully`);
        }
        if (d.errors?.length > 0) {
          toast.error(`${d.errors.length} rows failed — check console for details`);
          console.warn("Import errors:", d.errors);
        }
        setShowImport(false);
      }
    }
  }, [actionData]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (item.name?.toLowerCase() || "").includes(lowerQuery) ||
      (item.sku?.toLowerCase() || "").includes(lowerQuery) ||
      (item.brand?.toLowerCase() || "").includes(lowerQuery)
    );
  });

  return (
    <div className={styles.page}>
      <InventoryHeader
        onAddItem={() => setShowAddItem(true)}
        onImport={() => setShowImport(true)}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
      {selected.length > 0 && (
        <BulkActionsBar count={selected.length} onClear={() => setSelected([])} selectedIds={selected} items={items} />
      )}
      <InventoryTable selected={selected} onSelectChange={setSelected} items={filteredItems} onEdit={setEditingItem} />
      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} />}
      {editingItem && <AddItemModal item={editingItem} onClose={() => setEditingItem(null)} />}
      {showImport && <ImportExcelModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
