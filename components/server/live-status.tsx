"use client";

import { Badge } from "@/components/ui/badge";
import { usePoll } from "@/hooks/use-poll";

interface LivePingShape {
  online: boolean;
  players: { online: number; max: number };
  version?: { name: string } | null;
  latency?: number;
}

async function fetchStatus(slug: string, signal: AbortSignal): Promise<LivePingShape> {
  const res = await fetch(`/api/servers/${encodeURIComponent(slug)}/status`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return (await res.json()) as LivePingShape;
}

/**
 * Renders an online/offline badge that re-polls the server status every 30s.
 * Mounts already populated from SSR so there is no flash on first paint.
 */
export function LiveStatusBadge({ slug, initial }: { slug: string; initial: LivePingShape }) {
  const { data } = usePoll((signal) => fetchStatus(slug, signal), initial, {
    intervalMs: 30_000,
  });
  return (
    <Badge variant={data.online ? "success" : "destructive"}>
      <span className={data.online ? "status-online" : "status-offline"} />
      {data.online ? "Онлайн" : "Офлайн"}
    </Badge>
  );
}

/** Live "X / Y" players counter used in the server stats strip. */
export function LivePlayersValue({ slug, initial }: { slug: string; initial: LivePingShape }) {
  const { data } = usePoll((signal) => fetchStatus(slug, signal), initial, {
    intervalMs: 30_000,
  });
  return (
    <span suppressHydrationWarning>
      {data.players.online}/{data.players.max}
    </span>
  );
}
