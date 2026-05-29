import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, Package2, AlertTriangle, Search, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/buriti/PageHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/estoque")({ component: EstoquePage });

type Product = {
  id: string; name: string; brand: string | null; category: string | null;
  estoque_qty: number; estoque_min: number; pista_qty: number; cost_price: number; sale_price: number;
};

function EstoquePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [qtyMap, setQtyMap] = React.useState<Record<string, number>>({});

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () =>
      ((await supabase.from("products").select("*").order("name")).data ?? []) as Product[],
    refetchInterval: 5000,
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  async function move(p: Product, delta: number, type: "entrada" | "ajuste") {
    const newQty = p.estoque_qty + delta;
    if (newQty < 0) return toast.error("Estoque insuficiente");
    const { error } = await supabase
      .from("products")
      .update({ estoque_qty: newQty })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    await supabase.from("movements").insert({
      product_id: p.id, type, quantity: Math.abs(delta), location: "estoque", user_id: user?.id,
    });
    toast.success(type === "entrada" ? "Entrada registrada" : "Ajuste registrado");
    qc.invalidateQueries({ queryKey: ["products"] });
    setQtyMap((m) => ({ ...m, [p.id]: 0 }));
  }

  const totalValue = products.reduce(
    (s, p) => s + Number(p.cost_price) * (p.estoque_qty + p.pista_qty), 0,
  );
  const lowCount = products.filter((p) => p.estoque_qty < p.estoque_min).length;

  return (
    <div className="space-y-[clamp(1rem,3vw,1.5rem)] pb-20 md:pb-0">
      <PageHeader title="Estoque" description="Controle do depósito interno" />
      
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Itens cadastrados" value={products.length.toString()} icon={Package2} />
        <Stat label="Valor em estoque" value={`R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
        <Stat label="Abaixo do mínimo" value={lowCount.toString()} highlight={lowCount > 0} icon={AlertTriangle} />
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" size={18} />
        <Input 
          placeholder="Buscar produto no estoque..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-11 h-12 md:h-11 bg-card/50 border-border/40 focus:bg-card transition-all" 
        />
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block glass overflow-hidden rounded-2xl border-none shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/40 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70">
              <tr>
                <th className="px-6 py-4 text-left">Produto</th>
                <th className="px-6 py-4 text-right">Estoque</th>
                <th className="px-6 py-4 text-right">Mínimo</th>
                <th className="px-6 py-4 text-right">Pista</th>
                <th className="px-6 py-4 text-center">Ajuste</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filtered.map((p) => {
                const low = p.estoque_qty < p.estoque_min;
                const v = qtyMap[p.id] ?? 0;
                return (
                  <tr key={p.id} className="transition-colors hover:bg-card/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60">
                        {p.brand || "—"}
                      </div>
                    </td>
                    <td className={cn("px-6 py-4 text-right text-lg font-black", low ? "text-destructive" : "text-accent")}>
                      {p.estoque_qty}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground/60 font-medium">{p.estoque_min}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground/40 italic">{p.pista_qty}</td>
                    <td className="px-6 py-4">
                      <Input
                        type="number" value={v || ""} min={0}
                        onChange={(e) => setQtyMap({ ...qtyMap, [p.id]: Number(e.target.value) })}
                        className="mx-auto h-10 w-24 text-center font-bold glass border-none focus-visible:ring-1 focus-visible:ring-accent"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-10 bg-accent/5 hover:bg-accent/10 border-accent/20 text-accent font-bold px-4"
                          disabled={!v} 
                          onClick={() => move(p, v, "entrada")}
                        >
                          <Plus size={16} className="mr-1" /> Entrada
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-10 hover:bg-destructive/10 border-destructive/20 text-destructive font-bold px-4"
                          disabled={!v} 
                          onClick={() => move(p, -v, "ajuste")}
                        >
                          <Minus size={16} className="mr-1" /> Saída
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((p) => {
          const low = p.estoque_qty < p.estoque_min;
          const v = qtyMap[p.id] ?? 0;
          return (
            <div key={p.id} className="glass rounded-2xl p-4 space-y-4 border-none shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold text-base leading-tight truncate">{p.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                    {p.brand || "S/M"}
                  </div>
                </div>
                <div className={cn("shrink-0 text-xl font-black px-3 py-1 rounded-xl bg-card/50", low ? "text-destructive" : "text-accent")}>
                  {p.estoque_qty}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-muted-foreground/70">Mínimo: {p.estoque_min}</span>
                  <span className="text-[9px] font-black uppercase text-muted-foreground/50">Na Pista: {p.pista_qty}</span>
                </div>
                <div className="flex justify-end">
                  <Input
                    type="number" 
                    placeholder="Qtd"
                    value={v || ""} 
                    min={0}
                    onChange={(e) => setQtyMap({ ...qtyMap, [p.id]: Number(e.target.value) })}
                    className="h-11 w-24 text-center font-bold bg-accent/5 border-accent/20"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 h-12 rounded-xl bg-accent text-[oklch(0.18_0.04_255)] font-black shadow-glow-accent active:scale-[0.98] transition-transform disabled:opacity-30"
                  disabled={!v} 
                  onClick={() => move(p, v, "entrada")}
                >
                  <Plus size={20} className="mr-1" /> Entrada
                </Button>
                <Button 
                  className="flex-1 h-12 rounded-xl bg-destructive text-white font-black shadow-glow-destructive active:scale-[0.98] transition-transform disabled:opacity-30"
                  disabled={!v} 
                  onClick={() => move(p, -v, "ajuste")}
                >
                  <Minus size={20} className="mr-1" /> Saída
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground border-none">
          <Package className="mx-auto mb-2 opacity-20" size={48} />
          <p>Nenhum produto encontrado.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, highlight }: { label: string; value: string; icon?: React.ElementType; highlight?: boolean }) {
  return (
    <div className={cn(
      "glass rounded-2xl p-5 border-none shadow-sm transition-all",
      highlight && "bg-destructive/5 ring-1 ring-destructive/20"
    )}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{label}</div>
        {Icon && <Icon size={18} className={highlight ? "text-destructive" : "text-accent"} />}
      </div>
      <div className={cn(
        "mt-2 text-[clamp(1.5rem,4vw,2rem)] font-black tracking-tighter leading-none",
        highlight ? "text-destructive" : "text-slate-800"
      )}>{value}</div>
    </div>
  );
}
