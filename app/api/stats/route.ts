import { NextResponse } from "next/server";
import { getPlatformStats } from "@/services/servers";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Public, cached platform stats endpoint used by the Hero polling widget.
 * The underlying `getPlatformStats()` is itself cached for 60s; we expose
 * an additional CDN cache-control so repeated polls coalesce upstream.
 */
export async function GET(req: Request) {
  const rl = await rateLimit("api", getIp(req));
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const stats = await getPlatformStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, max-age=15, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
