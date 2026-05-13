import Link from "next/link";
import { Logo } from "./logo";
import { FOOTER_LINKS } from "@/lib/constants";
import { Github, Twitter, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/40 bg-background/50">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size="md" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Платформа моніторингу українських Minecraft серверів. Знаходь найкращі
              сервери, голосуй і ділись враженнями.
            </p>
            <div className="mt-6 flex gap-2">
              <Link
                href="https://github.com"
                aria-label="GitHub"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="https://twitter.com"
                aria-label="Twitter"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="https://t.me/craftpulse"
                aria-label="Telegram"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <Send className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <FooterColumn title="Продукт" links={FOOTER_LINKS.product} />
          <FooterColumn title="Ресурси" links={FOOTER_LINKS.resources} />
          <FooterColumn title="Інформація" links={FOOTER_LINKS.legal} />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CraftPulse · Зроблено з{" "}
            <span className="text-red-400">♥</span> в Україні 🇺🇦
          </p>
          <p className="text-xs text-muted-foreground">
            Minecraft is a trademark of Mojang Studios. CraftPulse is not affiliated with Mojang.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-foreground/80 transition hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
