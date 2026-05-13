import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { SearchServerInput } from "@/lib/validations";
import { cached, cacheKeys } from "@/lib/redis";

export const serverCardSelect = {
  id: true,
  slug: true,
  name: true,
  shortDesc: true,
  description: true,
  host: true,
  port: true,
  logo: true,
  banner: true,
  favicon: true,
  version: true,
  edition: true,
  isOnline: true,
  isFeatured: true,
  onlinePlayers: true,
  maxPlayers: true,
  voteCount: true,
  reviewCount: true,
  averageRating: true,
  createdAt: true,
  tags: { include: { tag: true } },
  _count: { select: { votes: true, reviews: true } },
} satisfies Prisma.ServerSelect;

export type ServerCardData = Prisma.ServerGetPayload<{ select: typeof serverCardSelect }>;

function buildServerWhere(input: Partial<SearchServerInput>): Prisma.ServerWhereInput {
  const where: Prisma.ServerWhereInput = { status: "APPROVED" };
  if (input.q) {
    where.OR = [
      { name: { contains: input.q, mode: "insensitive" } },
      { description: { contains: input.q, mode: "insensitive" } },
      { host: { contains: input.q, mode: "insensitive" } },
    ];
  }
  if (input.tags?.length) {
    where.tags = { some: { tag: { slug: { in: input.tags } } } };
  }
  if (input.version) {
    where.version = { contains: input.version };
  }
  if (input.edition) {
    where.edition = input.edition;
  }
  return where;
}

function buildServerOrder(sort: SearchServerInput["sort"]): Prisma.ServerOrderByWithRelationInput[] {
  switch (sort) {
    case "online":
      return [{ isOnline: "desc" }, { onlinePlayers: "desc" }];
    case "new":
      return [{ createdAt: "desc" }];
    case "rating":
      return [{ averageRating: "desc" }, { reviewCount: "desc" }];
    case "trending":
      // Trending = recent votes + high online players
      return [{ voteCount: "desc" }, { onlinePlayers: "desc" }];
    case "votes":
    default:
      return [{ isFeatured: "desc" }, { voteCount: "desc" }];
  }
}

export async function searchServers(input: SearchServerInput) {
  const where = buildServerWhere(input);
  const orderBy = buildServerOrder(input.sort);
  const skip = (input.page - 1) * input.perPage;

  const [items, total] = await Promise.all([
    db.server.findMany({
      where,
      orderBy,
      skip,
      take: input.perPage,
      select: serverCardSelect,
    }),
    db.server.count({ where }),
  ]);

  return {
    items,
    total,
    page: input.page,
    perPage: input.perPage,
    totalPages: Math.ceil(total / input.perPage),
  };
}

export async function getFeaturedServers(limit = 6): Promise<ServerCardData[]> {
  return cached(`servers:featured:${limit}`, 120, async () => {
    return db.server.findMany({
      where: {
        status: "APPROVED",
        isFeatured: true,
      },
      orderBy: [{ isFeatured: "desc" }, { voteCount: "desc" }],
      take: limit,
      select: serverCardSelect,
    });
  });
}

export async function getTopServers(
  sort: "votes" | "online" | "new" | "trending" = "votes",
  limit = 10,
): Promise<ServerCardData[]> {
  return cached(cacheKeys.topServers(sort), 60, async () => {
    const orderBy = buildServerOrder(sort);
    return db.server.findMany({
      where: { status: "APPROVED" },
      orderBy,
      take: limit,
      select: serverCardSelect,
    });
  });
}

export async function getServerBySlug(slug: string) {
  return db.server.findUnique({
    where: { slug },
    include: {
      owner: {
        select: { id: true, name: true, username: true, image: true, role: true },
      },
      tags: { include: { tag: true } },
      screenshots: { orderBy: { order: "asc" } },
      _count: { select: { votes: true, reviews: true } },
    },
  });
}

export async function getServerCharts(serverId: string, days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db.pingSnapshot.findMany({
    where: { serverId, bucket: { gte: since } },
    orderBy: { bucket: "asc" },
    select: {
      bucket: true,
      avgPlayers: true,
      peakPlayers: true,
      uptimePercent: true,
      avgLatency: true,
    },
  });
}

export async function getPlatformStats() {
  return cached(cacheKeys.platformStats, 60, async () => {
    const [totalServers, totalUsers, totalVotes, onlineSum] = await Promise.all([
      db.server.count({ where: { status: "APPROVED" } }),
      db.user.count(),
      db.vote.count(),
      db.server.aggregate({
        where: { status: "APPROVED", isOnline: true },
        _sum: { onlinePlayers: true },
      }),
    ]);
    return {
      totalServers,
      totalUsers,
      totalVotes,
      totalOnline: onlineSum._sum.onlinePlayers ?? 0,
    };
  });
}

export async function getTrendingTags(limit = 12) {
  return cached(`tags:trending:${limit}`, 300, async () => {
    return db.tag.findMany({
      orderBy: { servers: { _count: "desc" } },
      take: limit,
      include: { _count: { select: { servers: true } } },
    });
  });
}

export async function recalcServerStats(serverId: string) {
  const [voteCount, reviewAgg, reviewCount] = await Promise.all([
    db.vote.count({ where: { serverId } }),
    db.review.aggregate({ where: { serverId, isHidden: false }, _avg: { rating: true } }),
    db.review.count({ where: { serverId, isHidden: false } }),
  ]);
  await db.server.update({
    where: { id: serverId },
    data: {
      voteCount,
      reviewCount,
      averageRating: reviewAgg._avg.rating ?? 0,
    },
  });
}
