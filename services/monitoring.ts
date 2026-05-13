import "server-only";
import { db } from "@/lib/db";
import { pingMany } from "./minecraft";
import { invalidateCache, cacheKeys } from "@/lib/redis";

/**
 * Cron-driven monitoring sweep. Pings APPROVED servers, persists snapshot,
 * updates denormalized fields, and refreshes Redis caches.
 *
 * Designed for serverless: bounded concurrency, idempotent writes.
 */
export async function runMonitoringSweep(limit = 100) {
  const servers = await db.server.findMany({
    where: { status: "APPROVED" },
    select: { id: true, slug: true, host: true, port: true, edition: true, peakPlayers: true },
    orderBy: { lastPing: { sort: "asc", nulls: "first" } },
    take: limit,
  });

  if (!servers.length) return { checked: 0, online: 0, offline: 0 };

  const targets = servers.map((s) => ({ host: s.host, port: s.port, edition: s.edition }));
  const results = await pingMany(targets, 10);

  let online = 0;
  let offline = 0;
  const now = new Date();

  await Promise.all(
    servers.map(async (server, i) => {
      const r = results[i];
      const isOnline = r.online;
      if (isOnline) online++;
      else offline++;

      try {
        await db.$transaction([
          db.server.update({
            where: { id: server.id },
            data: {
              isOnline,
              lastPing: now,
              onlinePlayers: r.players.online,
              maxPlayers: r.players.max,
              peakPlayers: Math.max(server.peakPlayers, r.players.online),
              version: r.version?.name ?? null,
              protocolVer: r.version?.protocol ?? null,
              motd: r.motd ?? null,
              favicon: r.favicon ?? null,
            },
          }),
          db.uptimeLog.create({
            data: {
              serverId: server.id,
              isOnline,
              latency: r.latency ?? null,
              players: r.players.online,
              maxPlayers: r.players.max,
              version: r.version?.name ?? null,
              error: r.error ?? null,
              checkedAt: now,
            },
          }),
        ]);

        await invalidateCache(cacheKeys.server(server.slug));
      } catch (err) {
        console.error(`[monitoring] failed for ${server.host}:${server.port}`, err);
      }
    }),
  );

  await invalidateCache(cacheKeys.platformStats, cacheKeys.topServers("votes"), cacheKeys.topServers("online"));

  return { checked: servers.length, online, offline };
}

/**
 * Aggregate uptime logs into hourly snapshots (runs less frequently).
 * Reduces DB pressure and powers the historical charts.
 */
export async function rollupHourlySnapshots(hoursBack = 2) {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const serverIds = await db.server.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });

  for (const { id: serverId } of serverIds) {
    const logs = await db.uptimeLog.findMany({
      where: { serverId, checkedAt: { gte: since } },
      orderBy: { checkedAt: "asc" },
    });
    if (!logs.length) continue;

    // group by hour
    const buckets = new Map<string, typeof logs>();
    for (const log of logs) {
      const bucketDate = new Date(log.checkedAt);
      bucketDate.setMinutes(0, 0, 0);
      const k = bucketDate.toISOString();
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(log);
    }

    for (const [bucketKey, bucketLogs] of buckets) {
      const samples = bucketLogs.length;
      const onlineSamples = bucketLogs.filter((l) => l.isOnline).length;
      const playerSum = bucketLogs.reduce((a, l) => a + (l.players ?? 0), 0);
      const peakPlayers = bucketLogs.reduce((a, l) => Math.max(a, l.players ?? 0), 0);
      const latencySum = bucketLogs.reduce((a, l) => a + (l.latency ?? 0), 0);

      await db.pingSnapshot.upsert({
        where: { serverId_bucket: { serverId, bucket: new Date(bucketKey) } },
        update: {
          avgPlayers: playerSum / samples,
          peakPlayers,
          uptimePercent: (onlineSamples / samples) * 100,
          avgLatency: Math.round(latencySum / samples),
          samples,
        },
        create: {
          serverId,
          bucket: new Date(bucketKey),
          avgPlayers: playerSum / samples,
          peakPlayers,
          uptimePercent: (onlineSamples / samples) * 100,
          avgLatency: Math.round(latencySum / samples),
          samples,
        },
      });
    }
  }
}

/**
 * Compute overall uptime for a server over `days` days.
 */
export async function getUptimePercent(serverId: string, days = 30): Promise<number> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [total, online] = await Promise.all([
    db.uptimeLog.count({ where: { serverId, checkedAt: { gte: since } } }),
    db.uptimeLog.count({ where: { serverId, checkedAt: { gte: since }, isOnline: true } }),
  ]);
  if (!total) return 0;
  return (online / total) * 100;
}

/**
 * Delete uptime logs older than `days` to keep table small.
 * Aggregated PingSnapshot stays.
 */
export async function pruneOldLogs(days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const { count } = await db.uptimeLog.deleteMany({
    where: { checkedAt: { lt: cutoff } },
  });
  return count;
}
