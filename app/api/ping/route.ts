import { NextResponse } from "next/server";
import { pingServer } from "@/services/minecraft";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { hostSchema } from "@/lib/validations";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  host: hostSchema,
  port: z.coerce.number().int().min(1).max(65535).optional().default(25565),
  edition: z.enum(["JAVA", "BEDROCK"]).optional().default("JAVA"),
});

export async function GET(req: Request) {
  const rl = await rateLimit("search", getIp(req));
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    host: url.searchParams.get("host") ?? undefined,
    port: url.searchParams.get("port") ?? undefined,
    edition: url.searchParams.get("edition") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await pingServer(parsed.data.host, parsed.data.port, {
      edition: parsed.data.edition,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
