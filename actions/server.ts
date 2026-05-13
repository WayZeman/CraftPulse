"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { createServerSchema, updateServerSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { invalidateCache, cacheKeys } from "@/lib/redis";
import { pingServer } from "@/services/minecraft";
import { hasRole } from "@/lib/auth-helpers";
import type { Role } from "@prisma/client";
import { notify } from "@/services/notifications";
import { assertPublicHost, SsrfError } from "@/lib/security/ssrf";

export async function createServer(input: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Потрібно увійти" };

  const rl = await rateLimit("createServer", session.user.id);
  if (!rl.success) return { success: false, error: "Ліміт додавання вичерпано на сьогодні" };

  const parsed = createServerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Невалідні дані" };
  }
  const data = parsed.data;

  // Ensure slug is unique
  let slug = slugify(data.slug || data.name);
  const existing = await db.server.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;

  // Ensure host:port is unique
  const duplicate = await db.server.findFirst({
    where: { host: data.host, port: data.port },
  });
  if (duplicate) {
    return { success: false, error: "Сервер з таким IP вже існує на платформі" };
  }

  // SSRF guard before we make outbound network calls.
  try {
    await assertPublicHost(data.host);
  } catch (err) {
    if (err instanceof SsrfError) {
      return { success: false, error: "Цей хост заборонено: приватна або внутрішня адреса." };
    }
    return { success: false, error: "Невалідний хост" };
  }

  // Verify ping (real existence)
  const ping = await pingServer(data.host, data.port, { edition: data.edition, force: true });

  const server = await db.server.create({
    data: {
      ...data,
      slug,
      ownerId: session.user.id,
      status: hasRole(session.user.role as Role, "VERIFIED") ? "APPROVED" : "PENDING",
      isOnline: ping.online,
      lastPing: new Date(),
      onlinePlayers: ping.players.online,
      maxPlayers: ping.players.max,
      version: ping.version?.name ?? null,
      motd: ping.motd ?? null,
      favicon: ping.favicon ?? null,
      tags: {
        create: data.tags.map((tagSlug) => ({
          tag: { connect: { slug: tagSlug } },
        })),
      },
    },
  });

  await invalidateCache(cacheKeys.platformStats);

  revalidatePath("/servers");
  revalidatePath("/dashboard");

  return { success: true, slug: server.slug, status: server.status };
}

export async function updateServer(input: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Потрібно увійти" };

  const parsed = updateServerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Невалідні дані" };
  }
  const { id, tags, ...rest } = parsed.data;

  const server = await db.server.findUnique({
    where: { id },
    select: { ownerId: true, slug: true, host: true, port: true, status: true },
  });
  if (!server) return { success: false, error: "Сервер не знайдено" };

  const isOwner = server.ownerId === session.user.id;
  const isStaff = hasRole(session.user.role as Role, "MODERATOR");
  if (!isOwner && !isStaff) return { success: false, error: "Немає прав" };

  // Strip fields owners are not allowed to self-edit.
  // host/port change re-requires moderation + uniqueness; slug is immutable.
  const data: typeof rest = { ...rest };
  const hostChanged = data.host !== undefined && data.host !== server.host;
  const portChanged = data.port !== undefined && data.port !== server.port;
  delete (data as { slug?: string }).slug;

  if ((hostChanged || portChanged) && !isStaff) {
    // Owner is trying to swap addresses — re-validate uniqueness + SSRF + ping,
    // and demote back to PENDING so moderators can re-approve.
    const nextHost = data.host ?? server.host;
    const nextPort = data.port ?? server.port;
    const dup = await db.server.findFirst({
      where: { host: nextHost, port: nextPort, NOT: { id } },
      select: { id: true },
    });
    if (dup) return { success: false, error: "Сервер з таким IP вже існує" };

    // SSRF guard
    try {
      await assertPublicHost(nextHost);
    } catch (err) {
      if (err instanceof SsrfError) {
        return { success: false, error: "Цей хост заборонено: приватна або внутрішня адреса." };
      }
      return { success: false, error: "Невалідний хост" };
    }

    // Reachability check (also forces re-moderation below)
    const ping = await pingServer(nextHost, nextPort, { force: true });
    Object.assign(data, {
      host: nextHost,
      port: nextPort,
      status: "PENDING" as const,
      isOnline: ping.online,
      lastPing: new Date(),
    });
  } else if (!isStaff) {
    // Non-staff cannot change status either.
    delete (data as { status?: unknown }).status;
  }

  await db.$transaction(async (tx) => {
    await tx.server.update({ where: { id }, data });
    if (tags?.length) {
      await tx.serverTag.deleteMany({ where: { serverId: id } });
      const tagRecords = await tx.tag.findMany({ where: { slug: { in: tags } } });
      await tx.serverTag.createMany({
        data: tagRecords.map((t) => ({ serverId: id, tagId: t.id })),
        skipDuplicates: true,
      });
    }
  });

  await invalidateCache(cacheKeys.server(server.slug));
  revalidatePath(`/servers/${server.slug}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteServer(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Потрібно увійти" };

  const server = await db.server.findUnique({ where: { id }, select: { ownerId: true, slug: true } });
  if (!server) return { success: false, error: "Сервер не знайдено" };

  const isOwner = server.ownerId === session.user.id;
  const isStaff = hasRole(session.user.role as Role, "ADMIN");
  if (!isOwner && !isStaff) return { success: false, error: "Немає прав" };

  await db.server.delete({ where: { id } });
  await invalidateCache(cacheKeys.server(server.slug), cacheKeys.platformStats);

  revalidatePath("/dashboard");
  revalidatePath("/servers");
  redirect("/dashboard/servers");
}

export async function moderateServer(input: {
  id: string;
  action: "approve" | "reject" | "hide" | "ban";
  reason?: string;
}) {
  const session = await auth();
  if (!session?.user || !hasRole(session.user.role as Role, "MODERATOR")) {
    return { success: false, error: "Немає прав" };
  }
  const map = {
    approve: { status: "APPROVED" as const, type: "SERVER_APPROVED" as const, msg: "Твій сервер схвалено" },
    reject: { status: "REJECTED" as const, type: "SERVER_REJECTED" as const, msg: "Твій сервер відхилено" },
    hide: { status: "HIDDEN" as const, type: "SYSTEM" as const, msg: "Твій сервер приховано" },
    ban: { status: "BANNED" as const, type: "SYSTEM" as const, msg: "Твій сервер заблоковано" },
  };
  const { status, type, msg } = map[input.action];

  const server = await db.server.update({
    where: { id: input.id },
    data: { status, rejectionReason: input.reason },
    select: { ownerId: true, slug: true, name: true },
  });

  await notify({
    userId: server.ownerId,
    type,
    title: `${msg}: ${server.name}`,
    body: input.reason ?? "Дякуємо, що користуєшся CraftPulse",
    link: `/servers/${server.slug}`,
  });

  await invalidateCache(cacheKeys.server(server.slug));
  revalidatePath("/admin");
  revalidatePath("/servers");
  return { success: true };
}
