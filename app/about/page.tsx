import { absoluteUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Users, Zap } from "lucide-react";

export const metadata = {
  title: "Про нас",
  description: "Дізнайся більше про CraftPulse — платформу для українських Minecraft серверів.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="heading-1 font-display">Про CraftPulse</h1>
        <p className="lead mt-6">
          CraftPulse — це платформа для моніторингу та просування українських Minecraft
          серверів. Ми створюємо чесний рейтинг, надійний моніторинг та простір для активних гравців.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            { icon: Shield, title: "Чесність", text: "Антифрод-системи проти накруток і фейкових серверів." },
            { icon: Zap, title: "Швидкість", text: "Реальний пінг кожні 60 секунд, миттєва аналітика." },
            { icon: Users, title: "Спільнота", text: "Відгуки, обговорення, Discord — все для гравців." },
            { icon: Heart, title: "Україна", text: "Платформа для українських гравців з повним перекладом." },
          ].map((b) => (
            <Card key={b.title}>
              <CardContent className="p-6">
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="heading-3 mt-16 font-display">Наша місія</h2>
        <p className="mt-4 text-muted-foreground">
          Підтримати українські Minecraft спільноти, допомогти власникам серверів рости, а гравцям
          — знаходити проєкти, що дійсно того варті.
        </p>
      </div>
    </div>
  );
}
