"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = {
  bucket: Date | string;
  avgPlayers: number;
  peakPlayers: number;
  uptimePercent: number;
  avgLatency: number;
};

export function ServerChart({ data }: { data: Datum[] }) {
  const series = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        time:
          typeof d.bucket === "string"
            ? new Date(d.bucket).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
            : d.bucket.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }),
        avgPlayers: Math.round(d.avgPlayers),
      })),
    [data],
  );

  if (!data.length) {
    return (
      <div className="grid h-72 place-items-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
        Дані з'являться після кількох годин моніторингу
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="playerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142 76% 56%)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="hsl(142 76% 56%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(190 90% 60%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(190 90% 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              backdropFilter: "blur(12px)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Area
            type="monotone"
            dataKey="peakPlayers"
            stroke="hsl(190 90% 60%)"
            fill="url(#peakGradient)"
            strokeWidth={1.5}
            name="Пік"
          />
          <Area
            type="monotone"
            dataKey="avgPlayers"
            stroke="hsl(142 76% 56%)"
            fill="url(#playerGradient)"
            strokeWidth={2}
            name="Середньо"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
