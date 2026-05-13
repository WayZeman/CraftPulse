import { getFeaturedServers, getTopServers } from "@/services/servers";
import { ServerCard } from "@/components/server/server-card";
import { SectionHeading } from "./section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";

export async function FeaturedGrid() {
  const featured = await getFeaturedServers(6);
  if (!featured.length) {
    // Fallback: show top servers if no featured slots
    const top = await getTopServers("votes", 6);
    if (!top.length) {
      return (
        <section className="container-x py-20">
          <EmptyState
            icon={Server}
            title="Поки немає серверів"
            description="Стань першим — додай свій сервер прямо зараз!"
          />
        </section>
      );
    }
    return (
      <section className="container-x py-20">
        <SectionHeading
          eyebrow="Топ"
          title="Найкращі сервери"
          description="Лідери за голосами спільноти"
          href="/servers?sort=votes"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((s, i) => (
            <ServerCard key={s.id} server={s} rank={i + 1} />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="container-x py-20">
      <SectionHeading
        eyebrow="Виділені"
        title="Featured сервери"
        description="Підібрані модерацією проєкти з високою активністю"
        href="/servers/add"
        hrefLabel="Додати сервер"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((s) => (
          <ServerCard key={s.id} server={s} variant="featured" />
        ))}
      </div>
    </section>
  );
}
