import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Minus, Package2, AlertTriangle, Package, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/buriti/PageHeader";
import { Stat } from "@/components/buriti/Stat";
import { cn } from "@/lib/utils";
import { useProducts, type Product } from "@/hooks/use-products";

export const Route = createFileRoute("/_authenticated/pista")({ component: PistaPage });

const PistaRow = React.memo(({ 
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
  const low = (p.pista_qty || 0) < (p.pista_min || 0);
  return (
    <tr className="group transition-colors hover:bg-white/[0.02]">
      <td className="px-6 py-5">
        <div className="font-bold tracking-tight text-foreground">{p.name}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
          {p.brand || "—"}
        </div>
      </td>
      <td className={cn("px-6 py-5 text-right font-black text-lg tabular-nums transition-colors", low ? "text-destructive" : "text-primary")}>
        {p.pista_qty || 0}
      </td>
      <td className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-widest text-muted-foreground/30 tabular-nums">
        {p.pista_min || 0}
      </td>
      <td className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-widest text-muted-foreground/20 italic tabular-nums">
        {p.estoque_qty || 0}
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center justify-center gap-3">
          <Input
            type="number" 
            value={value || ""} 
            min={0}
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

PistaRow.displayName = "PistaRow";

function PistaPage() {
  const [search, setSearch] = React.useState("");
  const [qtyMap, setQtyMap] = React.useState<Record<string, number>>({});
  const { data: products = [], moveStock, isLoading } = useProducts();

  const filtered = React.useMemo(() => {
    const s = search.toLowerCase();
    return products.filter((p) =>
      p.category !== "Combustíveis" &&
      (p.name.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s))
    );
  }, [products, search]);

  const handleMove = React.useCallback(async (p: Product, delta: number, type: "entrada" | "ajuste") => {
    try {
      await moveStock({ productId: p.id, delta, location: "pista", type });
      setQtyMap((m) => ({ ...m, [p.id]: 0 }));
    } catch (e) {
      // Error handled by mutation
    }
  }, [moveStock]);

  const stats = React.useMemo(() => {
    const totalItems = filtered.length;
    const lowCount = filtered.filter((p) => (p.pista_qty || 0) < (p.pista_min || 0)).length;
    return { totalItems, lowCount };
  }, [filtered]);

  return (
    <div className="space-y-[clamp(1rem,3vw,1.5rem)] pb-20 md:pb-0">
      <PageHeader 
        title="Estoque na Pista" 
        description="Controle de produtos disponíveis para venda imediata" 
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Itens na Pista" value={stats.totalItems.toString()} icon={Package2} />
        <Stat label="Abaixo do Mínimo" value={stats.lowCount.toString()} icon={AlertTriangle} highlight={stats.lowCount > 0} />
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" size={18} />
        <Input 
          placeholder="Buscar produto na pista..." 
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
          <div className="hidden md:block premium-card overflow-hidden border-white/5 bg-card/30">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.02] text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5 text-left">Produto</th>
                    <th className="px-6 py-5 text-right">Na Pista</th>
                    <th className="px-6 py-5 text-right">Mínimo</th>
                    <th className="px-6 py-5 text-right">Depósito</th>
                    <th className="px-6 py-5 text-center">Movimentação Rápida</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filtered.map((p) => (
                    <PistaRow 
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
          <div className="grid gap-4 md:hidden">
            {filtered.map((p) => {
              const low = (p.pista_qty || 0) < (p.pista_min || 0);
              const v = qtyMap[p.id] ?? 0;
              return (
                <div key={p.id} className="premium-card p-5 space-y-5 border-white/5 active:scale-[0.98] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-lg leading-tight truncate">{p.name}</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1.5">
                        {p.brand || "SEM MARCA"}
                      </div>
                    </div>
                    <div className={cn("shrink-0 text-2xl font-black px-4 py-2 rounded-2xl bg-white/5 border border-white/5 transition-colors", low ? "text-destructive border-destructive/20" : "text-primary border-primary/20")}>
                      {p.pista_qty || 0}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2 italic">Metas & Depósito</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground/30 uppercase">Mínimo</span>
                          <span className="text-foreground">{p.pista_min || 0} un</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground/30 uppercase">Depósito</span>
                          <span className="text-muted-foreground">{p.estoque_qty || 0} un</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Quantidade</label>
                      <Input
                        type="number" 
                        placeholder="0"
                        value={v || ""} 
                        min={0}
                        onChange={(e) => setQtyMap({ ...qtyMap, [p.id]: Number(e.target.value) })}
                        className="h-12 text-center font-black bg-white/5 border-white/5 focus:bg-white/10 rounded-2xl text-lg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.1em] text-xs shadow-glow active:scale-95 transition-all disabled:opacity-20"
                      disabled={!v} 
                      onClick={() => handleMove(p, v, "entrada")}
                    >
                      <Plus size={18} strokeWidth={3} className="mr-2" /> Entrada
                    </Button>
                    <Button 
                      className="flex-1 h-14 rounded-2xl bg-destructive text-destructive-foreground font-black uppercase tracking-[0.1em] text-xs shadow-glow-destructive active:scale-95 transition-all disabled:opacity-20"
                      disabled={!v} 
                      onClick={() => handleMove(p, -v, "ajuste")}
                    >
                      <Minus size={18} strokeWidth={3} className="mr-2" /> Ajuste
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
