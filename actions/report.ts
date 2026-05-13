"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { reportSchema } from "@/lib/validations";

export async function createReport(input: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Потрібно увійти" };

  const rl = await rateLimit("report", session.user.id);
  if (!rl.success) return { success: false, error: "Занадто багато скарг. Зачекай." };

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Невалідні дані" };
  }

  await db.report.create({
    data: {
      ...parsed.data,
      reportedBy: session.user.id,
    },
  });
  return { success: true };
}

export async function resolveReport(input: { id: string; action: "RESOLVED" | "DISMISSED" }) {
  const session = await auth();
  if (!session?.user || !["MODERATOR", "ADMIN", "OWNER"].includes(session.user.role)) {
    return { success: false, error: "Немає прав" };
  }
  await db.report.update({
    where: { id: input.id },
    data: { status: input.action, resolvedBy: session.user.id, resolvedAt: new Date() },
  });
  return { success: true };
}
