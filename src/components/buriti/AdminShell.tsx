import * as React from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
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
  Bell,
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
    <nav className="flex-1 space-y-1 px-4 py-4">
      {items.map((item, idx) => {
        const active = path.startsWith(item.to);
        const Icon = item.icon;
        return (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Link
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all min-h-[48px]",
                active
                  ? "bg-primary/10 text-primary shadow-[inset_0_1px_1px_oklch(1_0_0/0.1)]"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/5 shadow-[0_0_20px_oklch(var(--primary)/0.05)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                size={20} 
                className={cn(
                  "relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-110", 
                  active && "text-primary"
                )} 
              />
              {!compact && (
                <span className="relative z-10 truncate tracking-tight">{item.label}</span>
              )}
              {active && !compact && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary-glow)]"
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 280 }}
        className={cn(
          "relative hidden flex-col border-r border-sidebar-border bg-sidebar/50 backdrop-blur-xl md:flex",
        )}
      >
        <div className="flex h-20 items-center px-6">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow"
              >
                <Fuel size={20} strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <BuritiLogo size="md" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <NavList compact={collapsed} />

        <div className="mt-auto p-4">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sidebar-foreground/50 transition-all hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <ChevronLeft
              size={18}
              className={cn("transition-transform duration-500", collapsed && "rotate-180")}
            />
            {!collapsed && <span>Recolher Menu</span>}
          </button>
        </div>
      </motion.aside>

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