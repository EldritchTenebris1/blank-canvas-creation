import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Package, Award, Loader2, Download, ArrowUpRight, ArrowDownRight, Calendar, Activity, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/buriti/PageHeader";
import { supabase } from "@/integrations/supabase/client";
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

  // Mapa user_id -> nome do frentista (employees + profiles como fallback)
  const { data: sellerMap = {} } = useQuery({
    queryKey: ["seller-map"],
    queryFn: async () => {
      const [{ data: emps }, { data: profs }] = await Promise.all([
        supabase.from("employees").select("user_id,name"),
        supabase.from("profiles").select("id,full_name"),
      ]);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => { if (p.id) map[p.id] = p.full_name || "—"; });
      (emps ?? []).forEach((e: any) => { if (e.user_id) map[e.user_id] = e.name || map[e.user_id] || "—"; });
      return map;
    },
    staleTime: 1000 * 60 * 5,
  });

  const sellerName = React.useCallback(
    (uid: string | null | undefined) => (uid ? sellerMap[uid] ?? "Não identificado" : "Não identificado"),
    [sellerMap],
  );

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
      const count = sales.length;
      const avgTicket = count > 0 ? revenue / count : 0;
      return { revenue, profit, units, count, avgTicket };
    };

    const current = calculateMetrics(currentSales);
    const previous = calculateMetrics(previousSales);

    // Evolution data (daily)
    const evolutionMap: Record<string, { date: string; revenue: number; profit: number; margin: number }> = {};
    // Initialize last X days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      evolutionMap[key] = { date: key, revenue: 0, profit: 0, margin: 0 };
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
    
    // Calculate margins
    Object.values(evolutionMap).forEach(day => {
      day.margin = day.revenue > 0 ? (day.profit / day.revenue) * 100 : 0;
    });

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

    // Scatter data for correlation analysis
    const scatterData = topProducts.map(p => ({
      name: p.name,
      qty: p.qty,
      revenue: p.revenue,
      avgPrice: p.qty > 0 ? p.revenue / p.qty : 0
    }));

    return { 
      metrics: {
        current,
        previous,
        trends: {
          revenue: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0,
          profit: previous.profit > 0 ? ((current.profit - previous.profit) / previous.profit) * 100 : 0,
          units: previous.units > 0 ? ((current.units - previous.units) / previous.units) * 100 : 0,
          count: previous.count > 0 ? ((current.count - previous.count) / previous.count) * 100 : 0,
          avgTicket: previous.avgTicket > 0 ? ((current.avgTicket - previous.avgTicket) / previous.avgTicket) * 100 : 0,
          margin: previous.revenue > 0 && current.revenue > 0 
            ? ((current.profit / current.revenue) - (previous.profit / previous.revenue)) * 100 
            : 0
        }
      }, 
      topProducts, 
      byCategory, 
      evolution,
      scatterData
    };
  }, [movements, productMap, days]);

  const handleExportExcel = async () => {
    const loadingToast = toast.loading("Gerando Excel profissional...");
    try {
      const [{ default: XlsxPopulate }, { saveAs }] = await Promise.all([
        import("xlsx-populate/browser/xlsx-populate.min.js"),
        import("file-saver"),
      ]);
      const workbook = await XlsxPopulate.fromBlankAsync();
      const sheet = workbook.sheet(0);
      sheet.name("Dashboard de Performance");

      // --- Estilização Base ---
      const titleStyle = { bold: true, fontSize: 18, fontColor: "003366", horizontalAlignment: "center" };
      const headerStyle = { bold: true, fill: "003366", fontColor: "ffffff", horizontalAlignment: "center", border: true };
      const kpiLabelStyle = { bold: true, fontSize: 12, fontColor: "666666" };
      const kpiValueStyle = { bold: true, fontSize: 16, fontColor: "003366" };

      // --- 1. Título ---
      sheet.range("B2:H2").merged(true).value("RELATÓRIO DE PERFORMANCE - AUTO POSTO BURITI").style(titleStyle);
      sheet.cell("B3").value(`Gerado em: ${new Date().toLocaleString("pt-BR")}`);
      sheet.cell("B4").value(`Período de análise: últimos ${days} dias`);

      // --- 2. Bloco de KPIs (Dashboard Visual) ---
      const kpis = [
        { label: "Receita Total", value: reportData.metrics.current.revenue, trend: reportData.metrics.trends.revenue },
        { label: "Lucro Líquido", value: reportData.metrics.current.profit, trend: reportData.metrics.trends.profit },
        { label: "Ticket Médio", value: reportData.metrics.current.avgTicket, trend: reportData.metrics.trends.avgTicket },
        { label: "Transações", value: reportData.metrics.current.count, trend: reportData.metrics.trends.count },
        { label: "Margem Média", value: (reportData.metrics.current.revenue > 0 ? (reportData.metrics.current.profit / reportData.metrics.current.revenue) * 100 : 0) / 100, trend: reportData.metrics.trends.margin, isPercent: true }
      ];

      let col = 2; // Começa na coluna B
      kpis.forEach((kpi) => {
        const charCol = String.fromCharCode(64 + col);
        const charColEnd = String.fromCharCode(64 + col + 1);
        sheet.range(`${charCol}6:${charColEnd}6`).merged(true).value(kpi.label).style(kpiLabelStyle);
        
        const valueCell = sheet.cell(`${charCol}7`);
        valueCell.value(kpi.value).style(kpiValueStyle);
        if (kpi.label.includes("Receita") || kpi.label.includes("Lucro") || kpi.label.includes("Ticket")) {
          valueCell.style({ numberFormat: '"R$" #,##0.00' });
        } else if (kpi.isPercent) {
          valueCell.style({ numberFormat: "0.0%" });
        }

        const trendCell = sheet.cell(`${charCol}8`);
        const trendVal = kpi.trend / 100;
        trendCell.value(trendVal).style({ 
          numberFormat: '↑ 0.0%;[Red]↓ 0.0%',
          fontColor: kpi.trend >= 0 ? "008000" : "FF0000",
          fontSize: 10,
          bold: true
        });

        col += 2;
      });

      // --- 3. Top Produtos ---
      sheet.cell("B11").value("RANKING DE PRODUTOS").style({ bold: true, fontSize: 14 });
      const prodHeaderRow = 12;
      sheet.cell(`B${prodHeaderRow}`).value("Produto").style(headerStyle);
      sheet.cell(`C${prodHeaderRow}`).value("Quantidade").style(headerStyle);
      sheet.cell(`D${prodHeaderRow}`).value("Receita").style(headerStyle);
      sheet.cell(`E${prodHeaderRow}`).value("Participação").style(headerStyle);

      reportData.topProducts.forEach((p, i) => {
        const row = prodHeaderRow + 1 + i;
        const totalRevenue = reportData.topProducts.reduce((sum, item) => sum + item.revenue, 0);
        sheet.cell(`B${row}`).value(p.name);
        sheet.cell(`C${row}`).value(p.qty).style({ horizontalAlignment: "center" });
        sheet.cell(`D${row}`).value(p.revenue).style({ numberFormat: '"R$" #,##0.00' });
        sheet.cell(`E${row}`).value(totalRevenue > 0 ? p.revenue / totalRevenue : 0).style({ numberFormat: "0.0%" });
      });

      // --- 4. Histórico Detalhado (Aba Separada) ---
      const detailSheet = workbook.addSheet("Dados Detalhados");
      const detHeader = ["Data", "Frentista", "Produto", "Categoria", "Quantidade", "Preço Venda", "Custo Unitário", "Total Venda", "Lucro Bruto"];
      detHeader.forEach((h, i) => {
        detailSheet.cell(1, i + 1).value(h).style(headerStyle);
      });

      movements
        .filter(m => m.type === "venda")
        .forEach((m, i) => {
          const row = i + 2;
          const p = productMap[m.product_id];
          const price = Number(p?.sale_price || 0);
          const cost = Number(p?.cost_price || 0);

          detailSheet.cell(row, 1).value(new Date(m.created_at)).style({ numberFormat: "dd/mm/yyyy" });
          detailSheet.cell(row, 2).value(sellerName((m as any).user_id));
          detailSheet.cell(row, 3).value(p?.name || "N/A");
          detailSheet.cell(row, 4).value(p?.category || "Diversos");
          detailSheet.cell(row, 5).value(m.quantity);
          detailSheet.cell(row, 6).value(price).style({ numberFormat: '"R$" #,##0.00' });
          detailSheet.cell(row, 7).value(cost).style({ numberFormat: '"R$" #,##0.00' });
          detailSheet.cell(row, 8).value(m.quantity * price).style({ numberFormat: '"R$" #,##0.00' });
          detailSheet.cell(row, 9).value(m.quantity * (price - cost)).style({ numberFormat: '"R$" #,##0.00' });
        });

      // --- 5. Vendas por Frentista (Aba Separada) ---
      const sellerSheet = workbook.addSheet("Vendas por Frentista");
      ["Frentista", "Unidades", "Faturamento", "Lucro"].forEach((h, i) => {
        sellerSheet.cell(1, i + 1).value(h).style(headerStyle);
      });
      const sellerAgg: Record<string, { units: number; revenue: number; profit: number }> = {};
      movements.filter(m => m.type === "venda").forEach((m) => {
        const name = sellerName((m as any).user_id);
        const p = productMap[m.product_id];
        const price = Number(p?.sale_price || 0);
        const cost = Number(p?.cost_price || 0);
        if (!sellerAgg[name]) sellerAgg[name] = { units: 0, revenue: 0, profit: 0 };
        sellerAgg[name].units += m.quantity;
        sellerAgg[name].revenue += m.quantity * price;
        sellerAgg[name].profit += m.quantity * (price - cost);
      });
      Object.entries(sellerAgg).sort((a, b) => b[1].revenue - a[1].revenue).forEach(([name, v], i) => {
        const row = i + 2;
        sellerSheet.cell(row, 1).value(name);
        sellerSheet.cell(row, 2).value(v.units).style({ horizontalAlignment: "center" });
        sellerSheet.cell(row, 3).value(v.revenue).style({ numberFormat: '"R$" #,##0.00' });
        sellerSheet.cell(row, 4).value(v.profit).style({ numberFormat: '"R$" #,##0.00' });
      });

      // Auto-ajuste de colunas
      [sheet, detailSheet, sellerSheet].forEach(s => {
        for (let i = 1; i <= 10; i++) s.column(i).width(20);
      });

      const blob = await workbook.outputAsync();
      saveAs(blob, `Relatorio_Performance_Buriti_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.xlsx`);
      
      toast.dismiss(loadingToast);
      toast.success("Excel Profissional gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("Erro ao gerar Excel premium");
    }
  };

  const handleExportCSV = () => {
    try {
      const SEP = ";"; // Separador ponto e vírgula para melhor abertura direta no Excel BR
      const escapeCell = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      
      const rows = [
        ["RELATÓRIO DE VENDAS - AUTO POSTO BURITI"],
        [`Período: ${days} dias`, `Exportado em: ${new Date().toLocaleString("pt-BR")}`],
        [],
        ["Data", "Frentista", "Produto", "Quantidade", "Preço", "Total", "Custo", "Lucro"],
      ];

      movements
        .filter(m => m.type === "venda")
        .forEach(m => {
          const p = productMap[m.product_id];
          const price = Number(p?.sale_price || 0);
          const cost = Number(p?.cost_price || 0);
          rows.push([
            new Date(m.created_at).toLocaleDateString("pt-BR"),
            sellerName((m as any).user_id),
            p?.name || "",
            String(m.quantity),
            price.toFixed(2).replace('.', ','),
            (m.quantity * price).toFixed(2).replace('.', ','),
            cost.toFixed(2).replace('.', ','),
            (m.quantity * (price - cost)).toFixed(2).replace('.', ',')
          ]);
        });

      const csvContent = "\uFEFF" + rows.map(r => r.map(escapeCell).join(SEP)).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vendas_buriti_${days}dias.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV exportado!");
    } catch (e) {
      toast.error("Erro no CSV");
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
            <div className="flex gap-2">
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-slate-800 text-white rounded-xl px-4 py-2.5 text-[10px] uppercase font-black tracking-widest hover:bg-slate-700 transition-all active:scale-95"
              >
                <Download size={14} />
                CSV
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl px-5 py-2.5 text-[10px] uppercase font-black tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <FileSpreadsheet size={14} />
                EXCEL PREMIUM
              </button>
            </div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
              label="Ticket Médio" 
              value={`R$ ${reportData.metrics.current.avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
              icon={Award} 
              trend={reportData.metrics.trends.avgTicket}
            />
            <Kpi 
              label="Transações" 
              value={reportData.metrics.current.count.toLocaleString("pt-BR")} 
              icon={Activity} 
              trend={reportData.metrics.trends.count}
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
              scatterData={reportData.scatterData}
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
    <div className="premium-card p-4 sm:p-5 group animate-reveal">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl transition-all duration-300 ${
          isAccent 
            ? "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground" 
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        }`}>
          <Icon size={18} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
          isPositive 
            ? 'bg-emerald-500/10 text-emerald-500' 
            : 'bg-rose-500/10 text-rose-500'
        }`}>
          {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">{label}</h3>
        <div className={`text-xl sm:text-2xl font-black tracking-tighter transition-transform duration-300 group-hover:scale-[1.02] origin-left truncate ${
          isAccent ? 'text-accent drop-shadow-[0_0_10px_var(--accent-glow)]' : 'text-foreground'
        }`}>
          {value}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
        <div className="p-1 rounded-md bg-white/5 text-muted-foreground/30">
          <Calendar size={10} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">vs período anterior</span>
      </div>
    </div>
  );
}