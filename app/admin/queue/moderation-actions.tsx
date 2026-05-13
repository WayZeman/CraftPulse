"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { moderateServer } from "@/actions/server";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";

export function ModerationActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function run(action: "approve" | "reject") {
    const reason = action === "reject" ? window.prompt("Причина відмови?") ?? "" : undefined;
    startTransition(async () => {
      const res = await moderateServer({ id, action, reason });
      if (res.success) toast.success(action === "approve" ? "Схвалено" : "Відхилено");
      else toast.error("Помилка", { description: res.error });
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => run("approve")} disabled={isPending}>
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Схвалити
      </Button>
      <Button size="sm" variant="destructive" onClick={() => run("reject")} disabled={isPending}>
        <X className="h-3.5 w-3.5" /> Відхилити
      </Button>
    </div>
  );
}
