import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <div className="relative text-center">
        <div className="aurora-bg absolute inset-0 -z-10" />
        <p className="font-display text-9xl font-extrabold text-gradient">404</p>
        <h1 className="mt-6 heading-3 font-display">Сторінку не знайдено</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Здається, ти забрів у Nether. Спробуй повернутись на головну або знайти сервер.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/"><Home className="h-4 w-4" /> На головну</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/servers"><Search className="h-4 w-4" /> Шукати сервери</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
