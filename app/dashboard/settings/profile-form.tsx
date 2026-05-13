"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/actions/profile";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  youtube: string | null;
}

export function ProfileForm({ user }: { user: User }) {
  const [form, setForm] = useState({
    username: user.username ?? "",
    name: user.name ?? "",
    bio: user.bio ?? "",
    website: user.website ?? "",
    twitter: user.twitter ?? "",
    youtube: user.youtube ?? "",
  });
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfile(form);
      if (res.success) toast.success("Профіль збережено");
      else toast.error("Помилка", { description: res.error });
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={form.username} onChange={(e) => setField("username", e.target.value)} required minLength={3} maxLength={24} />
          <p className="text-xs text-muted-foreground">Лише латиниця, цифри та _</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Відображуване ім'я</Label>
          <Input id="name" value={form.name} onChange={(e) => setField("name", e.target.value)} maxLength={64} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Про себе</Label>
        <Textarea id="bio" value={form.bio} onChange={(e) => setField("bio", e.target.value)} maxLength={500} />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="website">Сайт</Label>
          <Input id="website" type="url" placeholder="https://" value={form.website} onChange={(e) => setField("website", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input id="twitter" placeholder="@user" value={form.twitter} onChange={(e) => setField("twitter", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <Input id="youtube" placeholder="@channel" value={form.youtube} onChange={(e) => setField("youtube", e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />} Зберегти
      </Button>
    </form>
  );
}
