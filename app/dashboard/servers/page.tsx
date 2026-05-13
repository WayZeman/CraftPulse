import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { ServerCard } from "@/components/server/server-card";
import { serverCardSelect } from "@/services/servers";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Server, Plus } from "lucide-react";

export const metadata = { title: "Мої сервери" };

export default async function MyServersPage() {
  const user = await requireUser();
  const servers = await db.server.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    select: serverCardSelect,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="heading-3 font-display">Мої сервери</h1>
          <p className="text-muted-foreground">Керуй своїми проєктами в одному місці.</p>
        </div>
        <Button asChild><Link href="/servers/add"><Plus className="h-4 w-4" /> Додати</Link></Button>
      </header>

      {servers.length ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {servers.map((s) => (
            <ServerCard key={s.id} server={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Server}
          title="Ти ще не додав жодного сервера"
          description="Додавай свої проєкти та починай рости разом з CraftPulse."
          action={<Button asChild><Link href="/servers/add">Додати сервер</Link></Button>}
        />
      )}
    </div>
  );
}
