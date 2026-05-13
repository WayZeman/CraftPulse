import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export const metadata = { title: "Admin · Featured" };

export default async function FeaturedAdminPage() {
  await requireAdmin();
  const slots = await db.featuredSlot.findMany({
    orderBy: { position: "asc" },
    include: { server: { select: { name: true, slug: true } } },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="heading-3 font-display flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-400" /> Featured слоти
        </h1>
        <p className="text-muted-foreground">Сервери, які зараз показуються в блоці на головній.</p>
      </header>
      <Card>
        <CardContent className="divide-y divide-border/40 p-0">
          {slots.length ? (
            slots.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4">
                <Badge variant="accent">#{s.position}</Badge>
                <p className="flex-1 font-semibold">{s.server.name}</p>
                <p className="text-xs text-muted-foreground">
                  до {new Date(s.expiresAt).toLocaleDateString("uk-UA")}
                </p>
              </div>
            ))
          ) : (
            <p className="p-6 text-sm text-muted-foreground">Немає активних слотів.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
