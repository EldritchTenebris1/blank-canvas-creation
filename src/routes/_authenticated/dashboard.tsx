import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Fuel,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Warehouse,
  Loader2,
  ArrowRight,
  Plus,
  BarChart3,
  Calendar,
  History,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useMovements } from "@/hooks/use-movements";
import { Stat } from "@/components/buriti/Stat";
import { Button } from "@/components/ui/button";
import { RecentMovements } from "@/components/buriti/RecentMovements";
import { cn } from "@/lib/utils";

// Lazy load heavy chart components
const DashboardCharts = React.lazy(() => import("@/components/buriti/DashboardCharts"));

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: movements = [], isLoading: loadingMovements } = useMovements(30);

  const { data: stationName } = useQuery({
    queryKey: ["app-setting", "station_name"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "station_name").maybeSingle();
      return data?.value || "Posto Buriti";
    }
  });

  const dashboardData = React.useMemo(() => {
    const totalPista = products.reduce((s, p) => s + p.pista_qty, 0);
    const totalEstoque = products.reduce((s, p) => s + p.estoque_qty, 0);
    
    const lowStockProducts = products.filter(
      (p) => p.pista_qty < p.pista_min || p.estoque_qty < p.estoque_min,
    );
    
    const totalValue = products.reduce(
      (s, p) => s + Number(p.cost_price || 0) * (p.pista_qty + p.estoque_qty),
      0,
    );

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    
    const todaySalesMovements = movements.filter(
      (m) => m.type === "venda" && m.created_at.slice(0, 10) === today,
    );
    
    const yesterdaySalesMovements = movements.filter(
      (m) => m.type === "venda" && m.created_at.slice(0, 10) === yesterday,
    );

    const salesToday = todaySalesMovements.reduce((s, m) => s + m.quantity, 0);
    const salesYesterday = yesterdaySalesMovements.reduce((s, m) => s + m.quantity, 0);
    
    const salesTrendValue = salesYesterday > 0 
      ? Math.round(((salesToday - salesYesterday) / salesYesterday) * 100)
      : 0;

    const profitToday = todaySalesMovements.reduce((sum, m) => {
      const p = products.find((x) => x.id === m.product_id);
      if (!p) return sum;
      return sum + (Number(p.sale_price) - Number(p.cost_price || 0)) * m.quantity;
    }, 0);

    const profitYesterday = yesterdaySalesMovements.reduce((sum, m) => {
      const p = products.find((x) => x.id === m.product_id);
      if (!p) return sum;
      return sum + (Number(p.sale_price) - Number(p.cost_price || 0)) * m.quantity;
    }, 0);

    const profitTrendValue = profitYesterday > 0 
      ? Math.round(((profitToday - profitYesterday) / profitYesterday) * 100)
      : 0;

    // Sales last 7 days for chart
    const daysData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().slice(0, 10);
      const daySales = movements.filter(
        (m) => m.type === "venda" && m.created_at.slice(0, 10) === iso,
      ).length;
      return { 
        day: d.toLocaleDateString("pt-BR", { weekday: "short" }), 
        vendas: daySales 
      };
    });

    // Top products
    const top = Object.entries(
      movements
        .filter((m) => m.type === "venda")
        .reduce<Record<string, number>>((acc, m) => {
          const product = products.find(p => p.id === m.product_id);
          const name = product?.name ?? "—";
          acc[name] = (acc[name] ?? 0) + m.quantity;
          return acc;
        }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    return { 
      totalPista, 
      totalEstoque, 
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 3),
      totalValue, 
      salesToday, 
      salesTrend: { value: salesTrendValue, isUp: salesTrendValue >= 0 },
      profitToday, 
      profitTrend: { value: profitTrendValue, isUp: profitTrendValue >= 0 },
      daysData, 
      top,
      allMovements: movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    };
  }, [products, movements]);

  const isLoading = loadingProducts || loadingMovements;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 animate-pulse">
            Sincronizando Dados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-reveal">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-glow">
              <Zap size={24} fill="currentColor" className="opacity-80" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter sm:text-5xl text-gradient uppercase italic leading-[0.9]">
                Painel de Controle
              </h1>
              <p className="text-[11px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] flex items-center gap-2 mt-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_oklch(var(--success))]" />
                SISTEMA OPERACIONAL ATIVO • {stationName}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button 
            onClick={() => navigate({ to: "/produtos" })}
            variant="outline" 
            className="w-full sm:w-auto rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-[0.2em] gap-2 h-12 px-5 sm:h-14 sm:px-8 shadow-inner transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Gerenciar Inventário
          </Button>
          <Button 
            onClick={() => navigate({ to: "/relatorios" })}
            className="w-full sm:w-auto rounded-2xl bg-accent text-accent-foreground hover:brightness-110 shadow-glow-accent text-xs font-black uppercase tracking-[0.2em] gap-2 h-12 px-5 sm:h-14 sm:px-8 transition-all hover:scale-105 active:scale-95"
          >
            <BarChart3 size={18} strokeWidth={3} />
            Relatórios
          </Button>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Large Feature Card: Patrimonio */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 lg:col-span-7"
        >
          <div className="premium-card h-full p-5 sm:p-8 flex flex-col justify-between group overflow-hidden relative min-h-[300px] sm:min-h-[340px] border-primary/20 bg-primary/5">
             {/* Decorative Elements */}
             <div className="absolute -top-20 -right-20 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
               <DollarSign size={400} className="text-primary" />
             </div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-glow transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                   <ShieldCheck size={24} strokeWidth={2.5} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 leading-none mb-1.5">
                     Ativo Circulante
                   </span>
                   <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                     Patrimônio Total em Estoque
                     <ArrowUpRight size={14} className="opacity-50" />
                   </span>
                 </div>
               </div>
               
                <div className="flex flex-col">
                  <span className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-2">Total Consolidado</span>
                  <div className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-gradient leading-none tabular-nums drop-shadow-2xl break-words">
                    R$ {dashboardData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between relative z-10">
               <div className="flex flex-col gap-4 flex-1 sm:mr-8">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                   <span>Performance de Estoque</span>
                   <span className="text-primary">98% Otimizado</span>
                 </div>
                 <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "98%" }}
                     transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                     className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_15px_oklch(var(--primary)/0.5)]" 
                   />
                 </div>
               </div>
               <div className="flex flex-col items-end shrink-0">
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] font-black text-success uppercase tracking-tighter">Saudável</span>
                   <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                 </div>
                 <span className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">Status da Operação</span>
               </div>
             </div>
          </div>
        </motion.div>

        {/* Medium Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:col-span-5 gap-5">
          <Stat 
            label="Vendas Hoje" 
            value={String(dashboardData.salesToday)} 
            icon={ShoppingCart}
            trend={dashboardData.salesTrend}
            description="Volume de itens vendidos"
          />
          <Stat 
            label="Lucro Bruto" 
            value={`R$ ${dashboardData.profitToday.toFixed(2)}`} 
            icon={TrendingUp}
            trend={dashboardData.profitTrend}
            description="Margem estimada do dia"
          />
          <Stat 
            label="Estoque Pista" 
            value={String(dashboardData.totalPista)} 
            icon={Fuel} 
            description="Disponibilidade imediata"
          />
          <Stat 
            label="Estoque Galpão" 
            value={String(dashboardData.totalEstoque)} 
            icon={Warehouse} 
            description="Reserva de contingência"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-1 border-white/5 bg-card/30 group"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
                  <BarChart3 size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent">Fluxo de Vendas (7 Dias)</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <Calendar size={12} />
                  Última Semana
                </div>
              </div>
            </div>
            <React.Suspense fallback={
              <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary/20" size={32} />
              </div>
            }>
              <div className="p-6">
                <DashboardCharts daysData={dashboardData.daysData} topData={dashboardData.top} />
              </div>
            </React.Suspense>
          </motion.div>

          {/* Low Stock Alerts */}
          {dashboardData.lowStockCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 border-destructive/30 bg-destructive/5 relative overflow-hidden ring-1 ring-destructive/10"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10">
                <AlertTriangle size={120} className="text-destructive" />
              </div>
              
              <div className="flex items-center gap-5 mb-10 relative z-10">
                <div className="p-4 rounded-2xl bg-destructive text-destructive-foreground shadow-[0_0_30px_oklch(var(--destructive)/0.5)] animate-pulse">
                  <AlertTriangle size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-destructive uppercase italic leading-none mb-2">Ação Crítica Necessária</h3>
                  <p className="text-[12px] text-destructive/60 font-black uppercase tracking-[0.25em] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-ping" />
                    {dashboardData.lowStockCount} {dashboardData.lowStockCount === 1 ? 'item com ruptura de estoque' : 'itens com ruptura de estoque'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                {dashboardData.lowStockProducts.map((p) => (
                  <div key={p.id} className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-destructive/40 transition-all hover:bg-white/10 group">
                    <p className="font-black text-sm truncate mb-3 group-hover:text-destructive transition-colors">{p.name}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground/40 font-black uppercase tracking-widest">Nível Atual</span>
                        <span className="text-destructive font-black tabular-nums">{p.pista_qty + p.estoque_qty} un</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-destructive/40" 
                          style={{ width: `${Math.min(100, ((p.pista_qty + p.estoque_qty) / (p.pista_min + p.estoque_min)) * 100)}%` }} 
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground/40 font-black uppercase tracking-widest">Limite Mínimo</span>
                        <span className="text-muted-foreground/60 font-black tabular-nums">{p.pista_min + p.estoque_min} un</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {dashboardData.lowStockCount > 3 && (
                  <button 
                    onClick={() => navigate({ to: "/produtos" })}
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 gap-3 group"
                  >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                      <ArrowRight size={20} />
                    </div>
                    Ver todos ({dashboardData.lowStockCount})
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4 h-full"
        >
          <RecentMovements 
            movements={dashboardData.allMovements} 
            products={products}
          />
        </motion.div>
      </div>
    </div>
  );
}
