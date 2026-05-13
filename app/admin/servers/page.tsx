import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Admin · Servers" };

export default async function AdminServersPage() {
  const servers = await db.server.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { owner: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="heading-3 font-display">Усі сервери</h1>
        <p className="text-muted-foreground">Останні 100 серверів.</p>
      </header>
      <Card>
        <CardContent className="divide-y divide-border/40 p-0">
          {servers.map((s) => (
            <div key={s.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <Link href={`/servers/${s.slug}`} className="block">
                  <p className="truncate font-semibold hover:text-primary">{s.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{s.host}</p>
                </Link>
              </div>
              <Badge variant={s.status === "APPROVED" ? "success" : s.status === "PENDING" ? "warning" : "destructive"}>
                {s.status}
              </Badge>
              <p className="hidden text-sm text-muted-foreground md:block">{formatNumber(s.voteCount)} 🗳</p>
              <p className="hidden text-xs text-muted-foreground md:block">{formatRelativeTime(s.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
