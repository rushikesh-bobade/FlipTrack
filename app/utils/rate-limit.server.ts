import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown_ip"
  );
}

export async function rateLimit(
  request: Request,
  limit = 5,
  windowMs = 60_000
) {
  const ip = getClientIp(request);
  const now = new Date();

  const resetAt = new Date(now.getTime() + windowMs);

  const result = await prisma.rateLimit.upsert({
    where: { ip },
    create: {
      ip,
      count: 1,
      resetAt,
    },
    update: {
      count: {
        increment: 1,
      },
    },
  });

  if (result.resetAt <= now) {
    await prisma.rateLimit.update({
      where: { ip },
      data: {
        count: 1,
        resetAt,
      },
    });

    return;
  }

  if (result.count > limit) {
    throw new Response(
      JSON.stringify({
        error: "Too many attempts. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}