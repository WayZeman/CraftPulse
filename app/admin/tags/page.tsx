import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Tags" };

export default async function TagsAdminPage() {
  await requireAdmin();
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { servers: true } } },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="heading-3 font-display">Теги</h1>
        <p className="text-muted-foreground">Категорії для серверів.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Усі теги ({tags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge
                key={t.id}
                variant="outline"
                style={{ borderColor: `${t.color}50`, color: t.color }}
                className="text-sm"
              >
                {t.icon} {t.name} <span className="ml-1 text-muted-foreground">·{t._count.servers}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
