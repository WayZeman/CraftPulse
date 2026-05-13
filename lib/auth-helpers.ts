import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

const ROLE_HIERARCHY: Role[] = ["USER", "VERIFIED", "MODERATOR", "ADMIN", "OWNER"];

export function hasRole(userRole: Role | undefined, required: Role): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(required);
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Returns the current session user, redirecting to login if absent.
 * Also blocks banned accounts (defence-in-depth: the JWT callback already
 * drops banned tokens, but this guards stale sessions and direct DB changes).
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/dashboard");
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { isBanned: true },
  });
  if (dbUser?.isBanned) redirect("/login?error=banned");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (!hasRole(user.role as Role, role)) redirect("/");
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireModerator() {
  return requireRole("MODERATOR");
}

/**
 * Authorize a privileged action against a *target user*. Implements
 * "OWNERs can only be acted upon by OWNERs themselves".
 */
export async function assertCanActOnUser(opts: {
  actorRole: Role;
  actorId: string;
  targetUserId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasRole(opts.actorRole, "ADMIN")) {
    return { ok: false, error: "Немає прав" };
  }
  const target = await db.user.findUnique({
    where: { id: opts.targetUserId },
    select: { role: true },
  });
  if (!target) return { ok: false, error: "Користувача не знайдено" };
  if (target.role === "OWNER" && (opts.actorRole !== "OWNER" || opts.actorId !== opts.targetUserId)) {
    return { ok: false, error: "OWNER може змінювати лише сам себе" };
  }
  return { ok: true };
}
