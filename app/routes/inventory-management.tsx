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
  }
}

export default function InventoryManagement() {
  const { items } = useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterCondition, setFilterCondition] = useState<string[]>([]);

  const filteredItems = items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const skuMatch = item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const brandMatch = item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = filterStatus.length === 0 || filterStatus.includes(item.status);
    const conditionMatch = filterCondition.length === 0 || filterCondition.includes(item.condition);

    return (nameMatch || skuMatch || brandMatch) && statusMatch && conditionMatch;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterStatus = (status: string) => {
    if (filterStatus.includes(status)) {
      setFilterStatus(filterStatus.filter(s => s !== status));
    } else {
      setFilterStatus([...filterStatus, status]);
    }
  };

  const handleFilterCondition = (condition: string) => {
    if (filterCondition.includes(condition)) {
      setFilterCondition(filterCondition.filter(c => c !== condition));
    } else {
      setFilterCondition([...filterCondition, condition]);
    }
  };

  return (
    <div className={styles.container}>
      <InventoryHeader onAddItem={() => console.log("Add item")} onImport={() => console.log("Import")} onSearch={handleSearch} />
      <div className={styles.filter}>
        <button className={styles.filterButton} onClick={() => console.log("Filter")}>
          Filter
        </button>
        <div className={styles.filterOptions}>
          <div className={styles.filterGroup}>
            <h5>Status</h5>
            <ul>
              <li>
                <input type="checkbox" id="in-stock" checked={filterStatus.includes("IN_STOCK")} onChange={() => handleFilterStatus("IN_STOCK")} />
                <label htmlFor="in-stock">In Stock</label>
              </li>
              <li>
                <input type="checkbox" id="listed" checked={filterStatus.includes("LISTED")} onChange={() => handleFilterStatus("LISTED")} />
                <label htmlFor="listed">Listed</label>
              </li>
              <li>
                <input type="checkbox" id="sold" checked={filterStatus.includes("SOLD")} onChange={() => handleFilterStatus("SOLD")} />
                <label htmlFor="sold">Sold</label>
              </li>
            </ul>
          </div>
          <div className={styles.filterGroup}>
            <h5>Condition</h5>
            <ul>
              <li>
                <input type="checkbox" id="deadstock" checked={filterCondition.includes("DEADSTOCK")} onChange={() => handleFilterCondition("DEADSTOCK")} />
                <label htmlFor="deadstock">Deadstock</label>
              </li>
              <li>
                <input type="checkbox" id="new-with-box" checked={filterCondition.includes("NEW_WITH_BOX")} onChange={() => handleFilterCondition("NEW_WITH_BOX")} />
                <label htmlFor="new-with-box">New with Box</label>
              </li>
              <li>
                <input type="checkbox" id="used" checked={filterCondition.includes("USED")} onChange={() => handleFilterCondition("USED")} />
                <label htmlFor="used">Used</label>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <InventoryTable items={filteredItems} />
      <BulkActionsBar />
      <AddItemModal />
      <ImportExcelModal />
    </div>
  );
}