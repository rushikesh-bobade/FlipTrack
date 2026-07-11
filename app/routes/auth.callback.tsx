import { redirect } from "react-router";
import type { Route } from "./+types/auth.callback";
import { getSupabaseServerClient, authSessionStorage } from "~/utils/supabase.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/auth/login");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect("/auth/login");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const session = await authSessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);
    session.set("email", user.email);
    headers.append("Set-Cookie", await authSessionStorage.commitSession(session));
  }

  return redirect("/app/dashboard", { headers });
}