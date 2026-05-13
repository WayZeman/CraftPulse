import "server-only";
import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  return db.notification.create({ data: input });
}

export async function notifyMany(userIds: string[], data: Omit<Parameters<typeof notify>[0], "userId">) {
  return db.notification.createMany({
    data: userIds.map((userId) => ({ userId, ...data })),
  });
}

export async function dispatchDiscordWebhook(content: string, embed?: Record<string, unknown>) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, embeds: embed ? [embed] : undefined }),
  }).catch(() => null);
}
