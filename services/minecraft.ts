import "server-only";
import { status, statusBedrock } from "minecraft-server-util";
import { cacheKeys, redis } from "@/lib/redis";
import { assertPublicHost, SsrfError } from "@/lib/security/ssrf";

export type PingResult = {
  online: boolean;
  host: string;
  port: number;
  players: { online: number; max: number; sample?: { name: string; id?: string }[] };
  version?: { name: string; protocol: number };
  motd?: string;
  favicon?: string;
  latency?: number;
  error?: string;
  checkedAt: string;
};

const PING_TIMEOUT_MS = 5_000;
const CACHE_TTL_SECONDS = 60;
const MAX_RETRIES = 1;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Ping timeout (${ms}ms)`)), ms),
    ),
  ]);
}

async function pingJava(host: string, port: number): Promise<PingResult> {
  const start = Date.now();
  const result = await withTimeout(
    status(host, port, { timeout: PING_TIMEOUT_MS, enableSRV: true }),
    PING_TIMEOUT_MS,
  );
  return {
    online: true,
    host,
    port,
    players: {
      online: result.players.online ?? 0,
      max: result.players.max ?? 0,
      sample: result.players.sample?.map((p) => ({ name: p.name, id: p.id })) ?? [],
    },
    version: { name: result.version.name, protocol: result.version.protocol },
    motd: result.motd.raw,
    favicon: result.favicon ?? undefined,
    latency: Date.now() - start,
    checkedAt: new Date().toISOString(),
  };
}

async function pingBedrock(host: string, port: number): Promise<PingResult> {
  const start = Date.now();
  const result = await withTimeout(
    statusBedrock(host, port, { timeout: PING_TIMEOUT_MS }),
    PING_TIMEOUT_MS,
  );
  return {
    online: true,
    host,
    port,
    players: {
      online: result.players.online ?? 0,
      max: result.players.max ?? 0,
    },
    version: { name: result.version.name, protocol: result.version.protocol },
    motd: result.motd.raw,
    latency: Date.now() - start,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Ping a Minecraft server with retry, edition detection, and Redis caching.
 */
export async function pingServer(
  host: string,
  port = 25565,
  opts: { edition?: "JAVA" | "BEDROCK" | "CROSS_PLATFORM"; force?: boolean } = {},
): Promise<PingResult> {
  const cacheKey = cacheKeys.serverPing(host, port);

  if (!opts.force) {
    try {
      const cached = await redis.get<PingResult>(cacheKey);
      if (cached) return cached;
    } catch {
      // fall through
    }
  }

  // SSRF guard: refuse to ping private/internal targets.
  try {
    await assertPublicHost(host);
  } catch (err) {
    const msg = err instanceof SsrfError ? err.message : "Host blocked";
    const blocked: PingResult = {
      online: false,
      host,
      port,
      players: { online: 0, max: 0 },
      error: msg,
      checkedAt: new Date().toISOString(),
    };
    try { await redis.set(cacheKey, blocked, { ex: 300 }); } catch { /* ignore */ }
    return blocked;
  }

  const edition = opts.edition ?? "JAVA";
  const pingFn = edition === "BEDROCK" ? pingBedrock : pingJava;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await pingFn(host, port);
      try {
        await redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS });
      } catch {
        // ignore cache errors
      }
      return result;
    } catch (err) {
      lastError = err as Error;
      // small backoff before retry
      if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, 300));
    }
  }

  const offline: PingResult = {
    online: false,
    host,
    port,
    players: { online: 0, max: 0 },
    error: lastError?.message ?? "Unknown error",
    checkedAt: new Date().toISOString(),
  };

  try {
    // cache offline status for shorter time
    await redis.set(cacheKey, offline, { ex: 30 });
  } catch {
    // ignore
  }
  return offline;
}

/**
 * Ping many servers in parallel with bounded concurrency.
 */
export async function pingMany(
  targets: Array<{ host: string; port: number; edition?: "JAVA" | "BEDROCK" | "CROSS_PLATFORM" }>,
  concurrency = 10,
): Promise<PingResult[]> {
  const results: PingResult[] = [];
  let index = 0;

  async function worker() {
    while (index < targets.length) {
      const i = index++;
      const t = targets[i];
      results[i] = await pingServer(t.host, t.port, { edition: t.edition, force: true });
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));
  return results;
}
