import "server-only";
import { Redis } from "@upstash/redis";

const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

class MemoryStore {
  private store = new Map<string, { value: unknown; expires: number | null }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expires && entry.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: unknown, opts?: { ex?: number }): Promise<"OK"> {
    this.store.set(key, {
      value,
      expires: opts?.ex ? Date.now() + opts.ex * 1000 : null,
    });
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let n = 0;
    for (const k of keys) if (this.store.delete(k)) n++;
    return n;
  }

  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) ?? 0;
    const next = current + 1;
    await this.set(key, next);
    return next;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expires = Date.now() + seconds * 1000;
    return 1;
  }
}

export const redis: Redis | MemoryStore = hasRedis
  ? Redis.fromEnv()
  : (new MemoryStore() as unknown as Redis);

export const REDIS_ENABLED = hasRedis;

// =========================================================================
// Cache helpers
// =========================================================================

export const cacheKeys = {
  server: (slug: string) => `server:${slug}`,
  serverPing: (host: string, port: number) => `ping:${host}:${port}`,
  serverList: (filterHash: string) => `servers:list:${filterHash}`,
  topServers: (sort: string) => `servers:top:${sort}`,
  platformStats: "stats:platform",
  trendingTags: "tags:trending",
  userVotes: (userId: string) => `user:${userId}:votes`,
  voteCooldown: (userId: string, serverId: string) => `vote:cd:${userId}:${serverId}`,
};

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const hit = await redis.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;
  } catch {
    // ignore cache errors
  }
  const value = await fetcher();
  try {
    await redis.set(key, value as unknown as string, { ex: ttlSeconds });
  } catch {
    // ignore cache errors
  }
  return value;
}

export async function invalidateCache(...keys: string[]) {
  try {
    if (keys.length) await redis.del(...keys);
  } catch {
    // ignore cache errors
  }
}
