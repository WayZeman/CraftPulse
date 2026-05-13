import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "", "/servers", "/leaderboard", "/tags", "/about",
    "/terms", "/privacy", "/contact", "/help",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const servers = await db.server.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
    take: 10000,
    orderBy: { updatedAt: "desc" },
  });

  const serverRoutes = servers.map((s) => ({
    url: absoluteUrl(`/servers/${s.slug}`),
    lastModified: s.updatedAt,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  const tags = await db.tag.findMany({ select: { slug: true } });
  const tagRoutes = tags.map((t) => ({
    url: absoluteUrl(`/servers?tags=${t.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...serverRoutes, ...tagRoutes];
}
