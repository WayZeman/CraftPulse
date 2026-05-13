import { NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9-]{1,64}$/;

export async function GET(req: Request) {
  // OG image generation is CPU-heavy + reads DB → guard with rate limit.
  const rl = await rateLimit("api", getIp(req));
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const url = new URL(req.url);
  const slugRaw = url.searchParams.get("slug");
  const slug = slugRaw && SLUG_RE.test(slugRaw) ? slugRaw : null;

  let title = "CraftPulse";
  let subtitle = "Український Minecraft Server Hub";
  let stats = "";

  if (slug) {
    const s = await db.server.findUnique({
      where: { slug },
      select: { name: true, shortDesc: true, voteCount: true, onlinePlayers: true, maxPlayers: true, status: true },
    });
    if (s && s.status === "APPROVED") {
      title = s.name.slice(0, 64);
      subtitle = (s.shortDesc ?? "").slice(0, 160);
      stats = `${s.onlinePlayers}/${s.maxPlayers} online · ${s.voteCount} votes`;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0a 0%, #0f1a0f 60%, #1a0f1a 100%)",
          padding: 80,
          fontFamily: "system-ui",
          color: "#fff",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            ⚡
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>CraftPulse</span>
            <span style={{ fontSize: 14, color: "#22c55e", letterSpacing: 3, marginTop: 4 }}>UA</span>
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, margin: 0 }}>{title}</h1>
          <p style={{ fontSize: 28, color: "#94a3b8", marginTop: 16, maxWidth: 900 }}>{subtitle}</p>
          {stats && (
            <p style={{ fontSize: 22, color: "#22c55e", marginTop: 24 }}>{stats}</p>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, #22c55e33 0%, transparent 70%)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
