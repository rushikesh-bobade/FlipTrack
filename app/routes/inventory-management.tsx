import { useState, useEffect, Suspense } from "react";
import { useLoaderData, useActionData, useSearchParams, Await } from "react-router";
import type { Route } from "./+types/inventory-management";
import { toast } from "sonner";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import { Prisma, PrismaClient, type Currency, type ItemCondition } from "@prisma/client";
import styles from "./inventory-management.module.css";
import { IconLoader2 } from "@tabler/icons-react";
import { InventoryHeader } from "~/blocks/inventory-management/inventory-header";
import { InventoryTable } from "~/blocks/inventory-management/inventory-table";
import { BulkActionsBar } from "~/blocks/inventory-management/bulk-actions-bar";
import { AddItemModal } from "~/blocks/inventory-management/add-item-modal";
import { ImportExcelModal } from "~/blocks/inventory-management/import-excel-modal";
import { Pagination } from "~/blocks/__global/pagination";
export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": "private, no-store",
  };
}

const prisma = new PrismaClient();

function parseSkippedRows(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [] as number[];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [] as number[];
    }

    return parsed
      .map((row) => Number(row))
      .filter((rowNumber) => Number.isInteger(rowNumber) && rowNumber > 0);
  } catch {
    return [] as number[];
  }
}

function normalizeImportedCondition(value: unknown): ItemCondition {
  const normalized = typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "") : "";

  switch (normalized) {
    case "new":
      return "NEW" as ItemCondition;
    case "likenew":
      return "LIKE_NEW" as ItemCondition;
    case "usedexcellent":
      return "USED_EXCELLENT" as ItemCondition;
    case "usedgood":
      return "USED_GOOD" as ItemCondition;
    case "usedfair":
      return "USED_FAIR" as ItemCondition;
    case "refurbished":
      return "REFURBISHED" as ItemCondition;
    case "damaged":
      return "DAMAGED" as ItemCondition;
    case "newwithbox":
      return "NEW_WITH_BOX" as ItemCondition;
    case "used":
      return "USED" as ItemCondition;
    case "deadstock":
    default:
      return "DEADSTOCK" as ItemCondition;
  }
}

function normalizeImportedCurrency(value: unknown): Currency {
  const currency = typeof value === "string" ? value.trim().toUpperCase() : "";

  switch (currency) {
    case "CAD":
    case "GBP":
    case "EUR":
    case "AUD":
    case "JPY":
    case "USD":
      return currency as Currency;
    default:
      return "USD" as Currency;
  }
}

function parseImportedPurchasePrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseImportedPurchaseDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date((value - 25569) * 86400 * 1000);
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function getImportedRowNumber(value: unknown, fallback: number) {
  if (typeof value !== "object" || value === null) {
    return fallback;
  }

  const rowNumber = Number((value as { rowNumber?: unknown }).rowNumber);
  return Number.isInteger(rowNumber) && rowNumber > 0 ? rowNumber : fallback;
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await getUserFromRequest(request, supabase);

  if (!user) {
    return {
      deferredData: Promise.resolve({ items: [] as any[], totalPages: 0 }),
    };
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Number(url.searchParams.get("pageSize")) || 10;
  const q = url.searchParams.get("q") || "";

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
  };

  const countPromise = prisma.inventoryItem.count({ where: whereClause });
  const itemsPromise = prisma.inventoryItem.findMany({
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
  }).then((items) =>
    items.map((item) => ({
      ...item,
      purchasePrice: Number(item.purchasePrice),
      marketValue: item.priceHistory[0]?.askPrice ? Number(item.priceHistory[0].askPrice) : null,
    }))
  );

  const deferredData = Promise.all([countPromise, itemsPromise]).then(([totalItems, formattedItems]) => ({
    items: formattedItems,
    totalPages: Math.ceil(totalItems / pageSize),
  }));

  return { deferredData };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await getUserFromRequest(request, supabase);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string;
    const size = formData.get("size") as string;
    const purchasePrice = Number(formData.get("purchasePrice"));
    const purchaseDate = formData.get("purchaseDate") as string;
    const condition = formData.get("condition") as ItemCondition;
    const colorway = formData.get("colorway") as string;
    const notes = formData.get("notes") as string;

    await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        sku,
        name,
        brand,
        size,
        purchasePrice,
        purchaseDate: new Date(purchaseDate),
        condition,
        color: colorway,
        notes,
        status: "IN_STOCK",
      },
    });
  } else if (intent === "update") {
    const itemId = formData.get("itemId") as string;
    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string;
    const size = formData.get("size") as string;
    const purchasePrice = Number(formData.get("purchasePrice"));
    const purchaseDate = formData.get("purchaseDate") as string;
    const condition = formData.get("condition") as ItemCondition;
    const colorway = formData.get("colorway") as string;
    const notes = formData.get("notes") as string;

    await prisma.inventoryItem.update({
      where: { id: itemId, userId: user.id },
      data: {
        sku,
        name,
        brand,
        size,
        purchasePrice,
        purchaseDate: new Date(purchaseDate),
        condition,
        color: colorway,
        notes,
      },
    });
  } else if (intent === "delete") {
    const itemId = formData.get("itemId") as string;
    await prisma.inventoryItem.delete({
      where: { id: itemId, userId: user.id }, // Ensures the user owns the item
    });
  } else if (intent === "bulk-delete") {
    const ids = formData.getAll("ids") as string[];
    await prisma.inventoryItem.deleteMany({
      where: { id: { in: ids }, userId: user.id },
    });
  } else if (intent === "bulk-mark-sold") {
    const ids = formData.getAll("ids") as string[];
    await prisma.inventoryItem.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { status: "SOLD" },
    });
  } else if (intent === "import") {
    const itemsValue = formData.get("items");
    const skippedRows = parseSkippedRows(formData.get("skippedRows"));

    if (typeof itemsValue !== "string") {
      return { ok: false, intent, error: "Import payload is missing." };
    }

    let parsedItems: unknown;

    try {
      parsedItems = JSON.parse(itemsValue);
    } catch {
      return { ok: false, intent, error: "The uploaded spreadsheet data could not be read." };
    }

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return { ok: false, intent, error: "No inventory rows were found in the import." };
    }

    const normalizedItems: Prisma.InventoryItemCreateManyInput[] = [];
    const invalidRows = new Set<number>();

    parsedItems.forEach((item, index) => {
      if (typeof item !== "object" || item === null) {
        invalidRows.add(getImportedRowNumber(item, index + 2));
        return;
      }

      const row = item as Record<string, unknown>;
      const sku = typeof row.sku === "string" ? row.sku.trim() : "";
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const brand = typeof row.brand === "string" ? row.brand.trim() : "";
      const purchasePrice = parseImportedPurchasePrice(row.purchasePrice);
      const purchaseDate = parseImportedPurchaseDate(row.purchaseDate);

      if (!sku || !name || !brand || purchasePrice === null || !purchaseDate) {
        invalidRows.add(getImportedRowNumber(row, index + 2));
        return;
      }

      const createManyItem: Prisma.InventoryItemCreateManyInput = {
        userId: user.id,
        sku,
        name,
        brand,
        size: typeof row.size === "string" && row.size.trim().length > 0 ? row.size.trim() : "OS",
        purchasePrice,
        purchaseDate,
        condition: normalizeImportedCondition(row.condition),
        status: "IN_STOCK",
        currency: normalizeImportedCurrency(row.currency),
        tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
      };

      normalizedItems.push(createManyItem);
    });

    if (!normalizedItems.length) {
      return { ok: false, intent, error: "No valid inventory rows were found in the import." };
    }

    try {
      const result = await prisma.inventoryItem.createMany({
        data: normalizedItems,
        skipDuplicates: true,
      });

      const skipped = new Set<number>([...skippedRows, ...invalidRows]);

      return {
        ok: true,
        intent,
        importedCount: result.count,
        skippedCount: skipped.size,
        skippedRows: Array.from(skipped).sort((left, right) => left - right),
      };
    } catch (error) {
      console.error("Inventory import failed", error);
      return {
        ok: false,
        intent,
        error: "Failed to import inventory items. Please try again.",
      };
    }
  }

  return { ok: true, intent };
}

export default function InventoryManagementPage() {
  const { deferredData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [duplicatingItem, setDuplicatingItem] = useState<any>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

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
      } else if (actionData.intent === "import") {
        const importedCount = actionData.importedCount || 0;
        const skippedCount = actionData.skippedCount || 0;
        const skippedRows = Array.isArray(actionData.skippedRows) ? actionData.skippedRows : [];
        const skippedMessage = skippedCount > 0 ? ` Skipped rows: ${skippedRows.join(", ")}.` : "";

        toast.success(`Imported ${importedCount} inventory items.${skippedMessage}`);
        setShowImport(false);
      }
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className={styles.page}>
      <InventoryHeader
        onAddItem={() => setShowAddItem(true)}
        onImport={() => setShowImport(true)}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
      <Suspense
        fallback={
          <div className={styles.loadingContainer}>
            <IconLoader2 size={32} className={styles.spin} />
            <span>Loading inventory items...</span>
          </div>
        }
      >
        <Await resolve={deferredData}>
          {({ items, totalPages }) => (
            <>
              {selected.length > 0 && (
                <BulkActionsBar count={selected.length} onClear={() => setSelected([])} selectedIds={selected} items={items} />
              )}
              <InventoryTable
                selected={selected}
                onSelectChange={setSelected}
                items={items}
                onEdit={setEditingItem}
                onDuplicate={(item) => setDuplicatingItem({ ...item, id: undefined, sku: "" })}
              />
              <Pagination totalPages={totalPages} />
            </>
          )}
        </Await>
      </Suspense>
      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} />}
      {editingItem && <AddItemModal item={editingItem} onClose={() => setEditingItem(null)} />}
      {duplicatingItem && <AddItemModal item={duplicatingItem} isDuplicate={true} onClose={() => setDuplicatingItem(null)} />}
      {showImport && <ImportExcelModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
