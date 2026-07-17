import { isRouteErrorResponse, useLoaderData } from "react-router";
import { PrismaClient } from "@prisma/client";
import type { Route } from "./+types/u.$username";
import { ShowroomGrid } from "~/blocks/showroom/showroom-grid";

function getPrisma() {
  return new PrismaClient();
}

export async function loader({ params }: Route.LoaderArgs) {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new Response("Not Found", { status: 404 });
  }

  const inventory = await prisma.inventoryItem.findMany({
    where: {
      userId: user.id,
      isPublic: true,
      status: { in: ["IN_STOCK", "LISTED", "SOLD"] },
    },
    select: {
      id: true,
      name: true,
      brand: true,
      size: true,
      condition: true,
      status: true,
      askingPrice: true,
      imageUrl: true,
    },
  });

  return {
    username: user.username!,
    inventory: inventory.map((item) => ({
      ...item,
      askingPrice: item.askingPrice ? Number(item.askingPrice) : 0,
    })),
  };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error) && error.status === 404
    ? "This showroom doesn't exist."
    : "Something went wrong loading this showroom.";

  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1>Showroom not found</h1>
      <p>{message}</p>
    </div>
  );
}

export default function PublicShowroom() {
  const { username, inventory } = useLoaderData<typeof loader>();
  return <ShowroomGrid username={username} inventory={inventory} />;
}
