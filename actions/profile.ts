"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations";

export async function updateProfile(input: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Потрібно увійти" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Невалідні дані" };
  }

  if (parsed.data.username) {
    const conflict = await db.user.findFirst({
      where: { username: parsed.data.username, NOT: { id: session.user.id } },
    });
    if (conflict) return { success: false, error: "Цей username вже зайнятий" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/users/${parsed.data.username}`);
  return { success: true };
}
