import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, Send } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

export const metadata = {
  title: "Контакти",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="heading-2 font-display">Зв'язок з нами</h1>
        <p className="mt-3 text-muted-foreground">
          Маєш питання, ідею чи знайшов баг? Напиши нам зручним способом.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, label: "Email", value: "hello@craftpulse.ua", href: "mailto:hello@craftpulse.ua" },
          { icon: MessageCircle, label: "Discord", value: "discord.gg/craftpulse", href: "https://discord.gg/craftpulse" },
          { icon: Send, label: "Telegram", value: "@craftpulse", href: "https://t.me/craftpulse" },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="font-display font-semibold">{c.label}</p>
              <a href={c.href} className="text-sm text-muted-foreground hover:text-primary">
                {c.value}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
