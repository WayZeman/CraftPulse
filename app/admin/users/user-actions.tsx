"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toggleBanUser, updateUserRole } from "@/actions/admin";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

const ROLES: Role[] = ["USER", "VERIFIED", "MODERATOR", "ADMIN", "OWNER"];

export function UserActions({
  userId,
  currentRole,
  isBanned,
}: {
  userId: string;
  currentRole: Role;
  isBanned: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function changeRole(role: Role) {
    startTransition(async () => {
      const res = await updateUserRole({ userId, role });
      if (res.success) toast.success("Роль оновлено");
      else toast.error("Помилка", { description: res.error });
    });
  }

  function toggleBan() {
    const reason = !isBanned ? window.prompt("Причина блокування?") ?? "" : undefined;
    startTransition(async () => {
      const res = await toggleBanUser({ userId, banned: !isBanned, reason });
      if (res.success) toast.success(isBanned ? "Розблоковано" : "Заблоковано");
      else toast.error("Помилка", { description: res.error });
    });
  }

  return (
    <div className="flex gap-2">
      <Select value={currentRole} onValueChange={(v) => changeRole(v as Role)} disabled={isPending}>
        <SelectTrigger className="h-9 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant={isBanned ? "outline" : "destructive"}
        onClick={toggleBan}
        disabled={isPending}
      >
        {isBanned ? "Розблок." : "Бан"}
      </Button>
    </div>
  );
}
