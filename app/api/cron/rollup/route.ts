import { NextResponse } from "next/server";
import { pruneOldLogs, rollupHourlySnapshots } from "@/services/monitoring";
import { isCronAuthorized } from "@/lib/security/cron";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await rollupHourlySnapshots(3);
    const pruned = await pruneOldLogs(7);
    return NextResponse.json({ ok: true, pruned, ts: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/rollup]", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
