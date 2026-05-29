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
  const { data: movements = [], isLoading: loadingMovements } = useMovements(30); // Get more days for better context

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
      <div className="flex items-center justify-center p-24">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter sm:text-4xl text-gradient uppercase italic">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground/60 font-medium ml-12">
            Bem-vindo ao {stationName}. Aqui está o resumo do seu negócio.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate({ to: "/produtos" })}
            variant="outline" 
            className="rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest gap-2 h-11"
          >
            <Plus size={16} />
            Novo Produto
          </Button>
          <Button 
            onClick={() => navigate({ to: "/vender" })}
            className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow text-xs font-bold uppercase tracking-widest gap-2 h-11 px-6"
          >
            <ShoppingCart size={16} />
            Lançar Venda
          </Button>
        </div>
      </header>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 lg:col-span-2"
        >
          <div className="premium-card h-full p-8 flex flex-col justify-between group overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110 rotate-12 translate-x-4 -translate-y-4">
               <DollarSign size={180} className="text-primary" />
             </div>
             
             <div>
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-glow transition-transform group-hover:rotate-12">
                   <TrendingUp size={20} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mb-1">
                     Patrimônio em Estoque
                   </span>
                   <span className="text-xs font-bold text-primary">Custo Total Acumulado</span>
                 </div>
               </div>
               
               <div className="text-5xl font-black tracking-tighter text-gradient leading-none mb-2">
                 R$ {dashboardData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </div>
               <p className="text-xs text-muted-foreground/60 font-medium">
                 Baseado nos preços de custo e quantidades atuais.
               </p>
             </div>

             <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4 flex-1 mr-6">
                 <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className="h-full bg-gradient-to-r from-primary/40 to-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                   />
                 </div>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Saudável</span>
                 <span className="text-[10px] text-muted-foreground/40 font-bold uppercase">Status</span>
               </div>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:col-span-2 gap-4">
          <Stat 
            label="Vendas Hoje" 
            value={String(dashboardData.salesToday)} 
            icon={ShoppingCart}
            trend={dashboardData.salesTrend}
            description="Itens vendidos hoje"
          />
          <Stat 
            label="Lucro Estimado" 
            value={`R$ ${dashboardData.profitToday.toFixed(2)}`} 
            icon={TrendingUp}
            trend={dashboardData.profitTrend}
            description="Lucro bruto do dia"
          />
          <Stat 
            label="Estoque Pista" 
            value={String(dashboardData.totalPista)} 
            icon={Fuel} 
            description="Total de galões/litros"
          />
          <Stat 
            label="Estoque Galpão" 
            value={String(dashboardData.totalEstoque)} 
            icon={Warehouse} 
            description="Total em armazenamento"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <React.Suspense fallback={
              <div className="premium-card rounded-3xl h-[450px] flex items-center justify-center border-white/5">
                <Loader2 className="animate-spin text-primary/20" size={32} />
              </div>
            }>
              <DashboardCharts daysData={dashboardData.daysData} topData={dashboardData.top} />
            </React.Suspense>
          </motion.div>

          {/* Low Stock Alerts */}
          {dashboardData.lowStockCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 border-destructive/20 bg-destructive/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <AlertTriangle size={80} className="text-destructive" />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-destructive text-destructive-foreground shadow-[0_0_15px_rgba(var(--destructive-rgb),0.5)]">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-destructive">Alertas de Estoque Crítico</h3>
                  <p className="text-[11px] text-destructive/60 font-bold uppercase tracking-widest">
                    {dashboardData.lowStockCount} {dashboardData.lowStockCount === 1 ? 'produto precisa' : 'produtos precisam'} de atenção
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboardData.lowStockProducts.map((p) => (
                  <div key={p.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-destructive/30 transition-colors">
                    <p className="font-bold text-sm truncate mb-2">{p.name}</p>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-bold uppercase">Atual</span>
                      <span className="text-destructive font-black">{p.pista_qty + p.estoque_qty} un</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-1">
                      <span className="text-muted-foreground font-bold uppercase">Mínimo</span>
                      <span className="text-muted-foreground/60 font-black">{p.pista_min + p.estoque_min} un</span>
                    </div>
                  </div>
                ))}
                
                {dashboardData.lowStockCount > 3 && (
                  <button className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 gap-1">
                    <Plus size={16} />
                    Ver mais {dashboardData.lowStockCount - 3}
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
          className="h-full"
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
