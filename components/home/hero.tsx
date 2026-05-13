"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { usePoll } from "@/hooks/use-poll";

interface PlatformStats {
  totalServers: number;
  totalUsers: number;
  totalOnline: number;
  totalVotes: number;
}

async function fetchStats(signal: AbortSignal): Promise<PlatformStats> {
  const res = await fetch("/api/stats", { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`stats ${res.status}`);
  return (await res.json()) as PlatformStats;
}

export function Hero({ stats: initialStats }: { stats: PlatformStats }) {
  // Poll the live platform counters every 30s; pauses while the tab is hidden.
  const { data: stats } = usePoll(fetchStats, initialStats, { intervalMs: 30_000 });
  return (
    <section className="relative overflow-hidden">
      {/* animated grid + aurora */}
      <div className="aurora-bg pointer-events-none absolute inset-0" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container-x relative py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="accent" className="mb-6 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs">Моніторинг українських серверів 🇺🇦</span>
          </Badge>

          <h1 className="heading-1 font-display">
            Найкращі <span className="text-gradient">українські</span>
            <br />
            Minecraft сервери
          </h1>

          <p className="lead mx-auto mt-6 max-w-2xl">
            Реальний моніторинг, чесний рейтинг та активна спільнота. Знаходь сервери, голосуй за
            улюблені та додавай свої — все на одній платформі.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="accent">
              <Link href="/servers">
                <Zap className="h-5 w-5" />
                Каталог серверів
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/servers/add">Додати свій сервер</Link>
            </Button>
          </div>
        </motion.div>

        {/* live stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          <StatTile label="Серверів" value={formatNumber(stats.totalServers)} accent="emerald" />
          <StatTile label="Гравців онлайн" value={formatNumber(stats.totalOnline)} accent="cyan" live />
          <StatTile label="Учасників" value={formatNumber(stats.totalUsers)} accent="violet" />
          <StatTile label="Голосів" value={formatNumber(stats.totalVotes)} accent="amber" />
        </motion.div>
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  accent,
  live,
}: {
  label: string;
  value: string;
  accent: "emerald" | "cyan" | "violet" | "amber";
  live?: boolean;
}) {
  const accentMap = {
    emerald: "from-emerald-400/20 to-emerald-500/0 text-emerald-300",
    cyan: "from-cyan-400/20 to-cyan-500/0 text-cyan-300",
    violet: "from-violet-400/20 to-violet-500/0 text-violet-300",
    amber: "from-amber-400/20 to-amber-500/0 text-amber-300",
  } as const;
  return (
    <div className="glass relative rounded-2xl p-5 text-center">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${accentMap[accent]} opacity-50`} />
      <div className="relative">
        <div className="flex items-center justify-center gap-1.5">
          <p className="font-display text-3xl font-bold md:text-4xl">{value}</p>
          {live && (
            <span className="relative ml-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          )}
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
