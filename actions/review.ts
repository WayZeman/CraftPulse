"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { reviewSchema } from "@/lib/validations";
import { invalidateCache, cacheKeys } from "@/lib/redis";
import { recalcServerStats } from "@/services/servers";
import { notify } from "@/services/notifications";

export async function createReview(input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Потрібно увійти" };
  }
  const userId = session.user.id;

  const rl = await rateLimit("review", userId);
  if (!rl.success) return { success: false, error: "Зачекай перш ніж писати ще один відгук." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Невалідні дані" };
  }
  const { serverId, rating, title, content } = parsed.data;

  const server = await db.server.findUnique({
    where: { id: serverId },
    select: { id: true, slug: true, ownerId: true, status: true, name: true },
  });
  if (!server || server.status !== "APPROVED") {
    return { success: false, error: "Сервер не знайдено" };
  }
  if (server.ownerId === userId) {
    return { success: false, error: "Власник не може писати відгук на свій сервер" };
  }

  await db.review.upsert({
    where: { userId_serverId: { userId, serverId } },
    update: { rating, title, content, isHidden: false },
    create: { userId, serverId, rating, title, content },
  });

  await recalcServerStats(serverId);
  await invalidateCache(cacheKeys.server(server.slug));

  await notify({
    userId: server.ownerId,
    type: "NEW_REVIEW",
    title: `Новий відгук на ${server.name}`,
    body: `${session.user.name ?? "Гравець"} залишив відгук (${rating}/5)`,
    link: `/servers/${server.slug}`,
  });

  revalidatePath(`/servers/${server.slug}`);
  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Потрібно увійти" };

  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { server: { select: { slug: true } } },
  });
  if (!review) return { success: false, error: "Відгук не знайдено" };

  const isOwner = review.userId === session.user.id;
  const isStaff = ["MODERATOR", "ADMIN", "OWNER"].includes(session.user.role);
  if (!isOwner && !isStaff) return { success: false, error: "Немає прав" };

  await db.review.delete({ where: { id: reviewId } });
  await recalcServerStats(review.serverId);
  await invalidateCache(cacheKeys.server(review.server.slug));

  revalidatePath(`/servers/${review.server.slug}`);
  return { success: true };
}
