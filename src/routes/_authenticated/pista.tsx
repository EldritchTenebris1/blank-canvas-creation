import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Minus, Package2, AlertTriangle, Package, Search, Loader2, ListOrdered, ArrowUp, ArrowDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/buriti/PageHeader";
import { Stat } from "@/components/buriti/Stat";
import { cn } from "@/lib/utils";
import { useProducts, type Product } from "@/hooks/use-products";

export const Route = createFileRoute("/_authenticated/pista")({ component: PistaPage });

const PistaRow = React.memo(({
  p,
  value,
  onChange,
  onMove,
}: {
  p: Product;
  value: number;
  onChange: (val: number) => void;
  onMove: (op: "add" | "remove") => void;
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
              onClick={() => onMove("add")}
            >
              <Plus size={14} strokeWidth={3} className="mr-1.5" /> Entrada
            </Button>
            <Button
              size="sm"
              className="h-10 px-4 rounded-xl bg-destructive text-destructive-foreground font-black uppercase text-[10px] tracking-widest shadow-glow-destructive hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
              disabled={!value}
              onClick={() => onMove("remove")}
            >
              <Minus size={14} strokeWidth={3} className="mr-1.5" /> Remover
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
  const [adjustMode, setAdjustMode] = React.useState(false);
  const [reorderMode, setReorderMode] = React.useState(false);
  const { data: products = [], adjustStock, reorder, isReordering, isLoading } = useProducts();

  const visibleProducts = React.useMemo(
    () => products.filter((p) => p.category !== "Combustíveis"),
    [products],
  );

  const filtered = React.useMemo(() => {
    const s = search.toLowerCase();
    return visibleProducts.filter(
      (p) => p.name.toLowerCase().includes(s) || p.brand?.toLowerCase().includes(s),
    );
  }, [visibleProducts, search]);

  const handleMove = React.useCallback(async (p: Product, op: "add" | "remove") => {
    const qty = qtyMap[p.id] || 0;
    if (!qty) return;
    try {
      await adjustStock({ productId: p.id, qty, location: "pista", op, linkOther: !adjustMode });
      setQtyMap((m) => ({ ...m, [p.id]: 0 }));
    } catch {
      // erro tratado na mutation
    }
  }, [adjustStock, qtyMap, adjustMode]);

  const handleMoveOrder = React.useCallback((index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= visibleProducts.length) return;
    const ids = products.map((p) => p.id);
    const a = products.indexOf(visibleProducts[index]);
    const b = products.indexOf(visibleProducts[target]);
    [ids[a], ids[b]] = [ids[b], ids[a]];
    reorder(ids);
  }, [products, visibleProducts, reorder]);

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 premium-glass rounded-2xl border-white/5 px-4 py-3">
          <Switch checked={adjustMode} onCheckedChange={setAdjustMode} id="adjust-mode" />
          <label htmlFor="adjust-mode" className="cursor-pointer">
            <div className="text-xs font-black uppercase tracking-widest text-foreground">Modo Ajuste</div>
            <div className="text-[10px] font-bold text-muted-foreground/50">
              {adjustMode ? "Altera só a pista (não mexe no estoque)" : "Entrada baixa do estoque · Remover devolve ao estoque"}
            </div>
          </label>
        </div>
        <Button
          variant={reorderMode ? "default" : "outline"}
          onClick={() => { setReorderMode((v) => !v); setSearch(""); }}
          className={cn("border-white/5", reorderMode ? "shadow-glow-primary" : "bg-white/5")}
        >
          {reorderMode ? <Check size={18} className="mr-2" /> : <ListOrdered size={18} className="mr-2" />}
          {reorderMode ? "Concluir ordem" : "Ordenar"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Itens na Pista" value={stats.totalItems.toString()} icon={Package2} />
        <Stat label="Abaixo do Mínimo" value={stats.lowCount.toString()} icon={AlertTriangle} highlight={stats.lowCount > 0} />
      </div>

      {reorderMode ? (
        <div className="space-y-2">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground leading-relaxed">
            ↕️ Use as setas para definir a sequência. Essa ordem vale em <span className="text-foreground font-medium">Pista, Estoque e Operador</span>.
          </div>
          {visibleProducts.map((p, index) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary tabular-nums">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{p.name}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{p.brand ?? "—"}</div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="icon" variant="ghost" className="h-9 w-9 bg-white/5 rounded-xl disabled:opacity-20"
                  disabled={index === 0 || isReordering} onClick={() => handleMoveOrder(index, -1)}>
                  <ArrowUp size={16} />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 bg-white/5 rounded-xl disabled:opacity-20"
                  disabled={index === visibleProducts.length - 1 || isReordering} onClick={() => handleMoveOrder(index, 1)}>
                  <ArrowDown size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {filtered.map((p) => (
                        <PistaRow
                          key={p.id}
                          p={p}
                          value={qtyMap[p.id] || 0}
                          onChange={(val) => setQtyMap((prev) => ({ ...prev, [p.id]: val }))}
                          onMove={(op) => handleMove(p, op)}
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
                          onClick={() => handleMove(p, "add")}
                        >
                          <Plus size={18} strokeWidth={3} className="mr-2" /> Entrada
                        </Button>
                        <Button
                          className="flex-1 h-14 rounded-2xl bg-destructive text-destructive-foreground font-black uppercase tracking-[0.1em] text-xs shadow-glow-destructive active:scale-95 transition-all disabled:opacity-20"
                          disabled={!v}
                          onClick={() => handleMove(p, "remove")}
                        >
                          <Minus size={18} strokeWidth={3} className="mr-2" /> Remover
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
        </>
      )}
    </div>
  );
}
