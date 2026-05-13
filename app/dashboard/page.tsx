import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Server as ServerIcon, Plus, TrendingUp, Star, Users } from "lucide-react";
import { formatNumber, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Дашборд" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [servers, votesGiven, notifications] = await Promise.all([
    db.server.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, slug: true, name: true, host: true, isOnline: true,
        onlinePlayers: true, maxPlayers: true, voteCount: true, status: true,
      },
    }),
    db.vote.count({ where: { userId: user.id } }),
    db.notification.findMany({
      where: { userId: user.id, read: false },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totals = await db.server.aggregate({
    where: { ownerId: user.id },
    _sum: { voteCount: true, onlinePlayers: true },
    _count: { _all: true },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <h1 className="heading-3 font-display">Привіт, {user.name?.split(" ")[0] ?? "гравець"}!</h1>
        <p className="text-muted-foreground">Ось як справи у твоєму CraftPulse сьогодні.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={<ServerIcon className="h-4 w-4" />} label="Серверів" value={totals._count._all} />
        <StatTile icon={<Star className="h-4 w-4" />} label="Зібрано голосів" value={totals._sum.voteCount ?? 0} />
        <StatTile icon={<Users className="h-4 w-4" />} label="Гравців онлайн" value={totals._sum.onlinePlayers ?? 0} />
        <StatTile icon={<TrendingUp className="h-4 w-4" />} label="Моїх голосів" value={votesGiven} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Мої сервери</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/servers/add"><Plus className="h-4 w-4" /> Додати</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {servers.length ? (
            <ul className="space-y-2">
              {servers.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex-1 min-w-0">
                    <Link href={`/servers/${s.slug}`} className="block">
                      <p className="truncate font-semibold hover:text-primary">{s.name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{s.host}</p>
                    </Link>
                  </div>
                  <Badge variant={s.status === "APPROVED" ? "success" : s.status === "PENDING" ? "warning" : "destructive"}>
                    {s.status}
                  </Badge>
                  <div className="hidden text-sm text-muted-foreground md:block">
                    {s.onlinePlayers}/{s.maxPlayers}
                  </div>
                  <div className="text-sm">
                    <Star className="mr-1 inline h-3.5 w-3.5 text-amber-400" />
                    {formatNumber(s.voteCount)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={ServerIcon}
              title="У тебе ще немає серверів"
              description="Додай свій перший сервер і почни збирати голоси!"
              action={
                <Button asChild><Link href="/servers/add">Додати сервер</Link></Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Останні сповіщення</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length ? (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg border border-border/60 bg-background/40 p-3 text-sm"
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Немає нових сповіщень.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 font-display text-2xl font-bold">{formatNumber(value)}</p>
    </div>
  );
}
