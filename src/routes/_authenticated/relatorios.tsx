import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Package, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/buriti/PageHeader";

export const Route = createFileRoute("/_authenticated/relatorios")({ component: RelatoriosPage });

type Movement = { id: string; created_at: string; type: string; quantity: number; product_id: string };
type Product = { id: string; name: string; category: string | null; sale_price: number; cost_price: number };

const COLORS = ["oklch(0.82 0.18 90)", "oklch(0.65 0.15 250)", "oklch(0.7 0.18 145)", "oklch(0.7 0.2 25)", "oklch(0.68 0.16 320)"];

function RelatoriosPage() {
  const [days, setDays] = React.useState(30);

  const { data: movements = [] } = useQuery({
    queryKey: ["movements", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      return ((await supabase.from("movements").select("*").gte("created_at", since)).data ?? []) as Movement[];
    },
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => ((await supabase.from("products").select("*")).data ?? []) as Product[],
  });

  const productMap = React.useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
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
                className={`rounded-lg border px-3 py-1.5 text-xs ${days === d ? "border-accent bg-accent text-[oklch(0.18_0.04_255)]" : "border-border/60"}`}
              >{d}d</button>
            ))}
          </div>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Receita" value={`R$ ${revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={DollarSign} />
        <Kpi label="Lucro bruto" value={`R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={TrendingUp} accent />
        <Kpi label="Unidades vendidas" value={unitsSold.toString()} icon={Package} />
        <Kpi label="Margem" value={`${revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0"}%`} icon={Award} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top produtos por receita</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 255)" />
              <XAxis dataKey="name" tick={{ fill: "oklch(0.7 0.02 255)", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fill: "oklch(0.7 0.02 255)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "oklch(0.22 0.04 255)", border: "1px solid oklch(0.3 0.03 255)", borderRadius: 12 }} />
              <Bar dataKey="revenue" fill="oklch(0.82 0.18 90)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Por categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.22 0.04 255)", border: "1px solid oklch(0.3 0.03 255)", borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon size={16} className={accent ? "text-accent" : "text-muted-foreground"} />
      </div>
      <div className={`mt-2 text-2xl font-bold ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
  );
}