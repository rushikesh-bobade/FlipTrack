import { redirect, useActionData } from "react-router";
import type { Route } from "./+types/reset-password-page";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import styles from "./reset-password-page.module.css";
import { ResetPasswordForm } from "~/blocks/reset-password-page/reset-password-form";
import { SuccessMessage } from "~/blocks/reset-password-page/success-message";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const { supabase, headers } = getSupabaseServerClient(request);

if (code) {
  try {
    console.log("Recovery code:", code);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Exchange data:", data);
    console.log("Exchange error:", error);

    if (error) throw error;

    return redirect("/auth/reset-password", { headers });
  } catch (e) {
    console.error("exchangeCodeForSession failed:", e);

    return redirect("/auth/login?error=Invalid or expired reset link");
  }
}

  // Check if user is authenticated (they should be, via the recovery session cookie)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/auth/login");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const formData = await request.formData();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: "Both fields are required." }), {
      status: 400,
      headers,
    });
  }

  if (password !== confirmPassword) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: "Passwords do not match." }), {
      status: 400,
      headers,
    });
  }

  if (password.length < 6) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: "Password must be at least 6 characters." }), {
      status: 400,
      headers,
    });
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers,
    });
  }

  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify({ success: true }), { headers });
}

export default function ResetPasswordPage() {
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const success = !!actionData?.success;

  return (
    <div className={styles.page}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {success ? <SuccessMessage /> : <ResetPasswordForm />}
      </div>
    </div>
  );
}

