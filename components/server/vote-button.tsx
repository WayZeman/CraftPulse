"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { voteForServer } from "@/actions/vote";
import { toast } from "sonner";

interface Props {
  serverId: string;
  initialCount: number;
  isAuthenticated: boolean;
}

export function VoteButton({ serverId, initialCount, isAuthenticated }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleVote() {
    if (!isAuthenticated) {
      router.push(`/login?from=${window.location.pathname}`);
      return;
    }
    startTransition(async () => {
      const res = await voteForServer(serverId);
      if (res.success) {
        setCount((c) => c + 1);
        setVoted(true);
        toast.success("Дякуємо за голос!", {
          description: "Зможеш проголосувати знову через 24 години.",
        });
      } else {
        toast.error("Не вдалось проголосувати", { description: res.error });
      }
    });
  }

  return (
    <Button
      onClick={handleVote}
      variant="accent"
      size="xl"
      disabled={isPending || voted}
      className="w-full"
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={voted ? "fill-current" : ""} />
      )}
      <span>
        {voted ? "Дякуємо!" : "Проголосувати"}
        <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">
          {count.toLocaleString("uk-UA")}
        </span>
      </span>
    </Button>
  );
}
