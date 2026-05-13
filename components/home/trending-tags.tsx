import Link from "next/link";
import { getTrendingTags } from "@/services/servers";
import { SectionHeading } from "./section-heading";

export async function TrendingTagsSection() {
  const tags = await getTrendingTags(12);
  if (!tags.length) return null;

  return (
    <section className="container-x py-12">
      <SectionHeading
        eyebrow="Категорії"
        title="У тренді зараз"
        description="Найпопулярніші теми серед серверів"
        href="/tags"
        hrefLabel="Всі категорії"
      />
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/servers?tags=${tag.slug}`}
            className="group flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.5)]"
            style={{ borderColor: `${tag.color}30` }}
          >
            <span className="text-lg">{tag.icon}</span>
            <span className="text-sm font-medium" style={{ color: tag.color }}>
              {tag.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {tag._count.servers}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
