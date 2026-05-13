import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import { Crown, Star, Users, Zap } from "lucide-react";
import type { ServerCardData } from "@/services/servers";
import { CopyIpButton } from "./copy-ip-button";

interface ServerCardProps {
  server: ServerCardData;
  rank?: number;
  variant?: "default" | "featured" | "compact";
}

export function ServerCard({ server, rank, variant = "default" }: ServerCardProps) {
  const isFeatured = variant === "featured" || server.isFeatured;
  const isCompact = variant === "compact";

  return (
    <Link
      href={`/servers/${server.slug}`}
      className={cn(
        /* min-w-0: grid/flex children can otherwise refuse to shrink and break truncate */
        "showcase-card group block min-w-0",
        isFeatured && "ring-1 ring-amber-400/20",
      )}
    >
      {/* Banner */}
      <div className="relative aspect-[16/7] overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/10 via-cyan-500/5 to-purple-500/10">
        {server.banner ? (
          <Image
            src={server.banner}
            alt={server.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid-bg opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {rank && (
            <Badge variant="accent" className="font-display text-sm">
              <Crown className="h-3 w-3" />#{rank}
            </Badge>
          )}
          {isFeatured && !rank && (
            <Badge variant="accent" className="text-xs">
              <Zap className="h-3 w-3" /> Featured
            </Badge>
          )}
        </div>

        {/* Status */}
        <div className="absolute right-3 top-3">
          <Badge variant={server.isOnline ? "success" : "destructive"} className="text-xs">
            <span className={server.isOnline ? "status-online" : "status-offline"} />
            {server.isOnline ? "Онлайн" : "Офлайн"}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="-mt-8 px-5 pb-5">
        <div className="flex min-w-0 items-end gap-3">
          <div className="relative z-[1] h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
            {server.logo || server.favicon ? (
              <Image
                src={server.logo ?? server.favicon!}
                alt={server.name}
                fill
                className="object-cover"
                unoptimized={!server.logo && !!server.favicon}
              />
            ) : (
              <div className="grid h-full place-items-center bg-primary/10 font-display text-xl font-bold text-primary">
                {server.name[0]}
              </div>
            )}
          </div>
          <div className="relative z-[1] min-w-0 flex-1 pb-1">
            <h3 className="truncate font-sans text-lg font-bold leading-snug text-foreground">
              {server.name}
            </h3>
            <p className="truncate font-mono text-xs text-muted-foreground">{server.host}</p>
          </div>
        </div>

        {!isCompact && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {server.shortDesc ?? server.description}
          </p>
        )}

        {/* Tags */}
        {server.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {server.tags.slice(0, 4).map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-[10px]"
                style={{ borderColor: `${tag.color}40`, color: tag.color }}
              >
                {tag.icon} {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/40 pt-4 text-center">
          <Stat
            icon={<Users className="h-3.5 w-3.5" />}
            value={`${server.onlinePlayers}/${server.maxPlayers}`}
            label="Гравці"
            highlight={server.isOnline && server.onlinePlayers > 0}
          />
          <Stat
            icon={<Star className="h-3.5 w-3.5" />}
            value={formatNumber(server.voteCount)}
            label="Голоси"
          />
          <Stat
            icon={<Zap className="h-3.5 w-3.5" />}
            value={server.version ?? "—"}
            label="Версія"
          />
        </div>

        {/* CTA */}
        <div className="mt-4 flex gap-2">
          <CopyIpButton host={server.host} port={server.port} variant="compact" />
        </div>
      </div>
    </Link>
  );
}

function Stat({
  icon,
  value,
  label,
  highlight,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className={cn("flex items-center justify-center gap-1 text-sm font-semibold", highlight && "text-emerald-400")}>
        {icon}
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
