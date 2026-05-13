import { getTopServers } from "@/services/servers";
import { ServerCard } from "@/components/server/server-card";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 60;

export const metadata = {
  title: "Топ Minecraft серверів України",
  description: "Топ-100 українських Minecraft серверів за голосами, онлайном та рейтингом.",
  alternates: { canonical: absoluteUrl("/leaderboard") },
};

export default async function LeaderboardPage() {
  const top = await getTopServers("votes", 30);

  return (
    <div className="container-x py-10 md:py-14">
      <header className="mb-10 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Hall of fame
        </p>
        <h1 className="heading-2 font-display">Топ серверів</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Найвпливовіші українські Minecraft проєкти за голосами спільноти
        </p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((s, i) => (
          <ServerCard key={s.id} server={s} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
