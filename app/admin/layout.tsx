import Link from "next/link";
import { requireModerator } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { BarChart3, Flag, Server, ShieldAlert, Tags, Users, Zap } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Огляд", icon: BarChart3 },
  { href: "/admin/queue", label: "Модерація", icon: ShieldAlert },
  { href: "/admin/servers", label: "Сервери", icon: Server },
  { href: "/admin/users", label: "Користувачі", icon: Users },
  { href: "/admin/reports", label: "Скарги", icon: Flag },
  { href: "/admin/tags", label: "Теги", icon: Tags },
  { href: "/admin/featured", label: "Featured", icon: Zap },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireModerator();
  const [pending, openReports] = await Promise.all([
    db.server.count({ where: { status: "PENDING" } }),
    db.report.count({ where: { status: { in: ["PENDING", "REVIEWING"] } } }),
  ]);

  return (
    <div className="container-x py-10">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside>
          <div className="sticky top-24 space-y-1 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              Admin panel
            </p>
            <nav className="space-y-0.5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.href === "/admin/queue" && pending > 0 && (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      {pending}
                    </span>
                  )}
                  {item.href === "/admin/reports" && openReports > 0 && (
                    <span className="rounded-full bg-red-400/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                      {openReports}
                    </span>
                  )}
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
