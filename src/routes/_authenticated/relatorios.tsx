import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, DollarSign, Package, Award, Loader2, Download, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { PageHeader } from "@/components/buriti/PageHeader";
import { useProducts } from "@/hooks/use-products";
import { useMovements } from "@/hooks/use-movements";
import { toast } from "sonner";

// Lazy load heavy chart components
const ReportsCharts = React.lazy(() => import("@/components/buriti/ReportsCharts"));

export const Route = createFileRoute("/_authenticated/relatorios")({ component: RelatoriosPage });

function RelatoriosPage() {
  const [days, setDays] = React.useState(30);
  
  // Fetch double the days to compare periods
  const { data: movements = [], isLoading: loadingMovements } = useMovements(days * 2);
  const { data: products = [], isLoading: loadingProducts } = useProducts();

  const productMap = React.useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  
  const reportData = React.useMemo(() => {
    const now = new Date();
    const midPoint = new Date(now.getTime() - days * 86400000);
    const startPoint = new Date(now.getTime() - (days * 2) * 86400000);

    const currentSales = movements.filter((m) => m.type === "venda" && new Date(m.created_at) >= midPoint);
    const previousSales = movements.filter((m) => m.type === "venda" && new Date(m.created_at) < midPoint && new Date(m.created_at) >= startPoint);

    const calculateMetrics = (sales: any[]) => {
      const revenue = sales.reduce((s, m) => s + (Number(productMap[m.product_id]?.sale_price ?? 0)) * m.quantity, 0);
      const cost = sales.reduce((s, m) => s + (Number(productMap[m.product_id]?.cost_price ?? 0)) * m.quantity, 0);
      const profit = revenue - cost;
      const units = sales.reduce((s, m) => s + m.quantity, 0);
      return { revenue, profit, units };
    };

    const current = calculateMetrics(currentSales);
    const previous = calculateMetrics(previousSales);

    // Evolution data (daily)
    const evolutionMap: Record<string, { date: string; revenue: number; profit: number }> = {};
    // Initialize last X days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      evolutionMap[key] = { date: key, revenue: 0, profit: 0 };
    }

    for (const m of currentSales) {
      const key = new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (evolutionMap[key]) {
        const p = productMap[m.product_id];
        const rev = m.quantity * Number(p?.sale_price ?? 0);
        const cost = m.quantity * Number(p?.cost_price ?? 0);
        evolutionMap[key].revenue += rev;
        evolutionMap[key].profit += (rev - cost);
      }
    }
    const evolution = Object.values(evolutionMap);

    // Top produtos
    const topMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const m of currentSales) {
      const p = productMap[m.product_id];
      if (!p) continue;
      if (!topMap[p.id]) topMap[p.id] = { name: p.name, qty: 0, revenue: 0 };
      topMap[p.id].qty += m.quantity;
      topMap[p.id].revenue += m.quantity * Number(p.sale_price);
    }
    const topProducts = Object.values(topMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // Por categoria
    const catMap: Record<string, number> = {};
    for (const m of currentSales) {
      const p = productMap[m.product_id];
      if (!p) continue;
      const c = p.category ?? "Sem categoria";
      catMap[c] = (catMap[c] ?? 0) + m.quantity * Number(p.sale_price);
    }
    const byCategory = Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value) }));

    return { 
      metrics: {
        current,
        previous,
        trends: {
          revenue: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0,
          profit: previous.profit > 0 ? ((current.profit - previous.profit) / previous.profit) * 100 : 0,
          units: previous.units > 0 ? ((current.units - previous.units) / previous.units) * 100 : 0,
          margin: previous.revenue > 0 && current.revenue > 0 
            ? ((current.profit / current.revenue) - (previous.profit / previous.revenue)) * 100 
            : 0
        }
      }, 
      topProducts, 
      byCategory, 
      evolution 
    };
  }, [movements, productMap, days]);

  const handleExport = () => {
    try {
      const SEP = ";";
      const escapeCell = (value: string | number) => {
        const str = String(value ?? "");
        if (str.includes(SEP) || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      const formatMoney = (n: number) =>
        n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const headers = ["Data", "Produto", "Quantidade", "Preço Unitário", "Total"];
      const rows = movements
        .filter(m => m.type === "venda")
        .map(m => {
          const p = productMap[m.product_id];
          const price = Number(p?.sale_price || 0);
          return [
            new Date(m.created_at).toLocaleDateString("pt-BR"),
            p?.name || "",
            m.quantity,
            formatMoney(price),
            formatMoney(m.quantity * price),
          ].map(escapeCell).join(SEP);
        });

      const csvContent = [headers.map(escapeCell).join(SEP), ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const today = new Date();
      const dateStr = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }).replace(/\//g, "-");

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio_${dateStr}_${days}_dias.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Relatório exportado com sucesso");
    } catch (e) {
      toast.error("Erro ao exportar relatório");
    }
  };

  const isLoading = loadingMovements || loadingProducts;

  return (
    <div className="pb-12">
      <PageHeader
        title="Relatórios de Performance"
        description="Análise detalhada de vendas, lucros e movimentação"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex premium-glass p-1 rounded-xl border-white/5">
              {[7, 30, 90].map((d) => (
                <button
                  key={d} onClick={() => setDays(d)}
                  className={`rounded-lg px-4 py-1.5 text-[10px] uppercase font-black tracking-widest transition-all ${days === d ? "bg-accent text-[oklch(0.18_0.04_255)] shadow-sm" : "text-muted-foreground hover:text-slate-900"}`}
                >{d} dias</button>
              ))}
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-[10px] uppercase font-black tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <Download size={14} />
              Exportar
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-32 space-y-4">
          <Loader2 className="animate-spin text-accent" size={48} />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40 animate-pulse">Processando dados...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi 
              label="Receita Total" 
              value={`R$ ${reportData.metrics.current.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
              icon={DollarSign} 
              trend={reportData.metrics.trends.revenue}
            />
            <Kpi 
              label="Lucro Líquido" 
              value={`R$ ${reportData.metrics.current.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
              icon={TrendingUp} 
              trend={reportData.metrics.trends.profit}
              isAccent
            />
            <Kpi 
              label="Itens Vendidos" 
              value={reportData.metrics.current.units.toLocaleString("pt-BR")} 
              icon={Package} 
              trend={reportData.metrics.trends.units}
            />
            <Kpi 
              label="Margem Média" 
              value={`${(reportData.metrics.current.revenue > 0 ? (reportData.metrics.current.profit / reportData.metrics.current.revenue) * 100 : 0).toFixed(1)}%`} 
              icon={Award} 
              trend={reportData.metrics.trends.margin}
            />
          </div>

          <React.Suspense fallback={
            <div className="glass rounded-3xl h-[450px] flex items-center justify-center border-none">
              <Loader2 className="animate-spin text-accent/20" size={32} />
            </div>
          }>
            <ReportsCharts 
              topProducts={reportData.topProducts} 
              byCategory={reportData.byCategory} 
              evolution={reportData.evolution} 
            />
          </React.Suspense>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, icon: Icon, trend, isAccent }: { label: string; value: string; icon: React.ElementType; trend: number; isAccent?: boolean }) {
  const isPositive = trend >= 0;
  
  return (
    <div className="premium-card p-6 group animate-reveal">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl transition-all duration-300 ${
          isAccent 
            ? "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground" 
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        }`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-tight ${
          isPositive 
            ? 'bg-emerald-500/10 text-emerald-500' 
            : 'bg-rose-500/10 text-rose-500'
        }`}>
          {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1.5">{label}</h3>
        <div className={`text-3xl font-black tracking-tighter transition-transform duration-300 group-hover:scale-[1.02] origin-left ${
          isAccent ? 'text-accent drop-shadow-[0_0_10px_var(--accent-glow)]' : 'text-foreground'
        }`}>
          {value}
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
        <div className="p-1 rounded-md bg-white/5 text-muted-foreground/30">
          <Calendar size={10} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">vs período anterior</span>
      </div>
    </div>
  );
}