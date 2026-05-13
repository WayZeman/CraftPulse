import "server-only";
import { createHmac } from "node:crypto";

/**
 * HMAC-SHA-256 with the app secret. Used for anti-fraud fingerprints (IP hashes,
 * device fingerprints) so that database leakage does not allow rainbow-table
 * reversal of the small IPv4 space.
 *
 * Falls back to a derived constant when AUTH_SECRET is missing (dev only) so
 * we never crash, but logs a warning.
 */
const SECRET = process.env.AUTH_SECRET ?? "craftpulse-dev-fallback-do-not-use-in-prod";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  // eslint-disable-next-line no-console
  console.warn("[security] AUTH_SECRET is missing — HMAC hashes are insecure.");
}

export function hmacFingerprint(value: string, scope = "fp"): string {
  return createHmac("sha256", SECRET).update(`${scope}|${value}`).digest("hex");
}
