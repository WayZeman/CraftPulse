import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/layout/logo";
import { Card, CardContent } from "@/components/ui/card";
import { LoginButtons } from "./login-buttons";
import { safeReturnUrl } from "@/lib/security/redirect";

export const metadata = {
  title: "Увійти",
  description: "Увійди в CraftPulse за допомогою Discord чи Google.",
};

interface Props {
  searchParams: Promise<{ from?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;
  const safeFrom = safeReturnUrl(params.from, "/dashboard");
  if (session?.user) redirect(safeFrom);

  return (
    <div className="container-x relative grid min-h-[80vh] place-items-center py-10">
      <div className="aurora-bg absolute inset-0 -z-10" />
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="mt-6 font-display text-2xl font-bold">З поверненням!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Увійди, щоб голосувати, керувати серверами та залишати відгуки.
            </p>
          </div>

          {params.error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Не вдалось увійти. Спробуй ще раз.
            </div>
          )}

          <LoginButtons callbackUrl={safeFrom} />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Натискаючи кнопку, ти погоджуєшся з{" "}
            <Link href="/terms" className="underline hover:text-foreground">умовами</Link> та{" "}
            <Link href="/privacy" className="underline hover:text-foreground">політикою конфіденційності</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
