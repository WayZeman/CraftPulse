import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center gap-2 sm:gap-4">
        <MobileNav />
        <Logo className="min-w-0 shrink" />
        <NavLinks className="hidden md:ml-4 md:flex" />
        <div className="ml-auto flex items-center gap-2">
          {session?.user ? (
            <>
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                <Link href="/servers/add">
                  <Plus className="h-4 w-4" />
                  Додати сервер
                </Link>
              </Button>
              <UserMenu user={session.user} />
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Увійти</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login?from=/servers/add">Додати сервер</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
