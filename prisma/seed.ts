import { PrismaClient, ItemStatus, ItemCondition, Marketplace, ExpenseType, Currency, Plan, Theme } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const demoEmail = process.env.DEMO_USER_EMAIL || "demo@fliptrack.app";

  let user = await prisma.user.findUnique({
    where: { email: demoEmail }
  });

  if (!user) {
    console.error(`\n❌ Error: Demo user with email "${demoEmail}" not found in the database.`);
    console.error("To set up local authentication and seed the database correctly, you must run the user creation script first:");
    console.error("  npx tsx scripts/create-demo-user.ts");
    console.error("This will register the user in Supabase Auth and sync it to the database.");
    console.error("Then, run this seed script again to populate the database with demo inventory data.\n");
    process.exit(1);
  }

  console.log("Using existing user for seeding:", user.email);

  // Clear existing data for this user to avoid unique constraint errors during re-seeds
  await prisma.expense.deleteMany({ where: { userId: user.id } });
  await prisma.sale.deleteMany({ where: { userId: user.id } });
  await prisma.inventoryItem.deleteMany({ where: { userId: user.id } });
  await prisma.priceAlert.deleteMany({ where: { userId: user.id } });
  await prisma.marketPrice.deleteMany({});

  console.log("Adding inventory items...");
  
  const items = [
    { sku: "DD1391-100", name: "Nike Dunk Low Retro White Black", brand: "Nike", size: "10", purchasePrice: 110, purchaseDate: new Date("2026-05-01"), status: ItemStatus.IN_STOCK, condition: ItemCondition.DEADSTOCK },
    { sku: "DZ5485-612", name: "Jordan 1 Retro High OG Chicago Lost and Found", brand: "Jordan", size: "9.5", purchasePrice: 180, purchaseDate: new Date("2026-04-15"), status: ItemStatus.IN_STOCK, condition: ItemCondition.DEADSTOCK },
    { sku: "GW1229", name: "Yeezy Boost 350 V2 Beluga Reflective", brand: "Yeezy", size: "11", purchasePrice: 220, purchaseDate: new Date("2026-03-20"), status: ItemStatus.SOLD, condition: ItemCondition.DEADSTOCK },
    { sku: "CT8527-100", name: "Jordan 4 Retro White Oreo", brand: "Jordan", size: "10.5", purchasePrice: 190, purchaseDate: new Date("2026-02-10"), status: ItemStatus.SOLD, condition: ItemCondition.NEW_WITH_BOX },
    { sku: "B75806", name: "adidas Samba OG Cloud White Core Black", brand: "adidas", size: "9", purchasePrice: 100, purchaseDate: new Date("2026-05-25"), status: ItemStatus.IN_STOCK, condition: ItemCondition.DEADSTOCK },
    { sku: "DH6927-111", name: "Jordan 4 Retro Military Black", brand: "Jordan", size: "10", purchasePrice: 210, purchaseDate: new Date("2026-04-05"), status: ItemStatus.SOLD, condition: ItemCondition.DEADSTOCK },
    { sku: "555088-105", name: "Jordan 1 Retro High Dark Mocha", brand: "Jordan", size: "12", purchasePrice: 170, purchaseDate: new Date("2026-01-15"), status: ItemStatus.SOLD, condition: ItemCondition.USED },
  ];

  const dbItems = [];
  for (const item of items) {
    const dbItem = await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        ...item,
      }
    });
    dbItems.push(dbItem);
  }

  console.log("Adding sales...");
  
  const soldItems = dbItems.filter(i => i.status === 'SOLD');
  
  const salesData = [
    { item: soldItems[0], price: 340, date: new Date("2026-04-10"), marketplace: Marketplace.STOCKX }, // Yeezy
    { item: soldItems[1], price: 420, date: new Date("2026-03-05"), marketplace: Marketplace.GOAT }, // Oreo
    { item: soldItems[2], price: 380, date: new Date("2026-05-15"), marketplace: Marketplace.EBAY }, // Military Black
    { item: soldItems[3], price: 450, date: new Date("2026-02-20"), marketplace: Marketplace.STOCKX }, // Mocha
  ];

  for (const sale of salesData) {
    if(!sale.item) continue;
    await prisma.sale.create({
      data: {
        userId: user.id,
        inventoryItemId: sale.item.id,
        salePrice: sale.price,
        saleDate: sale.date,
        marketplace: sale.marketplace,
        buyerHandle: "sneakerhead_" + Math.floor(Math.random() * 1000)
      }
    });
  }

  console.log("Adding expenses...");
  
  const expenses = [
    { type: ExpenseType.SHIPPING, amount: 15, date: new Date("2026-04-11"), description: "UPS Label" },
    { type: ExpenseType.MARKETPLACE_FEE, amount: 30, date: new Date("2026-04-11"), description: "StockX Fee" },
    { type: ExpenseType.SHIPPING, amount: 12, date: new Date("2026-03-06"), description: "USPS Priority" },
    { type: ExpenseType.BOT_FEE, amount: 50, date: new Date("2026-05-01"), description: "Monthly Bot License" },
    { type: ExpenseType.SUPPLIES, amount: 25, date: new Date("2026-05-10"), description: "Shipping boxes & tape" },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        userId: user.id,
        ...exp
      }
    });
  }

  console.log("Adding price alerts...");
  await prisma.priceAlert.createMany({
    data: [
      { userId: user.id, sku: "DD1391-100", size: "10", productName: "Nike Dunk Low Retro", marketplace: Marketplace.STOCKX, targetPrice: 150, direction: "ABOVE", notificationChannel: "EMAIL", isActive: true },
      { userId: user.id, sku: "DZ5485-612", size: "9.5", productName: "Jordan 1 Chicago", marketplace: Marketplace.GOAT, targetPrice: 200, direction: "BELOW", notificationChannel: "PUSH", isActive: true },
    ]
  });

  console.log("Adding mock market prices...");
  const marketPrices = [];
  const mkts = [Marketplace.STOCKX, Marketplace.GOAT, Marketplace.EBAY, Marketplace.FLIGHTCLUB, Marketplace.STADIUMGOODS];
  
  for (const item of items) {
    const basePrice = item.purchasePrice * 1.5;
    for (const mkt of mkts) {
      // Add some random variation
      const ask = basePrice + (Math.random() * 40 - 20);
      marketPrices.push({
        sku: item.sku,
        size: item.size,
        marketplace: mkt,
        askPrice: ask,
        bidPrice: ask * 0.9,
        lastSold: ask * 0.95,
        fetchedAt: new Date()
      });
    }
  }

  await prisma.marketPrice.createMany({ data: marketPrices });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
