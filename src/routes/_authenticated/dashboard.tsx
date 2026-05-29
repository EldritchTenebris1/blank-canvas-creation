import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useMovements } from "@/hooks/use-movements";
import { Stat } from "@/components/buriti/Stat";
import { Button } from "@/components/ui/button";

// Lazy load heavy chart components
const DashboardCharts = React.lazy(() => import("@/components/buriti/DashboardCharts"));

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: movements = [], isLoading: loadingMovements } = useMovements(7); // Last 7 days for the chart

  const dashboardData = React.useMemo(() => {
    const totalPista = products.reduce((s, p) => s + p.pista_qty, 0);
    const totalEstoque = products.reduce((s, p) => s + p.estoque_qty, 0);
    const lowStock = products.filter(
      (p) => p.pista_qty < p.pista_min || p.estoque_qty < p.estoque_min,
    ).length;
    const totalValue = products.reduce(
      (s, p) => s + Number(p.cost_price || 0) * (p.pista_qty + p.estoque_qty),
      0,
    );

    const today = new Date().toISOString().slice(0, 10);
    const todaySales = movements.filter(
      (m) => m.type === "venda" && m.created_at.slice(0, 10) === today,
    );
    const salesToday = todaySales.reduce((s, m) => s + m.quantity, 0);

    const profitToday = todaySales.reduce((sum, m) => {
      const p = products.find((x) => x.id === m.product_id);
      if (!p) return sum;
      return sum + (Number(p.sale_price) - Number(p.cost_price || 0)) * m.quantity;
    }, 0);

    // Sales last 7 days for chart
    const daysData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().slice(0, 10);
      const sales = movements.filter(
        (m) => m.type === "venda" && m.created_at.slice(0, 10) === iso,
      ).length;
      return { day: d.toLocaleDateString("pt-BR", { weekday: "short" }), vendas: sales };
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

    const lowProducts = products.filter((p) => p.pista_qty < p.pista_min).slice(0, 5);

    return { totalPista, totalEstoque, lowStock, totalValue, salesToday, profitToday, daysData, top, lowProducts, todaySalesCount: todaySales.length };
  }, [products, movements]);

  const isLoading = loadingProducts || loadingMovements;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl text-gradient">
            Visão Geral
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento em tempo real do Posto Buriti.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-1 px-3">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Sincronizado agora
          </span>
        </div>
      </header>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4 lg:grid-rows-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 md:col-span-2 lg:row-span-2"
        >
          <div className="premium-card h-full p-8 flex flex-col justify-between group overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 translate-x-4 -translate-y-4">
               <DollarSign size={160} className="text-primary" />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-4">
                 <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-glow">
                   <TrendingUp size={20} />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                   Patrimônio Total
                 </span>
               </div>
               <div className="text-5xl font-black tracking-tighter text-gradient leading-none">
                 R$ {dashboardData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </div>
             </div>
             <div className="mt-8 flex items-center gap-4">
               <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "70%" }}
                   className="h-full bg-primary" 
                 />
               </div>
               <span className="text-xs font-bold text-primary">+12.5%</span>
             </div>
          </div>
        </motion.div>

        <Stat label="Estoque Pista" value={String(dashboardData.totalPista)} icon={Fuel} />
        <Stat label="Estoque Galpão" value={String(dashboardData.totalEstoque)} icon={Warehouse} />
        <Stat label="Vendas Hoje" value={String(dashboardData.salesToday)} icon={ShoppingCart} />
        <Stat label="Lucro Hoje" value={`R$ ${dashboardData.profitToday.toFixed(2)}`} icon={TrendingUp} />
        <Stat 
          label="Alertas Críticos" 
          value={String(dashboardData.lowStock)} 
          icon={AlertTriangle} 
          highlight={dashboardData.lowStock > 0} 
        />
        <Stat label="Catálogo" value={String(products.length)} icon={Package} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <React.Suspense fallback={
            <div className="premium-card rounded-2xl h-[400px] flex items-center justify-center border-white/5">
              <Loader2 className="animate-spin text-primary/20" size={32} />
            </div>
          }>
            <DashboardCharts daysData={dashboardData.daysData} topData={dashboardData.top} />
          </React.Suspense>
        </div>

        <div className="premium-card p-6 border-white/5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Alertas de Estoque</h3>
              <p className="text-[11px] text-muted-foreground">Itens abaixo da margem de segurança.</p>
            </div>
            <div className="rounded-full bg-destructive/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-destructive border border-destructive/20">
              {dashboardData.lowStock} Críticos
            </div>
          </div>
          
          {dashboardData.lowProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-2xl bg-success/10 p-4 text-success border border-success/20">
                <Package size={32} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Tudo sob controle. ✓
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.lowProducts.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <div className="truncate font-bold tracking-tight">{p.name}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      Cód. {p.internal_code ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-black text-destructive leading-none">{p.pista_qty}</div>
                      <div className="text-[9px] font-bold uppercase text-muted-foreground/40">Qtd</div>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground/20" />
                  </div>
                </motion.div>
              ))}
              <Button variant="outline" className="w-full mt-4 rounded-xl border-dashed">
                Ver Relatório Completo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
