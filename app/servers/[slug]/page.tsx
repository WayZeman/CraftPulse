import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getServerBySlug, getServerCharts } from "@/services/servers";
import { getUptimePercent } from "@/services/monitoring";
import { pingServer } from "@/services/minecraft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyIpButton } from "@/components/server/copy-ip-button";
import { VoteButton } from "@/components/server/vote-button";
import { MotdDisplay } from "@/components/server/motd-display";
import { ServerChart } from "@/components/server/server-chart";
import { ReviewForm } from "@/components/server/review-form";
import { ReviewList } from "@/components/server/review-list";
import { LiveStatusBadge, LivePlayersValue } from "@/components/server/live-status";
import { absoluteUrl, formatNumber, formatUptime } from "@/lib/utils";
import { safeJsonLd } from "@/lib/security/json-ld";
import { ExternalLink, Globe, MessageCircle, ShieldCheck, Star, TrendingUp, Users, Zap } from "lucide-react";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const server = await getServerBySlug(slug);
  if (!server) return {};
  return {
    title: `${server.name} — Minecraft сервер`,
    description: server.shortDesc ?? server.description.slice(0, 160),
    alternates: { canonical: absoluteUrl(`/servers/${slug}`) },
    openGraph: {
      title: server.name,
      description: server.shortDesc ?? "",
      images: [server.banner ?? absoluteUrl(`/api/og?slug=${slug}`)],
    },
  };
}

export default async function ServerPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const server = await getServerBySlug(slug);
  if (!server || (server.status !== "APPROVED" && server.ownerId !== session?.user?.id)) {
    notFound();
  }

  const [livePing, uptime30d, snapshots] = await Promise.all([
    pingServer(server.host, server.port, { edition: server.edition }),
    getUptimePercent(server.id, 30),
    getServerCharts(server.id, 7),
  ]);

  return (
    <article className="pb-20">
      {/* Hero / Banner */}
      <header className="relative h-72 overflow-hidden md:h-96">
        {server.banner ? (
          <Image src={server.banner} alt={server.name} fill className="object-cover" priority />
        ) : (
          <>
            <div className="aurora-bg absolute inset-0" />
            <div className="absolute inset-0 grid-bg opacity-30" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      </header>

      <div className="container-x relative z-10 -mt-32 md:-mt-40">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-4 md:flex-row md:items-end">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
              {server.logo || server.favicon ? (
                <Image
                  src={server.logo ?? server.favicon!}
                  alt={server.name}
                  fill
                  className="object-cover"
                  unoptimized={!server.logo && !!server.favicon}
                />
              ) : (
                <div className="grid h-full place-items-center bg-primary/10 font-display text-4xl font-bold text-primary">
                  {server.name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <LiveStatusBadge slug={server.slug} initial={livePing} />
                {server.isFeatured && (
                  <Badge variant="accent">
                    <Zap className="h-3 w-3" /> Featured
                  </Badge>
                )}
              </div>
              <h1 className="heading-1 break-words font-display">{server.name}</h1>
              <p className="max-w-2xl text-muted-foreground">{server.shortDesc}</p>
              <div className="flex flex-wrap gap-1.5">
                {server.tags.map(({ tag }) => (
                  <Link key={tag.id} href={`/servers?tags=${tag.slug}`}>
                    <Badge
                      variant="outline"
                      style={{ borderColor: `${tag.color}50`, color: tag.color }}
                    >
                      {tag.icon} {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <CopyIpButton host={server.host} port={server.port} variant="large" />
            <VoteButton
              serverId={server.id}
              initialCount={server.voteCount}
              isAuthenticated={!!session?.user}
            />
            <div className="flex gap-2">
              {server.website && (
                <Button asChild variant="outline" className="flex-1">
                  <Link href={server.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" /> Сайт <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              )}
              {server.discord && (
                <Button asChild variant="outline" className="flex-1">
                  <Link href={server.discord} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> Discord
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard
            icon={<Users />}
            label="Зараз онлайн"
            value={<LivePlayersValue slug={server.slug} initial={livePing} />}
            accent="emerald"
          />
          <StatCard icon={<TrendingUp />} label="Пік" value={formatNumber(server.peakPlayers)} accent="cyan" />
          <StatCard icon={<Star />} label="Голоси" value={formatNumber(server.voteCount)} accent="amber" />
          <StatCard icon={<Zap />} label="Версія" value={livePing.version?.name ?? server.version ?? "—"} accent="violet" />
          <StatCard icon={<ShieldCheck />} label="Uptime 30д" value={formatUptime(uptime30d)} accent="rose" />
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="mt-10">
          <TabsList className="flex h-auto w-full min-w-0 flex-wrap justify-start gap-1 overflow-x-auto p-1 sm:flex-nowrap sm:justify-center">
            <TabsTrigger value="overview" className="shrink-0 px-3 sm:px-4">
              Огляд
            </TabsTrigger>
            <TabsTrigger value="chart" className="shrink-0 px-3 sm:px-4">
              Графіки
            </TabsTrigger>
            <TabsTrigger value="reviews" className="shrink-0 px-3 sm:px-4">
              Відгуки
            </TabsTrigger>
            <TabsTrigger value="about" className="shrink-0 px-3 sm:px-4">
              Про сервер
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MOTD</CardTitle>
              </CardHeader>
              <CardContent>
                <MotdDisplay motd={livePing.motd ?? server.motd} />
              </CardContent>
            </Card>

            {livePing.players.sample?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Гравці зараз</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {livePing.players.sample.map((p) => (
                      <Badge key={p.name} variant="outline">{p.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Гравці за тиждень</CardTitle>
              </CardHeader>
              <CardContent>
                <ServerChart data={snapshots} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <ReviewForm serverId={server.id} isAuthenticated={!!session?.user} />
            <ReviewList serverId={server.id} />
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Опис</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                  {server.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              name: server.name,
              gamePlatform: server.edition,
              applicationCategory: "Game",
              description: server.shortDesc ?? server.description.slice(0, 200),
              aggregateRating: server.averageRating > 0 ? {
                "@type": "AggregateRating",
                ratingValue: server.averageRating.toFixed(1),
                reviewCount: server.reviewCount,
              } : undefined,
            }),
          }}
        />
      </div>
    </article>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: "emerald" | "cyan" | "amber" | "violet" | "rose";
}) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    violet: "text-violet-400 bg-violet-500/10",
    rose: "text-rose-400 bg-rose-500/10",
  } as const;
  const titleAttr = typeof value === "string" || typeof value === "number" ? String(value) : undefined;
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur">
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 ${colors[accent]}`}>
        {icon}
      </div>
      <div className="truncate font-display text-xl font-bold" title={titleAttr}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
