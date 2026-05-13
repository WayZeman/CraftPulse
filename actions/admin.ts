"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasRole, assertCanActOnUser } from "@/lib/auth-helpers";
import type { Role } from "@prisma/client";
import { z } from "zod";

const ROLES: Role[] = ["USER", "VERIFIED", "MODERATOR", "ADMIN", "OWNER"];

const updateRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(ROLES as [Role, ...Role[]]),
});

export async function updateUserRole(input: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Потрібно увійти" };

  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Невалідні дані" };
  const { userId, role } = parsed.data;

  const guard = await assertCanActOnUser({
    actorRole: session.user.role as Role,
    actorId: session.user.id,
    targetUserId: userId,
  });
  if (!guard.ok) return { success: false, error: guard.error };

  // Only OWNER can promote anyone to OWNER.
  if (role === "OWNER" && session.user.role !== "OWNER") {
    return { success: false, error: "Тільки OWNER може призначати OWNER" };
  }

  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}

const banSchema = z.object({
  userId: z.string().cuid(),
  banned: z.boolean(),
  reason: z.string().max(500).optional(),
});

export async function toggleBanUser(input: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Потрібно увійти" };

  const parsed = banSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Невалідні дані" };

  const guard = await assertCanActOnUser({
    actorRole: session.user.role as Role,
    actorId: session.user.id,
    targetUserId: parsed.data.userId,
  });
  if (!guard.ok) return { success: false, error: guard.error };

  // Self-ban prevention.
  if (parsed.data.userId === session.user.id && parsed.data.banned) {
    return { success: false, error: "Не можна забанити самого себе" };
  }

  await db.user.update({
    where: { id: parsed.data.userId },
    data: {
      isBanned: parsed.data.banned,
      banReason: parsed.data.banned ? parsed.data.reason ?? null : null,
    },
  });
  revalidatePath("/admin/users");
  return { success: true };
}

const featureSchema = z.object({
  serverId: z.string().cuid(),
  days: z.number().int().min(1).max(365),
  position: z.number().int().min(1).max(20).default(1),
});

export async function featureServer(input: unknown) {
  const session = await auth();
  if (!session?.user || !hasRole(session.user.role as Role, "ADMIN")) {
    return { success: false, error: "Немає прав" };
  }
  const parsed = featureSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Невалідні дані" };

  const now = new Date();
  const expiresAt = new Date(now.getTime() + parsed.data.days * 24 * 60 * 60 * 1000);

  await db.$transaction([
    db.featuredSlot.upsert({
      where: { serverId: parsed.data.serverId },
      update: { startsAt: now, expiresAt, position: parsed.data.position },
      create: {
        serverId: parsed.data.serverId,
        startsAt: now,
        expiresAt,
        position: parsed.data.position,
      },
    }),
    db.server.update({
      where: { id: parsed.data.serverId },
      data: { isFeatured: true, featuredUntil: expiresAt },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

const tagSchema = z.object({
  slug: z.string().min(2).max(32).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(32),
  description: z.string().max(160).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#22c55e"),
  icon: z.string().max(8).optional(),
  category: z.enum(["GAMEPLAY", "VERSION", "MODE", "ECONOMY", "COMMUNITY"]).default("GAMEPLAY"),
});

export async function createOrUpdateTag(input: unknown) {
  const session = await auth();
  if (!session?.user || !hasRole(session.user.role as Role, "ADMIN")) {
    return { success: false, error: "Немає прав" };
  }
  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Невалідні дані" };

  await db.tag.upsert({
    where: { slug: parsed.data.slug },
    update: parsed.data,
    create: parsed.data,
  });
  revalidatePath("/admin/tags");
  return { success: true };
}

export async function deleteTag(slug: string) {
  const session = await auth();
  if (!session?.user || !hasRole(session.user.role as Role, "ADMIN")) {
    return { success: false, error: "Немає прав" };
  }
  await db.tag.delete({ where: { slug } });
  revalidatePath("/admin/tags");
  return { success: true };
}
