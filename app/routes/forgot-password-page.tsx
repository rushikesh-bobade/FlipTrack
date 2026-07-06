import { redirect, useActionData } from "react-router";
import type { Route } from "./+types/forgot-password-page";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import styles from "./forgot-password-page.module.css";
import { ForgotPasswordForm } from "~/blocks/forgot-password-page/forgot-password-form";
import { ConfirmationMessage } from "~/blocks/forgot-password-page/confirmation-message";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return redirect("/app/dashboard", { headers });
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const formData = await request.formData();
  const email = formData.get("email") as string;

  if (!email) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers,
    });
  }

  // Construct dynamic redirect URL to reset password page
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/auth/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

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

export default function ForgotPasswordPage() {
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const sent = !!actionData?.success;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {sent ? (
          <ConfirmationMessage />
        ) : (
          <ForgotPasswordForm error={actionData?.error} />
        )}
      </div>
    </div>
  );
}

