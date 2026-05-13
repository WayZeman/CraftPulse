import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pingServer } from "@/services/minecraft";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9-]{1,64}$/;

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const rl = await rateLimit("api", getIp(req));
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { slug } = await ctx.params;
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const server = await db.server.findUnique({
    where: { slug },
    select: { host: true, port: true, edition: true, status: true },
  });
  if (!server || server.status !== "APPROVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const ping = await pingServer(server.host, server.port, { edition: server.edition });
  return NextResponse.json(ping, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
