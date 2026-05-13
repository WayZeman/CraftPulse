import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Мої голоси" };

export default async function VotesPage() {
  const user = await requireUser();
  const votes = await db.vote.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      server: { select: { slug: true, name: true, host: true, logo: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-3 font-display">Мої голоси</h1>
        <p className="text-muted-foreground">Серверів, за які ти голосував.</p>
      </header>
      {votes.length ? (
        <Card>
          <CardContent className="divide-y divide-border/40 p-0">
            {votes.map((v) => (
              <Link
                key={v.id}
                href={`/servers/${v.server.slug}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{v.server.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{v.server.host}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(v.createdAt)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState icon={Star} title="Ти ще ні за кого не голосував" description="Знайди улюблений сервер і підтримай його!" />
      )}
    </div>
  );
}
