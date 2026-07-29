import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Leaf, LayoutDashboard, ScanLine, LogOut, TrendingUp, Store, Landmark,
  CalendarDays, IndianRupee, Bot, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-picker";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";


export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { to: "/scan", icon: ScanLine, key: "nav.scan" },
  { to: "/yield", icon: TrendingUp, key: "nav.yield" },
  { to: "/marketplace", icon: Store, key: "nav.marketplace" },
  { to: "/prices", icon: IndianRupee, key: "nav.prices" },
  { to: "/schemes", icon: Landmark, key: "nav.schemes" },
  { to: "/calendar", icon: CalendarDays, key: "nav.calendar" },
  { to: "/chat", icon: Bot, key: "nav.chat" },
] as const;

function AuthedShell() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40" style={{
        backgroundImage:
          "radial-gradient(circle at 10% 0%, var(--color-primary-glow) 0, transparent 40%), radial-gradient(circle at 90% 100%, var(--color-sky) 0, transparent 40%)",
      }} />
      <header className="sticky top-0 z-40 border-b border-border/50 backdrop-blur-xl bg-background/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/dashboard" className="flex shrink-0 items-center gap-2 font-bold">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-leaf text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">CropGuard <span className="text-gradient-hero">AI</span></span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <Button key={n.to} asChild variant="ghost" size="sm" className="rounded-2xl gap-1.5 px-2.5">
                <Link to={n.to} activeProps={{ className: "bg-accent" }}>
                  <n.icon className="h-4 w-4" />
                  <span className="text-xs">{t(n.key)}</span>
                </Link>
              </Button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitcher />
            <Button onClick={signOut} variant="outline" size="sm" className="hidden rounded-2xl gap-2 sm:inline-flex">
              <LogOut className="h-4 w-4" /> <span className="hidden md:inline">{t("nav.signOut")}</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-2xl lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {open && (
          <div className="grid gap-1 border-t border-border/50 p-3 lg:hidden">
            {NAV.map((n) => (
              <Button key={n.to} asChild variant="ghost" className="justify-start rounded-2xl gap-2" onClick={() => setOpen(false)}>
                <Link to={n.to} activeProps={{ className: "bg-accent" }}>
                  <n.icon className="h-4 w-4" /> {t(n.key)}
                </Link>
              </Button>
            ))}
            <Button onClick={signOut} variant="outline" className="mt-1 justify-start rounded-2xl gap-2">
              <LogOut className="h-4 w-4" /> {t("nav.signOut")}
            </Button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );

}
