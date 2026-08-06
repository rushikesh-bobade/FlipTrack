import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionLogged?: boolean;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  client
    .$connect()
    .then(() => {
      if (!globalForPrisma.prismaConnectionLogged) {
        globalForPrisma.prismaConnectionLogged = true;
        console.log(
          `✅ [prisma] Connected to the database successfully (${process.env.NODE_ENV ?? "development"} mode)`
        );
      }
    })
    .catch((error: unknown) => {
      console.error("❌ [prisma] Failed to connect to the database on startup.");
      console.error("   → Check that DATABASE_URL and DIRECT_URL are set in your .env file.");
      console.error("   → Confirm your Supabase/Postgres instance is running and reachable.");
      console.error('   → Make sure you have run "npx prisma generate" after any schema change.');
      if (error instanceof Error) {
        console.error(`   → ${error.message}`);
      } else {
        console.error(error);
      }
    });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}