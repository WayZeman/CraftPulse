import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { FeaturedGrid } from "@/components/home/featured-grid";
import { TopServersSection, NewestServersSection } from "@/components/home/top-servers";
import { TrendingTagsSection } from "@/components/home/trending-tags";
import { FeaturesSection } from "@/components/home/features-section";
import { CtaSection } from "@/components/home/cta-section";
import { getPlatformStats } from "@/services/servers";
import { Skeleton } from "@/components/ui/skeleton";
import { absoluteUrl } from "@/lib/utils";
import { safeJsonLd } from "@/lib/security/json-ld";

export const revalidate = 60;

export const metadata = {
  title: "Топ Minecraft сервери України · Реальний моніторинг",
  description:
    "Знаходь найкращі українські Minecraft сервери. Чесний рейтинг, реальний онлайн, відгуки спільноти. Додай свій сервер безкоштовно.",
  alternates: { canonical: absoluteUrl("/") },
};

export default async function HomePage() {
  const stats = await getPlatformStats();

  return (
    <>
      <Hero stats={stats} />

      <Suspense fallback={<GridSkeleton />}>
        <FeaturedGrid />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <TopServersSection />
      </Suspense>

      <FeaturesSection />

      <Suspense fallback={null}>
        <TrendingTagsSection />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <NewestServersSection />
      </Suspense>

      <CtaSection />

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "CraftPulse",
            url: absoluteUrl("/"),
            description:
              "Платформа моніторингу українських Minecraft серверів",
            potentialAction: {
              "@type": "SearchAction",
              target: `${absoluteUrl("/servers")}?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}

function GridSkeleton() {
  return (
    <section className="container-x py-12">
      <Skeleton className="mb-10 h-10 w-80" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </section>
  );
}
