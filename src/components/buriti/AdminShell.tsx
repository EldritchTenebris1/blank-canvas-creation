import * as React from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  CheckCheck,
} from "lucide-react";
import { BuritiLogo } from "./Logo";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const { data: stationName } = useQuery({
    queryKey: ["app-setting", "station_name"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "station_name").maybeSingle();
      return data?.value || "Posto Buriti";
    }
  });

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
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)]"
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
                <BuritiLogo size="md" name={stationName} />
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
            <BuritiLogo size="md" name={stationName} />
          </div>
          <NavList />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-white/5 bg-background/40 px-4 backdrop-blur-2xl sm:px-8">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-2xl border border-white/10 bg-white/5 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                <div className="h-1 w-1 rounded-full bg-accent animate-pulse" />
                {stationName} ERP
              </div>
              <div className="text-gradient truncate text-xl font-bold tracking-tight sm:text-2xl">
                {current?.label ?? "Painel"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationsMenu />
            
            <div className="relative hidden xl:block group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary"
              />
              <Input
                placeholder="Pesquisa inteligente..."
                className="h-12 w-[320px] rounded-2xl border-white/5 bg-white/5 pl-11 shadow-inner backdrop-blur-md transition-all focus:w-[400px] focus:bg-white/10 focus:ring-primary/20"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/40 sm:flex">
                ⌘K
              </kbd>
            </div>
            
            
            
            <div className="hidden items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-2 hover:bg-white/10 transition-colors lg:flex">
              <div className="relative">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-glow">
                  {user?.email?.[0].toUpperCase() ?? "A"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-bold text-foreground tracking-tight">Administrador</div>
                <div className="max-w-[120px] truncate text-[11px] text-muted-foreground">
                  {user?.email}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-2xl border border-white/5 bg-white/5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={async () => {
                await signOut();
                navigate({ to: "/admin" });
              }}
            >
              <LogOut size={20} />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function NotificationsMenu() {
  const [notifications, setNotifications] = React.useState([
    { id: "1", title: "Estoque Baixo", message: "Gasolina Comum abaixo do mínimo na pista.", time: "5 min atrás", type: "warning" },
    { id: "2", title: "Nova Venda", message: "Venda de R$ 250,00 realizada por João.", time: "12 min atrás", type: "info" },
    { id: "3", title: "Alerta de Sistema", message: "Backup diário concluído com sucesso.", time: "1h atrás", type: "success" },
  ]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 shrink-0 rounded-2xl border border-white/5 bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
        >
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden" align="end">
        <div className="flex items-center justify-between border-b border-white/5 p-4 bg-white/5">
          <h3 className="text-sm font-bold tracking-tight">Notificações</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearNotifications}
              className="h-8 gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-accent hover:bg-accent/10"
            >
              <CheckCheck size={12} />
              Limpar Tudo
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => (
                <div key={n.id} className="group p-4 transition-colors hover:bg-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-bold leading-none">{n.title}</p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground/80 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40 font-medium">{n.time}</p>
                    </div>
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                      n.type === 'warning' ? "bg-amber-500" : n.type === 'success' ? "bg-emerald-500" : "bg-blue-500"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-muted-foreground/20">
                <Bell size={24} />
              </div>
              <p className="text-sm font-bold text-muted-foreground/60">Tudo limpo por aqui!</p>
              <p className="text-[11px] text-muted-foreground/40 mt-1">Você não tem novas notificações no momento.</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}