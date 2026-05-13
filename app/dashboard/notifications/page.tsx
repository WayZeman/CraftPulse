import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Сповіщення" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-3 font-display">Сповіщення</h1>
        <p className="text-muted-foreground">Останні події по твоїх серверах та профілю.</p>
      </header>
      {items.length ? (
        <Card>
          <CardContent className="divide-y divide-border/40 p-0">
            {items.map((n) => (
              <div key={n.id} className="flex items-start gap-4 p-5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState icon={Bell} title="Тут поки порожньо" description="Сповіщення про події з'являться тут." />
      )}
    </div>
  );
}
