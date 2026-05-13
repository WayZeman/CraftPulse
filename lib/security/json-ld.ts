/**
 * Serialize an object as JSON-LD safe for injection into <script type="application/ld+json">.
 *
 * `JSON.stringify` produces valid JSON but does NOT escape `</`, `<!--`, `<![CDATA[`,
 * or U+2028 / U+2029 which can break out of the surrounding <script> block and
 * lead to XSS when paired with `dangerouslySetInnerHTML`.
 *
 * This helper performs the well-known HTML-safe replacements while keeping the
 * output as valid JSON.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
