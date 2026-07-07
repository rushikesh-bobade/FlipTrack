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
  const email = process.env.DEMO_USER_EMAIL ?? "demo@fliptrack.app";
  const password = process.env.DEMO_USER_PASSWORD ?? "password123";
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
