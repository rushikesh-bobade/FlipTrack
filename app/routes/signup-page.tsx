import { redirect } from "react-router";
import type { Route } from "./+types/signup-page";
import { getSupabaseServerClient, authSessionStorage } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./signup-page.module.css";
import { SignupForm } from "~/blocks/signup-page/signup-form";
import { OAuthSignup } from "~/blocks/signup-page/o-auth-signup";
import { LoginLink } from "~/blocks/signup-page/login-link";
import { TermsAcceptance } from "~/blocks/signup-page/terms-acceptance";
import { rateLimit } from "~/utils/rate-limit.server";

const prisma = new PrismaClient();

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
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    if (error.message === "fetch failed") {
      console.error("Supabase connection failed (fetch failed):", error);
      return { error: "Unable to connect to the authentication server. Please try again later." };
    }
    return { error: error.message };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      error: "An account with this email already exists. Try logging in instead.",
    };
  }

  if (!data.user) {
    return { error: "Something went wrong creating your account. Please try again." };
  }

  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        name,
      },
    });
  } catch (dbError) {
    // FIXED: Let the error fail gracefully and removed admin cleanup block entirely
    console.error("Failed to create profile row after auth signup:", dbError);
    return {
      error: "Something went wrong creating your account database profile. Please try again or contact support.",
    };
  }

  if (data.user) {
    const session = await authSessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", data.user.id);
    session.set("email", data.user.email);
    headers.append("Set-Cookie", await authSessionStorage.commitSession(session));
  }

  return redirect("/app/dashboard", { headers });
}

export default function SignupPage() {
  return (
    <div className={styles.page}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div style={{ fontFamily: "var(--family-display)", fontSize: 24, fontWeight: 800, marginBottom: 4, color: "var(--color-text)" }}>
            Flip<span style={{ color: "var(--color-primary)" }}>Track</span>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Create your free account</p>
        </div>
        <OAuthSignup />
        <SignupForm />
        <TermsAcceptance />
        <LoginLink />
      </div>
    </div>
  );
}