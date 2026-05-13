import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Flag, Server, Star, Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Admin · Overview" };

export default async function AdminOverview() {
  const [
    totalUsers, totalServers, totalVotes, totalReviews,
    pending, online, openReports, last7dUsers,
  ] = await Promise.all([
    db.user.count(),
    db.server.count(),
    db.vote.count(),
    db.review.count(),
    db.server.count({ where: { status: "PENDING" } }),
    db.server.count({ where: { isOnline: true } }),
    db.report.count({ where: { status: { in: ["PENDING", "REVIEWING"] } } }),
    db.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);

  const tiles = [
    { icon: Users, label: "Користувачів", value: totalUsers, accent: "text-cyan-400" },
    { icon: Server, label: "Серверів", value: totalServers, accent: "text-emerald-400" },
    { icon: Star, label: "Голосів", value: totalVotes, accent: "text-amber-400" },
    { icon: Activity, label: "Онлайн зараз", value: online, accent: "text-violet-400" },
    { icon: Flag, label: "Скарг", value: openReports, accent: "text-red-400" },
    { icon: Users, label: "Нових за 7д", value: last7dUsers, accent: "text-blue-400" },
    { icon: Server, label: "На модерації", value: pending, accent: "text-yellow-400" },
    { icon: Star, label: "Відгуків", value: totalReviews, accent: "text-pink-400" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-3 font-display">Admin Overview</h1>
        <p className="text-muted-foreground">Швидкий огляд платформи в реальному часі.</p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="p-5">
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-background/60 ${t.accent}`}>
                <t.icon className="h-4 w-4" />
              </div>
              <p className="font-display text-2xl font-bold">{formatNumber(t.value)}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
