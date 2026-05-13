import "server-only";

/**
 * Authorise an incoming cron request.
 *
 * - In production, `CRON_SECRET` MUST be set and MUST match either the
 *   `Authorization: Bearer <secret>` header (used by Vercel Cron) or `?secret=`.
 * - In development, missing secret is allowed (so local cron calls work);
 *   if set, it is still enforced.
 *
 * Uses constant-time comparison to defeat timing attacks.
 */
export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    // Fail-closed in production: without a configured secret the endpoint must
    // not be reachable from the public internet.
    return !isProd;
  }

  const header = req.headers.get("authorization") ?? "";
  const headerToken = header.startsWith("Bearer ") ? header.slice(7) : "";
  const url = new URL(req.url);
  const queryToken = url.searchParams.get("secret") ?? "";

  return safeEqual(headerToken, secret) || safeEqual(queryToken, secret);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
