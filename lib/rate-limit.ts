import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { redis, REDIS_ENABLED } from "./redis";

type LimiterKey =
  | "api"
  | "vote"
  | "review"
  | "createServer"
  | "auth"
  | "report"
  | "search";

type Window = `${number} ${"s" | "m" | "h" | "d"}`;

const LIMITS: Record<LimiterKey, { tokens: number; window: Window }> = {
  api:          { tokens: 100, window: "1 m" },
  vote:         { tokens: 5,   window: "1 h" },
  review:       { tokens: 5,   window: "1 h" },
  createServer: { tokens: 5,   window: "1 d" },
  auth:         { tokens: 10,  window: "10 m" },
  report:       { tokens: 5,   window: "1 h" },
  search:       { tokens: 30,  window: "1 m" },
};

const limiters: Partial<Record<LimiterKey, Ratelimit>> = {};

function getLimiter(key: LimiterKey): Ratelimit | null {
  if (!REDIS_ENABLED) return null;
  if (!limiters[key]) {
    const { tokens, window } = LIMITS[key];
    limiters[key] = new Ratelimit({
      redis: redis as never,
      limiter: Ratelimit.slidingWindow(tokens, window),
      analytics: true,
      prefix: `cp:rl:${key}`,
    });
  }
  return limiters[key]!;
}

export async function rateLimit(key: LimiterKey, identifier: string) {
  const limiter = getLimiter(key);
  if (!limiter) {
    return { success: true, remaining: LIMITS[key].tokens, limit: LIMITS[key].tokens, reset: Date.now() };
  }
  return limiter.limit(identifier);
}

export function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}
