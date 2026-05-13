"use client";

import { useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createReview } from "@/actions/review";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  serverId: string;
  isAuthenticated: boolean;
}

export function ReviewForm({ serverId, isAuthenticated }: Props) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Увійди, щоб залишити відгук про сервер
          </p>
          <Button asChild variant="outline">
            <a href="/login">Увійти</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createReview({ serverId, rating, title: title || undefined, content });
      if (res.success) {
        toast.success("Відгук опубліковано", { description: "Дякуємо за думку!" });
        setTitle("");
        setContent("");
      } else {
        toast.error("Не вдалось опублікувати", { description: res.error });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Залишити відгук</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Рейтинг</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <Input
            placeholder="Заголовок (опціонально)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          <Textarea
            placeholder="Що сподобалось чи не сподобалось? Поділись враженнями."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            minLength={10}
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{content.length}/2000</p>
            <Button type="submit" disabled={isPending || content.length < 10}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Опублікувати
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
