import { Suspense } from "react";
import { after } from "next/server";
import { searchServers } from "@/services/servers";
import { db } from "@/lib/db";
import { searchServerSchema } from "@/lib/validations";
import { ServerCard } from "@/components/server/server-card";
import { ServerFilters } from "@/components/server/server-filters";
import { ServerPagination } from "@/components/server/server-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { absoluteUrl } from "@/lib/utils";
import { refreshStaleServers } from "@/services/monitoring";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export const metadata = {
  title: "Каталог Minecraft серверів України",
  description:
    "Шукай українські Minecraft сервери за категоріями, версією та режимом. Реальний онлайн і чесні голоси.",
  alternates: { canonical: absoluteUrl("/servers") },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseSearchParams(raw: Record<string, string | string[] | undefined>) {
  const get = (k: string) => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };
  return {
    q: get("q"),
    sort: get("sort"),
    version: get("version"),
    edition: get("edition"),
    page: get("page"),
    perPage: get("perPage"),
    tags: get("tags")?.split(",").filter(Boolean) ?? undefined,
  };
}

async function CatalogResults({ params }: { params: Record<string, string | string[] | undefined> }) {
  const input = searchServerSchema.parse(parseSearchParams(params));
  const result = await searchServers(input);

  if (!result.items.length) {
    return (
      <EmptyState
        icon={Server}
        title="Серверів не знайдено"
        description="Спробуй змінити фільтри або очистити пошук."
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        Знайдено <span className="font-semibold text-foreground">{result.total}</span> серверів
      </p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((s) => (
          <ServerCard key={s.id} server={s} />
        ))}
      </div>
      <ServerPagination page={result.page} totalPages={result.totalPages} />
    </>
  );
}

export default async function ServersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tags = await db.tag.findMany({ orderBy: { name: "asc" } });

  after(async () => {
    try {
      await refreshStaleServers({ limit: 15, maxAgeMs: 60_000 });
    } catch (err) {
      console.error("[catalog] refresh failed", err);
    }
  });

  return (
    <div className="container-x py-10 md:py-14">
      <header className="mb-10">
        <h1 className="heading-2 font-display">Каталог серверів</h1>
        <p className="mt-2 text-muted-foreground">
          Знайди свій ідеальний український Minecraft сервер
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ServerFilters tags={tags} className="lg:sticky lg:top-24 lg:self-start" />
        <div>
          <Suspense fallback={<ResultsSkeleton />}>
            <CatalogResults params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-80" />
      ))}
    </div>
  );
}
