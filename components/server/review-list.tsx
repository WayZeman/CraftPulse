import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";

export async function ReviewList({ serverId }: { serverId: string }) {
  const reviews = await db.review.findMany({
    where: { serverId, isHidden: false },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
    },
  });

  if (!reviews.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Поки що немає відгуків"
        description="Будь першим, хто залишить свої враження про сервер."
      />
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-border"
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              {r.user.image && <AvatarImage src={r.user.image} alt="" />}
              <AvatarFallback>{getInitials(r.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-medium">{r.user.name ?? r.user.username ?? "Анонім"}</p>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(r.createdAt)}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                      )}
                    />
                  ))}
                </div>
              </div>
              {r.title && <p className="mt-1 font-semibold">{r.title}</p>}
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{r.content}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
