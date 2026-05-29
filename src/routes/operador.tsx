import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Minus, Plus, ShoppingCart, AlertTriangle, Search, Target, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuritiLogo } from "@/components/buriti/Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/operador")({ component: OperadorPage });

type Product = {
  id: string; name: string; brand: string | null; category: string | null;
  pista_qty: number; pista_min: number; sale_price: number;
};

function OperadorPage() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (role === "admin") navigate({ to: "/dashboard", replace: true });
  }, [loading, user, role, navigate]);

  const { data: products = [] } = useQuery({
    queryKey: ["products-pista"],
    queryFn: async () =>
      ((await supabase.from("products").select("id,name,brand,category,pista_qty,pista_min,sale_price").gt("pista_qty", 0).order("name")).data ?? []) as Product[],
    refetchInterval: 3000,
    enabled: role === "frentista",
  });

  // ── Dashboard do frentista: vendas do mês + meta ────────────────────────
  const monthStart = React.useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  }, []);
  const today = new Date().toISOString().slice(0, 10);

  const { data: monthSales = [] } = useQuery({
    queryKey: ["frentista-month-sales", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("movements")
        .select("quantity, created_at, product_id, products(sale_price)")
        .eq("type", "venda")
        .eq("user_id", user.id)
        .gte("created_at", monthStart);
      return (data ?? []) as Array<{
        quantity: number; created_at: string; product_id: string;
        products: { sale_price: number } | null;
      }>;
    },
    enabled: !!user && role === "frentista",
    refetchInterval: 5000,
  });

  const { data: goal = 0 } = useQuery({
    queryKey: ["frentista-goal", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from("employees")
        .select("monthly_goal")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.monthly_goal) return Number(data.monthly_goal);

      // Fallback para meta global se a individual for 0
      const { data: globalGoal } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "monthly_goal")
        .maybeSingle();
      return Number(globalGoal?.value ?? 0);
    },
    enabled: !!user && role === "frentista",
    refetchInterval: 30000,
  });

  const monthRevenue = monthSales.reduce(
    (s, m) => s + Number(m.products?.sale_price ?? 0) * m.quantity,
    0,
  );
  const monthUnits = monthSales.reduce((s, m) => s + m.quantity, 0);
  const todayRevenue = monthSales
    .filter((m) => m.created_at.slice(0, 10) === today)
    .reduce((s, m) => s + Number(m.products?.sale_price ?? 0) * m.quantity, 0);
  const goalPct = goal > 0 ? Math.min(100, (monthRevenue / goal) * 100) : 0;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()),
  );

  const cartItems = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => {
    const p = products.find((x) => x.id === id)!;
    return { p, qty };
  });
  const total = cartItems.reduce((s, { p, qty }) => s + Number(p.sale_price) * qty, 0);

  function add(id: string, delta: number) {
    setCart((c) => {
      const next = Math.max(0, (c[id] ?? 0) + delta);
      const product = products.find((p) => p.id === id);
      if (product && next > product.pista_qty) {
        toast.error("Estoque insuficiente na pista");
        return c;
      }
      return { ...c, [id]: next };
    });
  }

  async function finalize() {
    if (cartItems.length === 0) return;
    if (!user) return;
    const updates = cartItems.map(async ({ p, qty }) => {
      const { error: e1 } = await supabase.from("products")
        .update({ pista_qty: p.pista_qty - qty }).eq("id", p.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("movements").insert({
        product_id: p.id, type: "venda", quantity: qty, location: "pista", user_id: user.id,
      });
      if (e2) throw e2;
    });
    try {
      await Promise.all(updates);
      toast.success(`Venda registrada: R$ ${total.toFixed(2)}`);
      setCart({});
      qc.invalidateQueries({ queryKey: ["products-pista"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (loading || role !== "frentista") {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-1 w-32 overflow-hidden rounded-full bg-card"><div className="h-full w-1/2 shimmer" /></div>
      </div>
    );
  }

  const displayName = (user?.user_metadata?.name as string) ?? user?.email;

  const CartPanel = (
    <>
      <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-4">
        <ShoppingCart size={18} className="text-accent" />
        <div className="font-semibold">Venda atual</div>
        <div className="ml-auto text-xs text-muted-foreground">{cartItems.length} itens</div>
      </div>
      <div className="flex-1 space-y-2 overflow-auto">
        {cartItems.map(({ p, qty }) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border/40 p-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">R$ {Number(p.sale_price).toFixed(2)} · {qty}x</div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => add(p.id, -1)}><Minus size={12} /></Button>
              <div className="w-6 text-center text-sm font-bold">{qty}</div>
              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => add(p.id, +1)}><Plus size={12} /></Button>
            </div>
          </div>
        ))}
        {cartItems.length === 0 && (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Toque em um produto para adicionar</div>
        )}
      </div>
      <div className="mt-4 border-t border-border/40 pt-4">
        <div className="mb-3 flex items-baseline justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
          <div className="text-3xl font-bold text-accent">R$ {total.toFixed(2)}</div>
        </div>
        <Button
          disabled={cartItems.length === 0}
          onClick={async () => { await finalize(); setCartOpen(false); }}
          className="h-12 w-full text-base font-semibold"
          style={{ background: "var(--gradient-accent)", color: "oklch(0.18 0.04 255)" }}
        >
          Finalizar venda
        </Button>
        {cartItems.length > 0 && (
          <Button variant="ghost" className="mt-2 w-full" onClick={() => setCart({})}>Cancelar</Button>
        )}
      </div>
    </>
  );

  const totalCount = cartItems.reduce((s, { qty }) => s + qty, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-border/50 bg-background/70 px-3 backdrop-blur-xl sm:h-[72px] sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <BuritiLogo size="sm" />
          <div className="hidden md:block">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Modo Operador</div>
            <div className="truncate text-sm font-semibold">{displayName}</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/login" }); }}>
          <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
        </Button>
      </header>

      {/* Dashboard rápido do frentista */}
      <section className="px-3 pt-3 sm:px-6 sm:pt-6">
        <div className="glass rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Olá, {displayName?.toString().split(" ")[0] ?? "frentista"} 👋
              </div>
              <div className="text-base font-semibold sm:text-lg">Suas vendas do mês</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Meta mensal</div>
              <div className="text-sm font-semibold">
                {goal > 0 ? `R$ ${goal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <MiniStat icon={DollarSign} label="Mês" value={`R$ ${monthRevenue.toFixed(0)}`} tone="accent" />
            <MiniStat icon={TrendingUp} label="Hoje" value={`R$ ${todayRevenue.toFixed(0)}`} tone="primary" />
            <MiniStat icon={ShoppingCart} label="Unid." value={String(monthUnits)} tone="muted" />
          </div>

          {goal > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Target size={12} /> Progresso da meta
                </span>
                <span className="font-semibold text-accent">{goalPct.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-card/80">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${goalPct}%`,
                    background: goalPct >= 100 ? "oklch(0.78 0.18 155)" : "var(--gradient-accent)",
                  }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                <span>R$ 0</span>
                <span>R$ {goal.toLocaleString("pt-BR")}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid flex-1 gap-4 p-3 pb-24 sm:p-6 sm:pb-24 lg:grid-cols-[1fr_400px] lg:pb-6">
        {/* Catálogo */}
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const low = p.pista_qty < p.pista_min;
              const inCart = cart[p.id] ?? 0;
              return (
                <button
                  key={p.id} onClick={() => add(p.id, 1)}
                  className={`group glass flex flex-col rounded-2xl p-4 text-left transition hover:scale-[1.02] hover:shadow-glow-accent ${inCart ? "ring-2 ring-accent" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.category ?? "Geral"}</div>
                    {low && <AlertTriangle size={12} className="text-destructive" />}
                  </div>
                  <div className="mt-2 font-semibold leading-tight">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.brand ?? "—"}</div>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="text-xl font-bold text-accent sm:text-2xl">R$ {Number(p.sale_price).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{p.pista_qty} disp.</div>
                  </div>
                  {inCart > 0 && (
                    <div className="mt-2 rounded-lg bg-accent/15 px-2 py-1 text-center text-xs font-bold text-accent">
                      {inCart} no carrinho
                    </div>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="glass col-span-full rounded-2xl p-12 text-center text-sm text-muted-foreground">
                Nenhum produto disponível na pista.
              </div>
            )}
          </div>
        </div>

        {/* Carrinho desktop */}
        <aside className="glass sticky top-[88px] hidden h-[calc(100vh-104px)] flex-col rounded-2xl p-5 lg:flex">
          {CartPanel}
        </aside>
      </div>

      {/* Carrinho mobile: FAB + bottom sheet */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-4 left-3 right-3 z-20 flex items-center justify-between rounded-2xl px-5 py-4 text-base font-semibold shadow-glow-accent lg:hidden"
        style={{ background: "var(--gradient-accent)", color: "oklch(0.18 0.04 255)" }}
      >
        <span className="flex items-center gap-2">
          <ShoppingCart size={18} />
          {totalCount > 0 ? `${totalCount} ${totalCount === 1 ? "item" : "itens"}` : "Carrinho vazio"}
        </span>
        <span className="text-lg font-bold">R$ {total.toFixed(2)}</span>
      </button>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="flex h-[85vh] flex-col rounded-t-2xl p-5">
          <SheetTitle className="sr-only">Carrinho</SheetTitle>
          {CartPanel}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MiniStat({
  icon: Icon, label, value, tone,
}: {
  icon: React.ElementType; label: string; value: string;
  tone: "accent" | "primary" | "muted";
}) {
  const toneClass =
    tone === "accent" ? "text-accent" : tone === "primary" ? "text-primary" : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-2.5 sm:p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon size={11} className={toneClass} /> {label}
      </div>
      <div className="mt-1 truncate text-base font-bold sm:text-lg">{value}</div>
    </div>
  );
}