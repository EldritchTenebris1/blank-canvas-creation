import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, DollarSign, Package, Award, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/buriti/PageHeader";
import { useProducts } from "@/hooks/use-products";
import { useMovements } from "@/hooks/use-movements";

// Lazy load heavy chart components
const ReportsCharts = React.lazy(() => import("@/components/buriti/ReportsCharts"));

export const Route = createFileRoute("/_authenticated/relatorios")({ component: RelatoriosPage });

function RelatoriosPage() {
  const [days, setDays] = React.useState(30);
  const { data: movements = [], isLoading: loadingMovements } = useMovements(days);
  const { data: products = [], isLoading: loadingProducts } = useProducts();

  const productMap = React.useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  
  const reportData = React.useMemo(() => {
    const sales = movements.filter((m) => m.type === "venda");
    const revenue = sales.reduce((s, m) => s + (Number(productMap[m.product_id]?.sale_price ?? 0)) * m.quantity, 0);
    const cost = sales.reduce((s, m) => s + (Number(productMap[m.product_id]?.cost_price ?? 0)) * m.quantity, 0);
    const profit = revenue - cost;
    const unitsSold = sales.reduce((s, m) => s + m.quantity, 0);

    // Top produtos
    const topMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const m of sales) {
      const p = productMap[m.product_id];
      if (!p) continue;
      if (!topMap[p.id]) topMap[p.id] = { name: p.name, qty: 0, revenue: 0 };
      topMap[p.id].qty += m.quantity;
      topMap[p.id].revenue += m.quantity * Number(p.sale_price);
    }
    const topProducts = Object.values(topMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // Por categoria
    const catMap: Record<string, number> = {};
    for (const m of sales) {
      const p = productMap[m.product_id];
      if (!p) continue;
      const c = p.category ?? "Sem categoria";
      catMap[c] = (catMap[c] ?? 0) + m.quantity * Number(p.sale_price);
    }
    const byCategory = Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value) }));

    return { revenue, profit, unitsSold, topProducts, byCategory };
  }, [movements, productMap]);

  const { revenue, profit, unitsSold, topProducts, byCategory } = reportData;

  const isLoading = loadingMovements || loadingProducts;

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description={`Análise dos últimos ${days} dias`}
        action={
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d} onClick={() => setDays(d)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${days === d ? "border-accent bg-accent text-[oklch(0.18_0.04_255)] font-bold shadow-glow-accent" : "border-border/60 hover:bg-card/50"}`}
              >{d}d</button>
            ))}
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="animate-spin text-accent" size={48} />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Receita" value={`R$ ${revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={DollarSign} />
            <Kpi label="Lucro bruto" value={`R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={TrendingUp} accent />
            <Kpi label="Unidades vendidas" value={unitsSold.toString()} icon={Package} />
            <Kpi label="Margem" value={`${revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0"}%`} icon={Award} />
          </div>

          <React.Suspense fallback={
            <div className="glass rounded-2xl h-[350px] flex items-center justify-center">
              <Loader2 className="animate-spin text-accent/20" size={32} />
            </div>
          }>
            <ReportsCharts topProducts={topProducts} byCategory={byCategory} />
          </React.Suspense>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5 border-none shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{label}</div>
        <Icon size={16} className={accent ? "text-accent" : "text-muted-foreground/40"} />
      </div>
      <div className={`mt-2 text-2xl font-black tracking-tight ${accent ? "text-accent" : "text-slate-800"}`}>{value}</div>
    </div>
  );
}
