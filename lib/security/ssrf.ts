import "server-only";
import net from "node:net";
import dns from "node:dns/promises";

/**
 * IPv4 ranges that MUST NOT be reachable from server-side fetchers/pingers.
 * Blocks loopback, private, link-local (incl. AWS/GCP metadata 169.254.169.254),
 * CGN, IETF reserved, multicast, broadcast, benchmark, future.
 */
const IPV4_BLOCKED_RANGES: ReadonlyArray<[string, number]> = [
  ["0.0.0.0", 8],         // current network
  ["10.0.0.0", 8],        // RFC1918 private
  ["100.64.0.0", 10],     // CGN
  ["127.0.0.0", 8],       // loopback
  ["169.254.0.0", 16],    // link-local (cloud IMDS)
  ["172.16.0.0", 12],     // RFC1918 private
  ["192.0.0.0", 24],      // IETF protocol assignments
  ["192.0.2.0", 24],      // TEST-NET-1
  ["192.168.0.0", 16],    // RFC1918 private
  ["198.18.0.0", 15],     // benchmarking
  ["198.51.100.0", 24],   // TEST-NET-2
  ["203.0.113.0", 24],    // TEST-NET-3
  ["224.0.0.0", 4],       // multicast
  ["240.0.0.0", 4],       // reserved (future / 255.255.255.255 broadcast)
];

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    throw new Error(`Invalid IPv4: ${ip}`);
  }
  return ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0;
}

function isBlockedIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  for (const [range, bits] of IPV4_BLOCKED_RANGES) {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    if ((n & mask) === (ipv4ToInt(range) & mask)) return true;
  }
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  // Normalise: strip zone, lowercase
  const lower = ip.toLowerCase().replace(/%.*/, "");
  if (lower === "::" || lower === "::1") return true; // unspecified + loopback
  if (lower.startsWith("fe80:") || lower.startsWith("fe80::")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // ULA fc00::/7
  if (lower.startsWith("ff")) return true; // multicast
  // IPv4-mapped IPv6 (::ffff:127.0.0.1) — strip prefix and re-check
  const mappedMatch = lower.match(/^::ffff:([0-9a-f.:]+)$/);
  if (mappedMatch) {
    const inner = mappedMatch[1]!;
    if (net.isIPv4(inner) && isBlockedIpv4(inner)) return true;
  }
  return false;
}

function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isBlockedIpv4(ip);
  if (net.isIPv6(ip)) return isBlockedIpv6(ip);
  return true; // unknown → reject
}

/**
 * Validate that a Minecraft server host is safe to ping from the server-side:
 * - reject empty / over-length input
 * - reject any IP that falls into a blocked range
 * - resolve hostname to A + AAAA and reject if any record points to a blocked IP
 *   (DNS rebinding mitigation — we still pass the original host to the ping lib
 *   which will resolve again, but Minecraft pings are short-lived and we cap timeouts)
 *
 * Throws a typed error so callers can surface a clean message.
 */
export class SsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfError";
  }
}

const HOST_MAX_LEN = 253;
const ALLOW_PRIVATE = process.env.ALLOW_PRIVATE_PING === "1"; // dev escape hatch

export async function assertPublicHost(host: string): Promise<void> {
  if (ALLOW_PRIVATE) return;
  if (!host || typeof host !== "string" || host.length > HOST_MAX_LEN) {
    throw new SsrfError("Invalid host");
  }
  // Strip surrounding brackets for IPv6 literals
  const clean = host.replace(/^\[|]$/g, "");

  if (net.isIP(clean)) {
    if (isBlockedIp(clean)) throw new SsrfError("Host points to a private/internal address");
    return;
  }

  // Hostname: resolve A + AAAA, reject if any answer is private
  let answers: string[] = [];
  try {
    const [a, aaaa] = await Promise.allSettled([
      dns.resolve4(clean),
      dns.resolve6(clean),
    ]);
    if (a.status === "fulfilled") answers.push(...a.value);
    if (aaaa.status === "fulfilled") answers.push(...aaaa.value);
  } catch {
    // Resolver itself failed — let the ping fail naturally (we don't want to
    // leak the exact resolver error).
    return;
  }

  if (!answers.length) return; // no records — caller will get an "offline" ping result

  for (const ip of answers) {
    if (isBlockedIp(ip)) {
      throw new SsrfError("Hostname resolves to a private/internal address");
    }
  }
}
