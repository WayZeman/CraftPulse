"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  host: string;
  port?: number;
  variant?: "default" | "compact" | "large";
  className?: string;
}

export function CopyIpButton({ host, port = 25565, variant = "default", className }: Props) {
  const [copied, setCopied] = useState(false);
  const ip = port === 25565 ? host : `${host}:${port}`;

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      toast.success("IP скопійовано", { description: ip });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Не вдалось скопіювати");
    }
  };

  if (variant === "compact") {
    return (
      <Button
        onClick={copy}
        variant="outline"
        size="sm"
        className={cn("w-full justify-between font-mono text-xs", className)}
      >
        <span className="truncate">{ip}</span>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    );
  }

  if (variant === "large") {
    return (
      <button
        onClick={copy}
        className={cn(
          "group flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-5 py-4 text-left transition-all hover:border-primary/40 hover:bg-background/80",
          className,
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">IP сервера</p>
          <p className="truncate font-mono text-lg font-semibold" title={ip}>
            {ip}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </span>
      </button>
    );
  }

  return (
    <Button onClick={copy} variant="outline" className={className}>
      {copied ? <Check className="text-emerald-400" /> : <Copy />}
      <span className="font-mono">{ip}</span>
    </Button>
  );
}
