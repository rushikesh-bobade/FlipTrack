import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseKey = serviceRoleKey || anonKey;
const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();
async function main() {
  console.log("Creating demo user...");
  
  // Try to sign up the demo user
  const email = "demo@fliptrack.app";
  const password = "password123";
  const name = "Demo User";

  let error;
  
  if (serviceRoleKey) {
    const res = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });
    error = res.error;
  } else {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      }
    });
    error = res.error;
  }

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already exists") || error.message.includes("already been registered")) {
      console.log("Demo user already exists in Supabase Auth.");
    } else {
      console.error("Failed to create demo user in Auth:", error.message);
      return;
    }
  } else {
    console.log("Created demo user in Supabase Auth!");
  }

  // Try to login to get the user ID if sign up says already registered
  const authRes = await supabase.auth.signInWithPassword({ email, password });
  if (authRes.error) {
    console.error("Failed to login demo user:", authRes.error.message);
    return;
  }

  const user = authRes.data.user;

  // Ensure user is in public.User via Prisma
  if (user) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        name,
        plan: "PRO"
      }
    });
    console.log("Demo user synced to public.User table.");
    
    // Create some fake inventory
    const count = await prisma.inventoryItem.count({ where: { userId: user.id } });
    if (count === 0) {
      await prisma.inventoryItem.createMany({
        data: [
          { userId: user.id, sku: "DD1391-100", name: "Nike Dunk Low Retro White Black Panda", brand: "Nike", size: "10", purchasePrice: 110, purchaseDate: new Date(), condition: "DEADSTOCK", status: "IN_STOCK" },
          { userId: user.id, sku: "DZ5485-612", name: "Air Jordan 1 Retro High OG Chicago Lost and Found", brand: "Jordan", size: "9.5", purchasePrice: 180, purchaseDate: new Date(), condition: "DEADSTOCK", status: "LISTED" },
          { userId: user.id, sku: "GW1229", name: "Yeezy Boost 350 V2 Beluga Reflective", brand: "Yeezy", size: "11", purchasePrice: 220, purchaseDate: new Date(), condition: "DEADSTOCK", status: "SOLD" },
        ]
      });
      console.log("Created demo inventory.");
    }
  }
}

main().catch(console.error).finally(() => process.exit(0));
