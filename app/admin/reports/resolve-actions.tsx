"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resolveReport } from "@/actions/report";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function ResolveActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function run(action: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      const res = await resolveReport({ id, action });
      if (res.success) toast.success(action === "RESOLVED" ? "Вирішено" : "Відхилено");
      else toast.error("Помилка");
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => run("RESOLVED")} disabled={isPending}>
        <Check className="h-3.5 w-3.5" /> Вирішити
      </Button>
      <Button size="sm" variant="outline" onClick={() => run("DISMISSED")} disabled={isPending}>
        <X className="h-3.5 w-3.5" /> Відхилити
      </Button>
    </div>
  );
}
