"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

export function CtaSection() {
  return (
    <section className="container-x py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/80 via-card/50 to-card/80 p-10 text-center md:p-16"
      >
        <div className="aurora-bg absolute inset-0" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative">
          <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.8)]">
            <Rocket className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="heading-2 mx-auto max-w-2xl font-display">
            Готовий зайняти топ позицію?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Додай свій сервер за 2 хвилини. Безкоштовно. Без обмежень. З реальним моніторингом і
            підтримкою спільноти.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="accent">
              <Link href="/servers/add">
                Додати сервер
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/leaderboard">Рейтинг серверів</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
