import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerChart } from "@/components/server/server-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export const metadata = { title: "Аналітика" };

export default async function AnalyticsPage() {
  const user = await requireUser();
  const servers = await db.server.findMany({
    where: { ownerId: user.id, status: "APPROVED" },
    include: {
      pingHistory: { orderBy: { bucket: "asc" }, take: 168 },
    },
  });

  if (!servers.length) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Аналітика буде тут"
        description="Спочатку додай та підтверди свій сервер."
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-3 font-display">Аналітика</h1>
        <p className="text-muted-foreground">Графіки активності гравців по твоїх серверах.</p>
      </header>
      <div className="space-y-6">
        {servers.map((s) => (
          <Card key={s.id}>
            <CardHeader><CardTitle>{s.name}</CardTitle></CardHeader>
            <CardContent>
              <ServerChart data={s.pingHistory} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
