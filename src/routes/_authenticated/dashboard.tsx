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
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <Stat label="Pista" value={String(dashboardData.totalPista)} icon={Fuel} highlight={false} />
        <Stat label="Estoque" value={String(dashboardData.totalEstoque)} icon={Warehouse} highlight={false} />
        <Stat label="Alertas" value={String(dashboardData.lowStock)} icon={AlertTriangle} highlight={dashboardData.lowStock > 0} />
        <Stat label="Patrimônio" value={`R$ ${dashboardData.totalValue.toFixed(2)}`} icon={DollarSign} highlight={false} />
        <Stat label="Vendas Hoje" value={String(dashboardData.salesToday)} icon={ShoppingCart} highlight={false} />
        <Stat label="Lucro Hoje" value={`R$ ${dashboardData.profitToday.toFixed(2)}`} icon={TrendingUp} highlight={false} />
        <Stat label="Catálogo" value={String(products.length)} icon={Package} highlight={false} />
        <Stat label="Movimentos" value={String(movements.length)} icon={Users} highlight={false} />
      </div>

      <React.Suspense fallback={
        <div className="glass rounded-2xl h-[300px] flex items-center justify-center">
          <Loader2 className="animate-spin text-accent/20" size={32} />
        </div>
      }>
        <DashboardCharts daysData={dashboardData.daysData} topData={dashboardData.top} />
      </React.Suspense>

      <div className="glass rounded-2xl p-5 border-none shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Alertas de Estoque Baixo</h3>
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
            {dashboardData.lowProducts.length} críticos
          </span>
        </div>
        {dashboardData.lowProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum produto abaixo do mínimo na pista. ✓
          </p>
        ) : (
          <div className="space-y-2">
            {dashboardData.lowProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3"
              >
                <div>
                  <div className="font-bold text-slate-800">{p.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {p.brand ?? "—"} · Código {p.internal_code ?? "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-destructive">{p.pista_qty}</div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">mín. {p.pista_min}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
