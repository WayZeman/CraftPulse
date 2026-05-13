/**
 * Whitelist a user-supplied return URL to prevent open-redirect attacks.
 *
 * Only same-origin paths (starting with `/` but NOT `//`) are allowed.
 * Anything else (absolute URLs, protocol-relative, javascript:, data:, ...) is
 * replaced with the provided fallback.
 *
 * Safe for use with `redirect()`, `<Link href>`, NextAuth `signIn({ callbackUrl })`, etc.
 */
export function safeReturnUrl(input: unknown, fallback = "/dashboard"): string {
  if (typeof input !== "string") return fallback;
  const v = input.trim();
  if (!v) return fallback;
  // Reject protocol-relative (//evil.com), absolute (http(s):, javascript:, data:, vbscript:, etc.)
  if (!v.startsWith("/") || v.startsWith("//")) return fallback;
  if (/^\/[\\\t\n\r]/.test(v)) return fallback; // odd backslash/whitespace tricks
  // Final shape check: must be a sane internal path.
  if (!/^\/[A-Za-z0-9_\-./?&=%#[\]:+,]*$/.test(v)) return fallback;
  return v;
}
