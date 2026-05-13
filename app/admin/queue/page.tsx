import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldCheck } from "lucide-react";
import { ModerationActions } from "./moderation-actions";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Admin · Queue" };

export default async function ModerationQueuePage() {
  const items = await db.server.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      owner: { select: { name: true, email: true } },
      tags: { include: { tag: true } },
    },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="heading-3 font-display">Черга модерації</h1>
        <p className="text-muted-foreground">{items.length} серверів очікують перевірки.</p>
      </header>
      {items.length ? (
        <div className="space-y-3">
          {items.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <Link href={`/servers/${s.slug}`} className="font-display text-lg font-bold hover:text-primary">
                        {s.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        від {s.owner.name ?? s.owner.email} · {formatRelativeTime(s.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{s.host}:{s.port}</p>
                    <p className="mt-2 line-clamp-2 text-sm">{s.shortDesc}</p>
                  </div>
                  <ModerationActions id={s.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ShieldCheck} title="Черга порожня" description="Всі сервери перевірено. Молодець!" />
      )}
    </div>
  );
}
