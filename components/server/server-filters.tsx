"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MC_VERSIONS, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  slug: string;
  name: string;
  color: string;
  icon?: string | null;
}

interface Props {
  tags: Tag[];
  className?: string;
}

export function ServerFilters({ tags, className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedTags = (searchParams.get("tags") ?? "").split(",").filter(Boolean);
  const sort = searchParams.get("sort") ?? "votes";
  const version = searchParams.get("version") ?? "";
  const edition = searchParams.get("edition") ?? "";
  const q = searchParams.get("q") ?? "";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => router.replace(`?${params.toString()}`, { scroll: false }));
  }

  function toggleTag(slug: string) {
    const next = selectedTags.includes(slug)
      ? selectedTags.filter((s) => s !== slug)
      : [...selectedTags, slug];
    updateParam("tags", next.join(",") || null);
  }

  function clearAll() {
    startTransition(() => router.replace("?", { scroll: false }));
  }

  const hasFilters = selectedTags.length > 0 || version || edition || q;

  return (
    <aside className={cn("space-y-6", className)}>
      {/* Search */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Пошук
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Назва, IP, опис..."
            defaultValue={q}
            onChange={(e) => updateParam("q", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Сортування
        </label>
        <Select value={sort} onValueChange={(v) => updateParam("sort", v === "votes" ? null : v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Edition */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Edition
        </label>
        <Select value={edition || "_all"} onValueChange={(v) => updateParam("edition", v === "_all" ? null : v)}>
          <SelectTrigger><SelectValue placeholder="Будь-який" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Будь-який</SelectItem>
            <SelectItem value="JAVA">Java Edition</SelectItem>
            <SelectItem value="BEDROCK">Bedrock</SelectItem>
            <SelectItem value="CROSS_PLATFORM">Cross-platform</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Version */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Версія
        </label>
        <Select value={version || "_all"} onValueChange={(v) => updateParam("version", v === "_all" ? null : v)}>
          <SelectTrigger><SelectValue placeholder="Будь-яка" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Будь-яка</SelectItem>
            {MC_VERSIONS.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Категорії
        </label>
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border/60 bg-background/40 p-3">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-accent/50"
            >
              <Checkbox
                checked={selectedTags.includes(tag.slug)}
                onCheckedChange={() => toggleTag(tag.slug)}
              />
              <span className="text-sm">
                {tag.icon} {tag.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button onClick={clearAll} variant="outline" size="sm" className="w-full" disabled={isPending}>
          <X className="h-3.5 w-3.5" /> Скинути фільтри
        </Button>
      )}
    </aside>
  );
}
