import { useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/settings";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient, Currency, Theme } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";
import styles from "./settings.module.css";
import { SettingsNavigation } from "~/blocks/settings/settings-navigation";
import { AccountSettings } from "~/blocks/settings/account-settings";
import { Preferences } from "~/blocks/settings/preferences";
import { Notifications } from "~/blocks/settings/notifications";
import { BillingSection } from "~/blocks/settings/billing-section";
import { TeamSection } from "~/blocks/settings/team-section";
import { SecuritySection } from "~/blocks/settings/security-section";
import { CACHE_PRIVATE_NO_STORE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PRIVATE_NO_STORE,
  };
}

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return { user: null };

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { team: { include: { members: true } } },
  });

  return { user: dbUser };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update-profile") {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    await prisma.user.update({
      where: { id: authUser.id },
      data: { name, phone },
    });
    return { ok: true, intent: "update-profile", message: "Profile updated successfully." };
  } 
  
  if (intent === "update-preferences") {
    const currency = formData.get("currency") as Currency;
    const theme = formData.get("theme") as Theme;

    await prisma.user.update({
      where: { id: authUser.id },
      data: { currency: currency as any, theme: theme as any },
    });
  } else if (intent === "update-notifications") {
    const emailNotifications = formData.get("emailNotifications") === "on";
    const smsNotifications = formData.get("smsNotifications") === "on";
    const pushNotifications = formData.get("pushNotifications") === "on";
    const weeklySummary = formData.get("weeklySummary") === "on";
    const priceAlertTriggered = formData.get("priceAlertTriggered") === "on";
    await prisma.user.update({
      where: { id: authUser.id },
      data: { emailNotifications, smsNotifications, pushNotifications, weeklySummary, priceAlertTriggered },
    });

    return { ok: true, intent: "update-preferences", message: "Preferences updated successfully." };
  }
  
  // 🟢 REMOVED THE UNNECESSARY "update-notifications" INTENT ENTIRELY
  
  if (intent === "create-team") {
    const teamName = formData.get("teamName") as string;
    await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: { name: teamName, ownerId: authUser.id },
      });
      await tx.user.update({
        where: { id: authUser.id },
        data: { teamId: team.id, role: "owner" },
      });
    });
    return { ok: true, intent: "create-team", message: "Team created successfully." };
  }
  
  if (intent === "change-password") {
    const currentPassword = formData.get("currentPassword") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword) {
      return { ok: false, intent: "change-password", error: "Current password is required." };
    }

    if (!password || password.length < 8) {
      return { ok: false, intent: "change-password", error: "Password must be at least 8 characters long." };
    }

    if (password !== confirmPassword) {
      return { ok: false, intent: "change-password", error: "Passwords do not match." };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email!,
      password: currentPassword,
    });

    if (signInError) {
      return {
        ok: false,
        intent: "change-password",
        error: "The current password you entered is incorrect.",
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return {
        ok: false,
        intent: "change-password",
        error: updateError.message,
      };
    }

    return {
      ok: true,
      intent: "change-password",
      message: "Password updated successfully.",
    };
  }

  /**
   * Invite Member Flow
   * Validates email and role using Zod.
   * Generates a secure invite token and saves it to the database.
   */
  if (intent === "invite-member") {
    const inviteSchema = z.object({
      email: z.string().email("A valid email is required").toLowerCase(),
      role: z.enum(["member", "admin"], { message: "Role must be either 'member' or 'admin'" }),
    });

    const parsed = inviteSchema.safeParse({
      email: formData.get("email"),
      role: formData.get("role"),
    });

    if (!parsed.success) {
      return { ok: false, intent: "invite-member", error: parsed.error.issues[0].message };
    }

    const { email, role } = parsed.data;

    try {
      const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
      if (!dbUser || !dbUser.teamId) {
         return { ok: false, intent: "invite-member", error: "You are not part of a team" };
      }

      if (dbUser.role !== "owner" && dbUser.role !== "admin") {
         return { ok: false, intent: "invite-member", error: "Only team owners or admins can invite new members" };
      }
      
      if (email === dbUser.email.toLowerCase()) {
         return { ok: false, intent: "invite-member", error: "You cannot invite yourself" };
      }
      
      // Generate a cryptographically secure pseudo-random number
      const secureToken = crypto.randomBytes(32).toString("hex");
      
      // Store the invite securely in the database (expires in 7 days)
      await prisma.invite.create({
        data: {
          teamId: dbUser.teamId,
          email,
          role,
          token: secureToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
      
      const inviteLink = `https://fliptrack.app/join?token=${secureToken}`;
      
      return { 
        ok: true, 
        intent: "invite-member", 
        message: `Invitation generated successfully.`, 
        inviteLink 
      };
    } catch (e: any) {
      console.error("Error generating invite:", e);
      return { ok: false, intent: "invite-member", error: `An unexpected error occurred while generating the invite: ${e?.message || "Unknown error"}` };
    }
  }

  return { ok: false, error: "Invalid intent" };
}

// FIXED: Re-added missing types and map definitions below
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