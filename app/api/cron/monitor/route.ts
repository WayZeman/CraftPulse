import { NextResponse } from "next/server";
import { runMonitoringSweep } from "@/services/monitoring";
import { isCronAuthorized } from "@/lib/security/cron";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(200, Number(url.searchParams.get("limit") ?? 100));

  try {
    const result = await runMonitoringSweep(limit);
    return NextResponse.json({ ok: true, ...result, ts: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/monitor]", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
