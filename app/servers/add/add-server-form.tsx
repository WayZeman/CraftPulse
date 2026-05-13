"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createServer } from "@/actions/server";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Tag {
  id: string;
  slug: string;
  name: string;
  color: string;
  icon: string | null;
}

export function AddServerForm({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    shortDesc: "",
    description: "",
    host: "",
    port: 25565,
    edition: "JAVA" as const,
    website: "",
    discord: "",
    logo: "",
    banner: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTag(slug: string) {
    setSelectedTags((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug].slice(0, 8)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createServer({
        ...form,
        slug: form.slug || slugify(form.name),
        tags: selectedTags,
      });
      if (res.success && res.slug) {
        toast.success(
          res.status === "APPROVED"
            ? "Сервер додано та опубліковано!"
            : "Сервер надіслано на модерацію",
        );
        router.push(`/servers/${res.slug}`);
      } else {
        toast.error("Не вдалось додати", { description: res.error });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Назва сервера *</Label>
          <Input id="name" required minLength={3} maxLength={64} value={form.name} onChange={(e) => setField("name", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL slug *</Label>
          <Input
            id="slug"
            required
            value={form.slug}
            onChange={(e) => setField("slug", slugify(e.target.value))}
            placeholder={slugify(form.name) || "my-server"}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_120px_140px]">
        <div className="space-y-2">
          <Label htmlFor="host">Хост / IP *</Label>
          <Input id="host" required value={form.host} placeholder="play.example.com" onChange={(e) => setField("host", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Порт</Label>
          <Input id="port" type="number" min={1} max={65535} value={form.port} onChange={(e) => setField("port", Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Edition</Label>
          <Select value={form.edition} onValueChange={(v) => setField("edition", v as typeof form.edition)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="JAVA">Java</SelectItem>
              <SelectItem value="BEDROCK">Bedrock</SelectItem>
              <SelectItem value="CROSS_PLATFORM">Cross-platform</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDesc">Короткий опис *</Label>
        <Input id="shortDesc" required minLength={10} maxLength={280} value={form.shortDesc} onChange={(e) => setField("shortDesc", e.target.value)} placeholder="Один речення про твій сервер" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Повний опис *</Label>
        <Textarea id="description" required minLength={20} maxLength={5000} value={form.description} onChange={(e) => setField("description", e.target.value)} className="min-h-[160px]" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website">Сайт (опц.)</Label>
          <Input id="website" type="url" value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discord">Discord (опц.)</Label>
          <Input id="discord" type="url" value={form.discord} onChange={(e) => setField("discord", e.target.value)} placeholder="https://discord.gg/..." />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logo">URL лого (опц.)</Label>
          <Input id="logo" type="url" value={form.logo} onChange={(e) => setField("logo", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="banner">URL банера (опц.)</Label>
          <Input id="banner" type="url" value={form.banner} onChange={(e) => setField("banner", e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Категорії * (1-8)</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 transition-colors hover:border-primary/40"
              style={{
                borderColor: selectedTags.includes(t.slug) ? t.color : undefined,
                color: selectedTags.includes(t.slug) ? t.color : undefined,
              }}
            >
              <Checkbox
                checked={selectedTags.includes(t.slug)}
                onCheckedChange={() => toggleTag(t.slug)}
              />
              <span className="text-sm">{t.icon} {t.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isPending || selectedTags.length === 0} className="w-full">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Додати сервер
      </Button>
    </form>
  );
}
