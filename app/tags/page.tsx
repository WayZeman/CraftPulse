import Link from "next/link";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Категорії Minecraft серверів",
  description: "Усі категорії Minecraft серверів: Survival, PvP, Vanilla, Modded, SkyBlock та інші.",
  alternates: { canonical: absoluteUrl("/tags") },
};

export default async function TagsPage() {
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { servers: true } } },
  });

  return (
    <div className="container-x py-10 md:py-14">
      <header className="mb-10 text-center">
        <h1 className="heading-2 font-display">Категорії</h1>
        <p className="mt-3 text-muted-foreground">Знайди сервери за стилем гри</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/servers?tags=${tag.slug}`}
            className="group showcase-card flex items-center gap-4 p-5"
          >
            <span
              className="grid h-12 w-12 place-items-center rounded-xl text-2xl ring-1"
              style={{
                background: `${tag.color}15`,
                color: tag.color,
                boxShadow: `inset 0 0 0 1px ${tag.color}30`,
              }}
            >
              {tag.icon ?? "#"}
            </span>
            <div>
              <p className="font-display text-lg font-semibold" style={{ color: tag.color }}>
                {tag.name}
              </p>
              <p className="text-sm text-muted-foreground">{tag._count.servers} серверів</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
