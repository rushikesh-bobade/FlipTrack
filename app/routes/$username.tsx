import { useLoaderData } from "react-router";
import type { Route } from "./+types/$username";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ params }: Route.LoaderArgs) {
  const { username } = params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true, avatarUrl: true },
  });

  if (!user) throw new Response("Not Found", { status: 404 });

  const items = await prisma.inventoryItem.findMany({
    where: { userId: user.id, isPublic: true },
    select: {
      id: true,
      name: true,
      brand: true,
      sku: true,
      size: true,
      condition: true,
      status: true,
      askingPrice: true,
      imageUrl: true,
      category: true,
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    user,
    items: items.map((item) => ({
      ...item,
      askingPrice: item.askingPrice ? Number(item.askingPrice) : null,
    })),
  };
}

export default function PublicShowroom() {
  const { user, items } = useLoaderData<typeof loader>();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <h1>{user.name ?? user.username}&apos;s Showroom</h1>
      {items.length === 0 ? (
        <p>No items listed for sale.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "1rem" }}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: "100%", borderRadius: 4 }} />}
              <h3 style={{ margin: "0.5rem 0 0.25rem" }}>{item.name}</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)" }}>{item.brand} · {item.size}</p>
              <p style={{ margin: "0.5rem 0 0", fontWeight: 600 }}>
                {item.askingPrice ? `$${item.askingPrice.toFixed(2)}` : "Price on request"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
