import { useState, useEffect } from "react";
import { useLoaderData, useActionData, useSearchParams } from "react-router";
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
import { Pagination } from "~/blocks/__global/pagination";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { items: [], totalPages: 0 };

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Number(url.searchParams.get("pageSize")) || 10;
  const q = url.searchParams.get("q") || "";
const status = url.searchParams.get("status") || "ALL";
const condition = url.searchParams.get("condition") || "ALL";

  const whereClause = {
  userId: user.id,

  ...(q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { sku: { contains: q, mode: "insensitive" as const } },
          { brand: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}),

  ...(status !== "ALL"
    ? {
        status,
      }
    : {}),

  ...(condition !== "ALL"
    ? {
        condition,
      }
    : {}),
};

  const [totalItems, items] = await Promise.all([
    prisma.inventoryItem.count({ where: whereClause }),
    prisma.inventoryItem.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        priceHistory: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  const formattedItems = items.map((item) => ({
    ...item,
    marketValue: item.priceHistory[0]?.askPrice ? Number(item.priceHistory[0].askPrice) : null,
  }));

  return { items: formattedItems, totalPages: Math.ceil(totalItems / pageSize) };
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
  }

  return { ok: true, intent };
}

export default function InventoryManagementPage() {
  const { items, totalPages } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  

const [searchParams, setSearchParams] = useSearchParams();

const searchQuery = searchParams.get("q") || "";
const statusFilter = searchParams.get("status") || "ALL";
const conditionFilter = searchParams.get("condition") || "ALL";
const setStatusFilter = (status: string) => {
  const nextParams = new URLSearchParams(searchParams);

  if (status === "ALL") {
    nextParams.delete("status");
  } else {
    nextParams.set("status", status);
  }

  nextParams.set("page", "1");
  setSearchParams(nextParams, { replace: true });
};

const setConditionFilter = (condition: string) => {
  const nextParams = new URLSearchParams(searchParams);

  if (condition === "ALL") {
    nextParams.delete("condition");
  } else {
    nextParams.set("condition", condition);
  }

  nextParams.set("page", "1");
  setSearchParams(nextParams, { replace: true });
};

const setSearchQuery = (query: string) => {
  const nextParams = new URLSearchParams(searchParams);

  if (query) {
    nextParams.set("q", query);
  } else {
    nextParams.delete("q");
  }

  nextParams.set("page", "1");
  setSearchParams(nextParams, { replace: true });
};

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
      } else if (actionData.intent === "bulk-mark-sold") {
        toast.success("Items marked as sold");
        setSelected([]);
      }
    }
  }, [actionData]);

const filteredItems = items.filter((item) => {
  const matchesStatus =
    statusFilter === "ALL" || item.status === statusFilter;

  const matchesCondition =
    conditionFilter === "ALL" || item.condition === conditionFilter;

  return matchesStatus && matchesCondition;
});
  return (
    <div className={styles.page}>
      
      <InventoryHeader
  onAddItem={() => setShowAddItem(true)}
  onImport={() => setShowImport(true)}
  searchQuery={searchQuery}
  onSearch={setSearchQuery}
  statusFilter={statusFilter}
  conditionFilter={conditionFilter}
  onStatusChange={setStatusFilter}
  onConditionChange={setConditionFilter}
/>
      {selected.length > 0 && (
        <BulkActionsBar count={selected.length} onClear={() => setSelected([])} selectedIds={selected} items={items} />
      )}
      <InventoryTable
  selected={selected}
  onSelectChange={setSelected}
  items={filteredItems}
  onEdit={setEditingItem}
/>
      <Pagination totalPages={totalPages} />
      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} />}
      {editingItem && <AddItemModal item={editingItem} onClose={() => setEditingItem(null)} />}
      {showImport && <ImportExcelModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
