import * as React from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Fuel,
  Warehouse,
  ArrowLeftRight,
  FileBarChart,
  Users,
  Settings,
  LogOut,
  Search,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { BuritiLogo } from "./Logo";
import { NotificationsBell } from "./NotificationsBell";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/pista", label: "Pista", icon: Fuel },
  { to: "/estoque", label: "Estoque", icon: Warehouse },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/funcionarios", label: "Funcionários", icon: Users },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AdminShell() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const current = items.find((i) => path.startsWith(i.to));

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  const NavList = ({ compact = false }: { compact?: boolean }) => (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {items.map((item) => {
        const active = path.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full"
                style={{ background: "var(--gradient-accent)" }}
              />
            )}
            <Icon size={18} className={cn("shrink-0", active && "text-accent")} />
            {!compact && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "relative hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out md:flex",
          collapsed ? "w-[76px]" : "w-[260px]",
        )}
      >
        <div className="flex h-[72px] items-center px-4">
          {collapsed ? (
            <div
              className="grid h-10 w-10 place-items-center rounded-xl shadow-glow-accent"
              style={{ background: "var(--gradient-accent)" }}
            >
              <Fuel size={20} className="text-[oklch(0.18_0.04_255)]" strokeWidth={2.5} />
            </div>
          ) : (
            <BuritiLogo size="md" />
          )}
        </div>

        <NavList compact={collapsed} />

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <ChevronLeft
              size={18}
              className={cn("transition-transform", collapsed && "rotate-180")}
            />
            {!collapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[260px] flex-col border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-[72px] items-center px-4">
            <BuritiLogo size="md" />
          </div>
          <NavList />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between gap-2 border-b border-border/50 bg-background/60 px-3 backdrop-blur-xl sm:h-[72px] sm:gap-4 sm:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl border border-border/60 bg-card/50 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </Button>
            <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Posto Buriti
            </div>
            <div className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {current?.label ?? "Painel"}
            </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden lg:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Buscar produto, código..."
                className="h-10 w-[240px] border-border/60 bg-card/50 pl-9 backdrop-blur xl:w-[280px]"
              />
            </div>
            <NotificationsBell />
            <div className="hidden items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-3 py-1.5 lg:flex">
              <div
                className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {user?.email?.[0].toUpperCase() ?? "A"}
              </div>
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground">Administrador</div>
                <div className="max-w-[160px] truncate text-sm font-medium">
                  {user?.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl border border-border/60 bg-card/50"
              onClick={async () => {
                await signOut();
                navigate({ to: "/admin" });
              }}
              title="Sair"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-6">
          <div className="animate-float-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}