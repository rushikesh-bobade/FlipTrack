import type { Route } from "./+types/api.integrations";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "~/utils/encryption.server";

const prisma = new PrismaClient();

// Helper to decrypt integration credentials for returning in API response
function decryptIntegration(integration: any) {
  return {
    ...integration,
    accessToken: decrypt(integration.accessToken),
    refreshToken: integration.refreshToken ? decrypt(integration.refreshToken) : null,
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const platform = url.searchParams.get("platform");

  try {
    if (platform) {
      const integration = await prisma.integration.findUnique({
        where: {
          userId_platform: {
            userId: user.id,
            platform: platform.toUpperCase(),
          },
        },
      });

      if (!integration) {
        return new Response(JSON.stringify({ error: `No integration found for platform ${platform}` }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(decryptIntegration(integration)), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const integrations = await prisma.integration.findMany({
      where: { userId: user.id },
    });

    const decryptedIntegrations = integrations.map(decryptIntegration);

    return new Response(JSON.stringify(decryptedIntegrations), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to load integrations:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const method = request.method.toUpperCase();

  // Handle DELETE request
  if (method === "DELETE") {
    const url = new URL(request.url);
    let platform = url.searchParams.get("platform");

    if (!platform) {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await request.json();
          platform = body.platform;
        } else {
          const formData = await request.formData();
          platform = formData.get("platform") as string | null;
        }
      } catch (e) {
        // Body reading failed, proceed with query param
      }
    }

    if (!platform) {
      return new Response(JSON.stringify({ error: "Platform is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await prisma.integration.delete({
        where: {
          userId_platform: {
            userId: user.id,
            platform: platform.toUpperCase(),
          },
        },
      });

      return new Response(JSON.stringify({ success: true, message: `Disconnected platform ${platform}` }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      // Prisma P2025 is "Record to delete does not exist."
      if (error.code === "P2025") {
        return new Response(JSON.stringify({ error: `No integration found for platform ${platform}` }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Failed to delete integration:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle POST/PUT/PATCH request (Save/Update Integration)
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    let data: any = {};
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await request.json();
      } else {
        const formData = await request.formData();
        data = {
          platform: formData.get("platform"),
          accessToken: formData.get("accessToken"),
          refreshToken: formData.get("refreshToken"),
          expiresAt: formData.get("expiresAt"),
          teamId: formData.get("teamId"),
        };
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid request payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { platform, accessToken, refreshToken, expiresAt, teamId } = data;

    if (!platform || typeof platform !== "string") {
      return new Response(JSON.stringify({ error: "Platform must be a non-empty string" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!accessToken || typeof accessToken !== "string") {
      return new Response(JSON.stringify({ error: "AccessToken must be a non-empty string" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const encryptedAccessToken = encrypt(accessToken);
      const encryptedRefreshToken = refreshToken ? encrypt(String(refreshToken)) : null;

      let parsedExpiresAt: Date | null = null;
      if (expiresAt) {
        parsedExpiresAt = new Date(expiresAt);
        if (isNaN(parsedExpiresAt.getTime())) {
          return new Response(JSON.stringify({ error: "Invalid expiresAt date format" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      const integration = await prisma.integration.upsert({
        where: {
          userId_platform: {
            userId: user.id,
            platform: platform.toUpperCase(),
          },
        },
        update: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: parsedExpiresAt,
          teamId: teamId ? String(teamId) : null,
        },
        create: {
          userId: user.id,
          platform: platform.toUpperCase(),
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: parsedExpiresAt,
          teamId: teamId ? String(teamId) : null,
        },
      });

      return new Response(JSON.stringify(decryptIntegration(integration)), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to save integration:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
