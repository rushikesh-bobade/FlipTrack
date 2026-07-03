import type { Route } from "./+types/api.inventory.search";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";

  if (q.length < 2) {
    return new Response(JSON.stringify({ items: [] }), { headers: { "Content-Type": "application/json" } });
  }

  const items = await prisma.inventoryItem.findMany({
    where: {
      userId: user.id,
      status: "IN_STOCK",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return new Response(JSON.stringify({ items }), {
    headers: { "Content-Type": "application/json" },
  });
}
