import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { REDIS_ENABLED } from "@/lib/redis";

export const runtime = "nodejs";

export async function GET() {
  const started = Date.now();
  let dbOk = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return NextResponse.json({
    status: dbOk ? "ok" : "degraded",
    db: dbOk,
    redis: REDIS_ENABLED,
    uptimeMs: Date.now() - started,
    ts: new Date().toISOString(),
  });
}
