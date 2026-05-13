import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { BarChart3, Home, Plus, Server, Settings, Star, Bell } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Огляд", icon: Home, exact: true },
  { href: "/dashboard/servers", label: "Мої сервери", icon: Server },
  { href: "/dashboard/analytics", label: "Аналітика", icon: BarChart3 },
  { href: "/dashboard/votes", label: "Голоси", icon: Star },
  { href: "/dashboard/notifications", label: "Сповіщення", icon: Bell },
  { href: "/dashboard/settings", label: "Налаштування", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="container-x py-10">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside>
          <div className="sticky top-24 space-y-1 rounded-2xl border border-border/60 bg-card/40 p-3">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Кабінет
              </p>
              <Link href="/servers/add" className="text-primary hover:text-primary/80">
                <Plus className="h-4 w-4" />
              </Link>
            </div>
            <nav className="space-y-0.5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
