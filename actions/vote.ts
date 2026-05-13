"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { hmacFingerprint } from "@/lib/security/hash";
import { invalidateCache, cacheKeys } from "@/lib/redis";
import { recalcServerStats } from "@/services/servers";

const VOTE_COOLDOWN_HOURS = 24;

export async function voteForServer(serverId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Потрібно увійти", code: "UNAUTHENTICATED" };
  }

  const userId = session.user.id;
  const rl = await rateLimit("vote", userId);
  if (!rl.success) {
    return { success: false, error: "Занадто багато спроб. Спробуй пізніше." };
  }

  const server = await db.server.findUnique({
    where: { id: serverId },
    select: { id: true, slug: true, status: true },
  });
  if (!server || server.status !== "APPROVED") {
    return { success: false, error: "Сервер не знайдено" };
  }

  // 24h cooldown
  const since = new Date(Date.now() - VOTE_COOLDOWN_HOURS * 60 * 60 * 1000);
  const existing = await db.vote.findFirst({
    where: { userId, serverId, createdAt: { gte: since } },
  });
  if (existing) {
    const hoursLeft = Math.ceil(
      (VOTE_COOLDOWN_HOURS * 60 * 60 * 1000 - (Date.now() - existing.createdAt.getTime())) /
        (60 * 60 * 1000),
    );
    return {
      success: false,
      error: `Ти вже голосував. Спробуй через ${hoursLeft} год.`,
      code: "COOLDOWN",
    };
  }

  // Anti-fraud fingerprint: HMAC(IP) so a DB leak can't be rainbow-tabled, and
  // UA is intentionally excluded from the dedupe key (it's trivial to rotate).
  const h = await headers();
  const ipRaw = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "0.0.0.0";
  const ip = ipRaw.replace(/^\[|]$/g, "").slice(0, 64);
  const ua = (h.get("user-agent") ?? "").slice(0, 500);
  const ipHash = hmacFingerprint(ip, "vote-ip");

  const ipRecent = await db.vote.findFirst({
    where: {
      serverId,
      ipHash,
      createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    },
    select: { userId: true },
  });
  if (ipRecent && ipRecent.userId !== userId) {
    return { success: false, error: "З цієї мережі вже голосували нещодавно." };
  }

  await db.vote.create({
    data: { userId, serverId, ipHash, userAgent: ua },
  });

  await recalcServerStats(serverId);
  await invalidateCache(
    cacheKeys.server(server.slug),
    cacheKeys.topServers("votes"),
    cacheKeys.topServers("trending"),
  );

  revalidatePath(`/servers/${server.slug}`);
  revalidatePath("/servers");

  return { success: true };
}
