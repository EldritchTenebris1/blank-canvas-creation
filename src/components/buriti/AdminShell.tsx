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
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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
          "relative hidden flex-col border-r border-sidebar-border bg-sidebar/40 backdrop-blur-3xl md:flex",
        )}
      >
        <div className="flex h-24 items-center px-6">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow"
              >
                <Fuel size={24} strokeWidth={2.5} />
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

        <div className="mt-auto p-6">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-xs font-black uppercase tracking-widest text-sidebar-foreground/40 transition-all hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border border-transparent hover:border-white/5"
          >
            <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <ChevronLeft
                size={16}
                strokeWidth={3}
                className={cn("transition-transform duration-500", collapsed && "rotate-180")}
              />
            </div>
            {!collapsed && <span>Recolher Menu</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[280px] flex-col border-sidebar-border bg-sidebar/95 backdrop-blur-2xl p-0">
          <SheetTitle className="sr-only">Navegação Principal</SheetTitle>
          <div className="flex h-24 items-center px-6">
            <BuritiLogo size="md" name={stationName} />
          </div>
          <NavList />
        </SheetContent>
      </Sheet>

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col relative">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-[88px] items-center justify-between gap-4 border-b border-white/5 bg-background/60 px-4 backdrop-blur-2xl sm:px-10">
          <div className="flex items-center gap-6 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-white/5 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </Button>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_oklch(var(--accent))]" />
                {stationName} ERP • v2.0
              </div>
              <div className="text-gradient truncate text-2xl font-black tracking-tighter sm:text-3xl italic uppercase">
                {current?.label ?? "Painel"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden xl:block group">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 transition-all group-focus-within:text-primary group-focus-within:scale-110"
              />
              <Input
                ref={searchInputRef}
                placeholder="Busca global avançada..."
                className="h-12 w-[300px] rounded-2xl border-white/5 bg-white/5 pl-12 shadow-inner backdrop-blur-md transition-all focus:w-[420px] focus:bg-white/8 focus:ring-primary/20 border-white/10"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden select-none items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 py-1 font-mono text-[9px] font-black text-muted-foreground/40 xl:flex">
                <span className="opacity-50 text-[11px]">CTRL</span> K
              </div>
            </div>
            
            <NotificationsMenu />
            
            <div className="hidden h-10 w-px bg-white/5 lg:block" />
            
            <div className="hidden items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-all lg:flex group cursor-pointer shadow-inner">
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-sm font-black text-primary-foreground shadow-glow group-hover:scale-110 transition-transform">
                  {user?.email?.[0].toUpperCase() ?? "A"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-success shadow-[0_0_8px_oklch(var(--success))]" />
              </div>
              <div className="hidden xl:block">
                <div className="text-[11px] font-black text-foreground tracking-widest uppercase">Sistema Admin</div>
                <div className="max-w-[140px] truncate text-[11px] font-bold text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                  {user?.email}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-2xl border border-white/5 bg-white/5 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all group shadow-inner"
              onClick={async () => {
                await signOut();
                navigate({ to: "/admin" });
              }}
            >
              <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-6 sm:p-10">
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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