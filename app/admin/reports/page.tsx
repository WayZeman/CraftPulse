import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Flag } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { ResolveActions } from "./resolve-actions";

export const metadata = { title: "Admin · Reports" };

export default async function ReportsPage() {
  const reports = await db.report.findMany({
    where: { status: { in: ["PENDING", "REVIEWING"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { name: true, email: true } },
      server: { select: { slug: true, name: true } },
    },
  });

  if (!reports.length) {
    return <EmptyState icon={Flag} title="Скарг немає" description="Усе під контролем." />;
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="heading-3 font-display">Скарги</h1>
        <p className="text-muted-foreground">{reports.length} активних скарг.</p>
      </header>
      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-3">
                    <Badge variant="destructive">{r.reason}</Badge>
                    <span className="text-xs text-muted-foreground">
                      від {r.reporter.name ?? r.reporter.email} · {formatRelativeTime(r.createdAt)}
                    </span>
                  </div>
                  {r.server && (
                    <p className="mt-2 text-sm">
                      Сервер: <a className="underline" href={`/servers/${r.server.slug}`}>{r.server.name}</a>
                    </p>
                  )}
                  {r.details && (
                    <p className="mt-2 text-sm text-muted-foreground">{r.details}</p>
                  )}
                </div>
                <ResolveActions id={r.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
