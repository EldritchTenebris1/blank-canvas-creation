import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Fuel,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Warehouse,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone?: "primary" | "accent" | "success" | "warning" | "destructive";
}) {
  const tones: Record<string, string> = {
    primary: "from-primary/20 to-primary/0 text-primary",
    accent: "from-accent/20 to-accent/0 text-accent",
    success: "from-[oklch(0.7_0.18_155)]/20 to-transparent text-[oklch(0.8_0.18_155)]",
    warning: "from-warning/20 to-transparent text-warning",
    destructive: "from-destructive/20 to-transparent text-destructive",
  };
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 transition hover:scale-[1.01] sm:p-5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl ${tones[tone]}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-card/60 ${tones[tone].split(" ").pop()}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*");
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  const { data: movements } = useQuery({
    queryKey: ["movements-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("movements")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  const totalPista = products?.reduce((s, p) => s + p.pista_qty, 0) ?? 0;
  const totalEstoque = products?.reduce((s, p) => s + p.estoque_qty, 0) ?? 0;
  const lowStock =
    products?.filter(
      (p) => p.pista_qty < p.pista_min || p.estoque_qty < p.estoque_min,
    ).length ?? 0;
  const totalValue =
    products?.reduce(
      (s, p) => s + Number(p.cost_price) * (p.pista_qty + p.estoque_qty),
      0,
    ) ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const todaySales = movements?.filter(
    (m) => m.type === "venda" && m.created_at.slice(0, 10) === today,
  ) ?? [];
  const salesToday = todaySales.reduce((s, m) => s + m.quantity, 0);

  const profitToday = todaySales.reduce((sum, m) => {
    const p = products?.find((x) => x.id === m.product_id);
    if (!p) return sum;
    return sum + (Number(p.sale_price) - Number(p.cost_price)) * m.quantity;
  }, 0);

  // Sales last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const sales = movements?.filter(
      (m) => m.type === "venda" && m.created_at.slice(0, 10) === iso,
    ).length ?? 0;
    return { day: d.toLocaleDateString("pt-BR", { weekday: "short" }), vendas: sales };
  });

  // Top products
  const top = Object.entries(
    movements
      ?.filter((m) => m.type === "venda")
      .reduce<Record<string, number>>((acc, m) => {
        const name = (m as { products: { name: string } | null }).products?.name ?? "—";
        acc[name] = (acc[name] ?? 0) + m.quantity;
        return acc;
      }, {}) ?? {},
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  const lowProducts =
    products?.filter((p) => p.pista_qty < p.pista_min).slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard label="Produtos na Pista" value={String(totalPista)} icon={Fuel} tone="accent" hint="Unidades disponíveis" />
        <StatCard label="Estoque Principal" value={String(totalEstoque)} icon={Warehouse} tone="primary" hint="Unidades em depósito" />
        <StatCard label="Estoque Baixo" value={String(lowStock)} icon={AlertTriangle} tone="destructive" hint="Produtos abaixo do mínimo" />
        <StatCard label="Valor do Estoque" value={`R$ ${totalValue.toFixed(2)}`} icon={DollarSign} tone="success" hint="Valor de custo total" />
        <StatCard label="Vendas Hoje" value={String(salesToday)} icon={ShoppingCart} tone="accent" hint={`${todaySales.length} movimentações`} />
        <StatCard label="Lucro Estimado Hoje" value={`R$ ${profitToday.toFixed(2)}`} icon={TrendingUp} tone="success" />
        <StatCard label="Produtos Cadastrados" value={String(products?.length ?? 0)} icon={Package} tone="primary" />
        <StatCard label="Movimentações" value={String(movements?.length ?? 0)} icon={Users} tone="warning" hint="Últimas 200" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Vendas — últimos 7 dias</h3>
              <p className="text-xs text-muted-foreground">Evolução das movimentações de venda</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={days}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.85 0.18 90)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.85 0.18 90)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="day" stroke="oklch(0.68 0.03 250)" fontSize={12} />
              <YAxis stroke="oklch(0.68 0.03 250)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.22 0.045 255)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="oklch(0.92 0.2 92)"
                strokeWidth={2.5}
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-semibold">Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis type="number" stroke="oklch(0.68 0.03 250)" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="oklch(0.68 0.03 250)" fontSize={11} width={80} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.22 0.045 255)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="qty" fill="oklch(0.65 0.22 250)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Alertas de Estoque Baixo</h3>
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            {lowProducts.length} produtos
          </span>
        </div>
        {lowProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum produto abaixo do mínimo na pista. ✓
          </p>
        ) : (
          <div className="space-y-2">
            {lowProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3"
              >
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.brand ?? "—"} · Código {p.internal_code ?? "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-destructive">{p.pista_qty}</div>
                  <div className="text-xs text-muted-foreground">mín. {p.pista_min}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}