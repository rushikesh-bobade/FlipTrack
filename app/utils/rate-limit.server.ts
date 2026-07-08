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

  const existing = await prisma.rateLimit.findUnique({
    where: { ip },
  });

  if (!existing) {
    await prisma.rateLimit.create({
      data: {
        ip,
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
      },
    });
    return;
  }

  if (existing.resetAt <= now) {
    await prisma.rateLimit.update({
      where: { ip },
      data: {
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
      },
    });
    return;
  }

  if (existing.count >= limit) {
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

  await prisma.rateLimit.update({
    where: { ip },
    data: {
      count: {
        increment: 1,
      },
    },
  });
}