import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Minus, Package2, AlertTriangle, Search, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/buriti/PageHeader";
import { Stat } from "@/components/buriti/Stat";
import { cn } from "@/lib/utils";
import { useProducts, type Product } from "@/hooks/use-products";

export const Route = createFileRoute("/_authenticated/estoque")({ component: EstoquePage });

const EstoqueRow = React.memo(({ 
  p, 
  value, 
  onChange, 
  onMove 
}: { 
  p: Product; 
  value: number; 
  onChange: (val: number) => void; 
  onMove: (delta: number, type: "entrada" | "ajuste") => void 
}) => {
  const low = p.estoque_qty < p.estoque_min;
  return (
    <tr className="group transition-colors hover:bg-white/[0.02]">
      <td className="px-6 py-5">
        <div className="font-bold tracking-tight text-foreground">{p.name}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
          {p.brand || "—"}
        </div>
      </td>
      <td className={cn("px-6 py-5 text-right font-black text-lg tabular-nums transition-colors", low ? "text-destructive" : "text-primary")}>
        {p.estoque_qty}
      </td>
      <td className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-widest text-muted-foreground/30 tabular-nums">
        {p.estoque_min}
      </td>
      <td className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-widest text-muted-foreground/20 italic tabular-nums">
        {p.pista_qty}
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center justify-center gap-3">
          <Input
            type="number" value={value || ""} min={0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-10 w-24 text-center font-black bg-white/5 border-white/5 focus:bg-white/10 focus:ring-primary/20 transition-all rounded-xl"
            placeholder="Qtd"
          />
          <div className="flex gap-1">
            <Button 
              size="sm" 
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
              disabled={!value} 
              onClick={() => onMove(value, "entrada")}
            >
              <Plus size={14} strokeWidth={3} className="mr-1.5" /> Entrada
            </Button>
            <Button 
              size="sm" 
              className="h-10 px-4 rounded-xl bg-destructive text-destructive-foreground font-black uppercase text-[10px] tracking-widest shadow-glow-destructive hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
              disabled={!value} 
              onClick={() => onMove(-value, "ajuste")}
            >
              <Minus size={14} strokeWidth={3} className="mr-1.5" /> Ajuste
            </Button>
          </div>
        </div>
      </td>
    </tr>
  );
});

EstoqueRow.displayName = "EstoqueRow";

function EstoquePage() {
  const [search, setSearch] = React.useState("");
  const [qtyMap, setQtyMap] = React.useState<Record<string, number>>({});
  const { data: products = [], moveStock, isLoading } = useProducts();

  const filtered = React.useMemo(() => {
    const s = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(s));
  }, [products, search]);

  const handleMove = React.useCallback(async (p: Product, delta: number, type: "entrada" | "ajuste") => {
    try {
      await moveStock({ productId: p.id, delta, location: "estoque", type });
      setQtyMap((m) => ({ ...m, [p.id]: 0 }));
    } catch (e) {
      // Error handled by mutation
    }
  }, [moveStock]);

  const stats = React.useMemo(() => {
    const totalValue = products.reduce(
      (s, p) => s + Number(p.cost_price || 0) * (p.estoque_qty + p.pista_qty), 0,
    );
    const lowCount = products.filter((p) => p.estoque_qty < p.estoque_min).length;
    return {
      totalItems: products.length,
      totalValue,
      lowCount,
    };
  }, [products]);

  return (
    <div className="space-y-[clamp(1rem,3vw,1.5rem)] pb-20 md:pb-0">
      <PageHeader title="Estoque" description="Controle do depósito interno" />
      
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Itens cadastrados" value={stats.totalItems.toString()} icon={Package2} />
        <Stat label="Valor em estoque" value={`R$ ${stats.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
        <Stat label="Abaixo do mínimo" value={stats.lowCount.toString()} highlight={stats.lowCount > 0} icon={AlertTriangle} />
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

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : (
        <>
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
                  {filtered.map((p) => (
                    <EstoqueRow 
                      key={p.id} 
                      p={p} 
                      value={qtyMap[p.id] || 0} 
                      onChange={(val) => setQtyMap(prev => ({ ...prev, [p.id]: val }))}
                      onMove={(delta, type) => handleMove(p, delta, type)}
                    />
                  ))}
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
                      onClick={() => handleMove(p, v, "entrada")}
                    >
                      <Plus size={20} className="mr-1" /> Entrada
                    </Button>
                    <Button 
                      className="flex-1 h-12 rounded-xl bg-destructive text-white font-black shadow-glow-destructive active:scale-[0.98] transition-transform disabled:opacity-30"
                      disabled={!v} 
                      onClick={() => handleMove(p, -v, "ajuste")}
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
        </>
      )}
    </div>
  );
}
