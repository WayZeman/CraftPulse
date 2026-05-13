"use client";

import { motion } from "framer-motion";
import { Activity, BarChart3, Bell, Lock, Sparkles, Trophy, Users, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Activity,
    title: "Реальний моніторинг",
    description: "Пінг кожну хвилину, чесний онлайн та uptime в реальному часі.",
    color: "text-emerald-400",
  },
  {
    icon: BarChart3,
    title: "Детальна аналітика",
    description: "Графіки гравців, версій, географії та тренди за період.",
    color: "text-cyan-400",
  },
  {
    icon: Trophy,
    title: "Чесний рейтинг",
    description: "Антифрод системи проти накруток. Тільки реальні голоси.",
    color: "text-amber-400",
  },
  {
    icon: Users,
    title: "Жива спільнота",
    description: "Відгуки, обговорення та Discord-інтеграція для гравців.",
    color: "text-violet-400",
  },
  {
    icon: Zap,
    title: "Рекомендації на головній",
    description: "Модератори можуть виділити якісні сервери в блоці Featured.",
    color: "text-yellow-400",
  },
  {
    icon: Bell,
    title: "Сповіщення",
    description: "Webhook у Discord, email-алерти про падіння серверів.",
    color: "text-rose-400",
  },
  {
    icon: Lock,
    title: "Безпека",
    description: "Rate-limit, антибот, sandbox-валідація для всіх форм.",
    color: "text-blue-400",
  },
  {
    icon: Sparkles,
    title: "Українська ДНК",
    description: "Платформа для українських спільнот, з підтримкою укр. мови.",
    color: "text-yellow-400",
  },
];

export function FeaturesSection() {
  return (
    <section className="container-x py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Чому CraftPulse
        </p>
        <h2 className="heading-2 font-display">Все, що потрібно для росту сервера</h2>
        <p className="mt-3 text-muted-foreground">
          Повний набір інструментів для власників та гравців. Чесно, швидко, з турботою.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="showcase-card p-6"
          >
            <div
              className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-background/60 to-background/20 ${f.color} ring-1 ring-border/60`}
            >
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
