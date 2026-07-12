import { Outlet, redirect, useLoaderData } from "react-router";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import type { Route } from "./+types/app-layout";
import { AppSidebar } from "~/blocks/__global/app-sidebar";
import { BreadcrumbNavigation } from "~/blocks/__global/breadcrumb-navigation";
import styles from "./app-layout.module.css";
import { CACHE_PRIVATE_NO_STORE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PRIVATE_NO_STORE,
  };
}

export function shouldRevalidate({ formMethod }: { formMethod: string }) {
  return formMethod !== "GET";
}

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await getUserFromRequest(request, supabase);

  if (!user) {
    throw redirect("/auth/login", { headers });
  }

  // Fetch full user details from public.User
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, plan: true },
  });

  return { user: dbUser || { email: user.email!, plan: "FREE" } };
}

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className={styles.layout}>
      <AppSidebar user={user} />
      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <BreadcrumbNavigation />
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
