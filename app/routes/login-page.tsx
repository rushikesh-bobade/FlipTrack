import { redirect } from "react-router";
import type { Route } from "./+types/login-page";
import { getSupabaseServerClient, authSessionStorage } from "~/utils/supabase.server";
import styles from "./login-page.module.css";
import { LoginForm } from "~/blocks/login-page/login-form";
import { OAuthOptions } from "~/blocks/login-page/o-auth-options";
import { MagicLinkOption } from "~/blocks/login-page/magic-link-option";
import { SignupLink } from "~/blocks/login-page/signup-link";
import { rateLimit } from "~/utils/rate-limit.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return redirect("/app/dashboard", { headers });
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await rateLimit(request, 5, 60_000);

  const { supabase, headers } = getSupabaseServerClient(request);

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    if (error.message === "fetch failed") {
      console.error("Supabase connection failed (fetch failed):", error);
      return { error: "Unable to connect to the authentication server. Please try again later." };
    }
    return { error: error.message };
  }

  if (data.user) {
    const session = await authSessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", data.user.id);
    session.set("email", data.user.email);
    headers.append("Set-Cookie", await authSessionStorage.commitSession(session));
  }
  
  return redirect("/app/dashboard", { headers });
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div style={{ fontFamily: "var(--family-display)", fontSize: 24, fontWeight: 800, marginBottom: 4, color: "var(--color-text)" }}>
            Flip<span style={{ color: "var(--color-primary)" }}>Track</span>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Sign in to your account</p>
        </div>
        <LoginForm />
        <OAuthOptions />
        <MagicLinkOption />
        <SignupLink />
      </div>
    </div>
  );
}
