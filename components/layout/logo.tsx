import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "h-8 w-8", text: "text-base", icon: "h-4 w-4" },
    md: { box: "h-9 w-9", text: "text-lg", icon: "h-5 w-5" },
    lg: { box: "h-12 w-12", text: "text-2xl", icon: "h-7 w-7" },
  } as const;
  const s = sizes[size];

  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <span
        className={cn(
          "relative grid place-items-center rounded-xl bg-gradient-to-br from-primary via-emerald-500 to-cyan-500 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)] transition-transform group-hover:scale-105",
          s.box,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn(s.icon, "text-primary-foreground")}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z" />
          <path d="M3 12h4l3-7 4 14 3-7h4" />
        </svg>
        <span className="absolute -inset-1 -z-10 rounded-2xl bg-primary/30 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
      </span>
      <div className="flex flex-col leading-none">
        <span className={cn("font-display font-extrabold tracking-tight", s.text)}>
          Craft<span className="text-gradient">Pulse</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">UA</span>
      </div>
    </Link>
  );
}
