import { useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/settings";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./settings.module.css";
import { SettingsNavigation } from "~/blocks/settings/settings-navigation";
import { AccountSettings } from "~/blocks/settings/account-settings";
import { Preferences } from "~/blocks/settings/preferences";
import { Notifications } from "~/blocks/settings/notifications";
import { BillingSection } from "~/blocks/settings/billing-section";
import { TeamSection } from "~/blocks/settings/team-section";
import { SecuritySection } from "~/blocks/settings/security-section";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return { user: null };

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { team: { include: { members: true } } }
  });

  return { user: dbUser };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update-profile") {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    await prisma.user.update({
      where: { id: authUser.id },
      data: { name, phone }
    });
    return { ok: true, message: "Profile updated successfully." };
  } 
  
if (intent === "update-preferences") {
  const currency = formData.get("currency") as string;
  const theme = formData.get("theme") as string;

  await prisma.user.update({
    where: { id: authUser.id },
    // Force TypeScript to accept them by casting the database payload properties
    data: { 
      currency: currency as any, 
      theme: theme as any 
    }
  });

  return { ok: true, message: "Preferences updated successfully." };
}
  
  if (intent === "create-team") {
    const teamName = formData.get("teamName") as string;
    await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: { name: teamName, ownerId: authUser.id }
      });
      await tx.user.update({
        where: { id: authUser.id },
        data: { teamId: team.id, role: "owner" }
      });
    });
    return { ok: true, message: "Team created successfully." };
  }
  
  if (intent === "change-password") {
    const currentPassword = formData.get("currentPassword") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 1. Basic validation checks
    if (!currentPassword) {
      return { ok: false, error: "Current password is required." };
    }

    if (!password || password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters long." };
    }

    if (password !== confirmPassword) {
      return { ok: false, error: "Passwords do not match." };
    }

    // 2. Verify current password by trying to re-authenticate the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email!,
      password: currentPassword,
    });

    if (signInError) {
      return {
        ok: false,
        error: "The current password you entered is incorrect.",
      };
    }

    // 3. If re-authentication succeeded, update to the new password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return {
        ok: false,
        error: updateError.message,
      };
    }

    return {
      ok: true,
      message: "Password updated successfully.",
    };
  }

  return { ok: false, error: "Invalid intent" };
}

type Section = "account" | "preferences" | "notifications" | "billing" | "team" | "security";

const sectionMap: Record<Section, React.ComponentType<any>> = {
  account: AccountSettings,
  preferences: Preferences,
  notifications: Notifications,
  billing: BillingSection,
  team: TeamSection,
  security: SecuritySection,
};

export default function SettingsPage() {
  const { user } = useLoaderData<typeof loader>();
  const [section, setSection] = useState<Section>("account");
  const SectionComponent = sectionMap[section];
  
  return (
    <div className={styles.page}>
      <SettingsNavigation active={section} onChange={(s) => setSection(s as Section)} />
      <div>
        <SectionComponent user={user} />
      </div>
    </div>
  );
}