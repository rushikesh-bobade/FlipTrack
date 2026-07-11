import { redirect } from "react-router";
import type { Route } from "./+types/auth.logout";
import { getSupabaseServerClient, authSessionStorage } from "~/utils/supabase.server";

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  await supabase.auth.signOut();

  const session = await authSessionStorage.getSession(request.headers.get("Cookie"));
  headers.append("Set-Cookie", await authSessionStorage.destroySession(session));

  return redirect("/auth/login", { headers });
}

export async function loader() {
  return redirect("/auth/login");
}
