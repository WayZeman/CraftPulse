import { getTopServers } from "@/services/servers";
import { ServerCard } from "@/components/server/server-card";
import { SectionHeading } from "./section-heading";

export async function TopServersSection() {
  const servers = await getTopServers("votes", 6);
  if (!servers.length) return null;
  return (
    <section className="container-x py-12">
      <SectionHeading
        eyebrow="Лідери"
        title="Топ за голосами"
        description="Ці сервери підкорили серця спільноти"
        href="/servers?sort=votes"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {servers.map((s, i) => (
          <ServerCard key={s.id} server={s} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}

export async function NewestServersSection() {
  const servers = await getTopServers("new", 6);
  if (!servers.length) return null;
  return (
    <section className="container-x py-12">
      <SectionHeading
        eyebrow="Свіже"
        title="Найновіші сервери"
        description="Свіжі проєкти, які щойно з'явились"
        href="/servers?sort=new"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {servers.map((s) => (
          <ServerCard key={s.id} server={s} />
        ))}
      </div>
    </section>
  );
}
