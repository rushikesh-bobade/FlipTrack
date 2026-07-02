import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // We'll try with ANON key if service role is missing
const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function main() {
  console.log("Creating demo user...");

  // Try to sign up the demo user
  const email = process.env.DEMO_USER_EMAIL ?? "demo@fliptrack.app";
  const password = process.env.DEMO_USER_PASSWORD ?? "password123";
  const name = "Demo User";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
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
        plan: "PRO",
      },
    });
    console.log("Demo user synced to public.User table.");

    // Create some fake inventory
    console.log("Skipping inventory creation — handled by seed script.");
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
