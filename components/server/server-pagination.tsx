"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ServerPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const makeHref = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      <Button asChild size="icon" variant="outline" disabled={page === 1}>
        <Link href={makeHref(Math.max(1, page - 1))} aria-label="Попередня сторінка">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <Button
            key={p}
            asChild
            size="icon"
            variant={p === page ? "default" : "outline"}
          >
            <Link href={makeHref(p)}>{p}</Link>
          </Button>
        ),
      )}
      <Button asChild size="icon" variant="outline" disabled={page === totalPages}>
        <Link href={makeHref(Math.min(totalPages, page + 1))} aria-label="Наступна сторінка">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
