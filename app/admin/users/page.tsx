import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { UserActions } from "./user-actions";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { servers: true, votes: true } } },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="heading-3 font-display">Користувачі</h1>
        <p className="text-muted-foreground">Останні 100 користувачів платформи.</p>
      </header>
      <Card>
        <CardContent className="divide-y divide-border/40 p-0">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <Avatar>
                {u.image && <AvatarImage src={u.image} alt="" />}
                <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="truncate font-medium">{u.name ?? u.username ?? u.email}</p>
                  <Badge variant={u.role === "USER" ? "outline" : "accent"}>{u.role}</Badge>
                  {u.isBanned && <Badge variant="destructive">BANNED</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="hidden text-xs text-muted-foreground md:block">
                <p>{u._count.servers} серверів</p>
                <p>{u._count.votes} голосів</p>
              </div>
              <div className="hidden text-xs text-muted-foreground md:block">
                {formatRelativeTime(u.createdAt)}
              </div>
              <UserActions userId={u.id} currentRole={u.role} isBanned={u.isBanned} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
