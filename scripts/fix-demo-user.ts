import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const oldUserId = "99cfb5f5-e96d-4f63-9ce6-e7a4fcb1faf9";
  const newUserId = "f88c1427-7054-495b-b22b-217d076b1754";

  const inventory = await prisma.inventoryItem.updateMany({
    where: {
      userId: oldUserId,
    },
    data: {
      userId: newUserId,
    },
  });

  const sales = await prisma.sale.updateMany({
    where: {
      userId: oldUserId,
    },
    data: {
      userId: newUserId,
    },
  });

  console.log("Inventory updated:", inventory.count);
  console.log("Sales updated:", sales.count);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });