import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, Package2, AlertTriangle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/buriti/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pista")({ component: PistaPage });

type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: { name: string } | null;
  estoque_qty: number;
  pista_qty: number;
  pista_min: number;
};

function PistaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [qtyMap, setQtyMap] = React.useState<Record<string, number>>({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("name");
      return (data ?? []) as any[];
    },
    refetchInterval: 5000,
  });

  const filtered = products.filter((p) =>
    p.category?.name !== "Combustíveis" &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()))
  );

  async function move(p: any, delta: number, type: "entrada" | "ajuste") {
    const newQty = (p.pista_qty || 0) + delta;
    if (newQty < 0) return toast.error("Quantidade na pista não pode ser negativa");
    
    const { error } = await supabase
      .from("products")
      .update({ pista_qty: newQty })
      .eq("id", p.id);
    
    if (error) return toast.error(error.message);

    await supabase.from("movements").insert({
      product_id: p.id,
      type,
      quantity: Math.abs(delta),
      location: "pista",
      user_id: user?.id,
    });

    toast.success(`${type === "entrada" ? "Adicionado" : "Removido"} da pista: ${p.name}`);
    qc.invalidateQueries({ queryKey: ["products"] });
    setQtyMap((m) => ({ ...m, [p.id]: 0 }));
  }

  const lowCount = filtered.filter((p) => (p.pista_qty || 0) < (p.pista_min || 0)).length;
  const totalItems = filtered.length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Estoque na Pista" 
        description="Controle de produtos disponíveis para venda imediata" 
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Itens na Pista" value={totalItems.toString()} icon={Package2} />
        <Stat label="Abaixo do Mínimo" value={lowCount.toString()} icon={AlertTriangle} highlight={lowCount > 0} />
      </div>

      <div className="mb-4">
        <Input 
          placeholder="Buscar produto na pista..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-md h-11" 
        />
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-right">Na Pista</th>
              <th className="px-4 py-3 text-right">Mínimo</th>
              <th className="px-4 py-3 text-right">Depósito</th>
              <th className="px-4 py-3 text-center">Ajuste</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const low = (p.pista_qty || 0) < (p.pista_min || 0);
              const v = qtyMap[p.id] ?? 0;
              return (
                <tr key={p.id} className="border-t border-border/40 hover:bg-card/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.name}</div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                      {p.brand || "—"}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold text-lg ${low ? "text-destructive" : "text-accent"}`}>
                    {p.pista_qty || 0}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground font-medium">
                    {p.pista_min || 0}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground/60">
                    {p.estoque_qty || 0}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number" 
                      value={v || ""} 
                      min={0}
                      onChange={(e) => setQtyMap({ ...qtyMap, [p.id]: Number(e.target.value) })}
                      className="mx-auto h-9 w-24 text-center glass border-none focus-visible:ring-1 focus-visible:ring-accent"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-accent/5 hover:bg-accent/10 border-accent/20 text-accent"
                        disabled={!v} 
                        onClick={() => move(p, v, "entrada")}
                      >
                        <Plus size={14} className="mr-1" /> Adicionar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="hover:bg-destructive/10 border-destructive/20 text-destructive"
                        disabled={!v} 
                        onClick={() => move(p, -v, "ajuste")}
                      >
                        <Minus size={14} className="mr-1" /> Remover
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  <Package className="mx-auto mb-2 opacity-20" size={32} />
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, highlight }: { label: string; value: string; icon?: React.ElementType; highlight?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-5 border-none shadow-sm ${highlight ? "bg-destructive/5 ring-1 ring-destructive/20" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && <Icon size={16} className={highlight ? "text-destructive" : "text-accent"} />}
      </div>
      <div className={`mt-2 text-2xl font-black tracking-tight ${highlight ? "text-destructive" : "text-slate-800"}`}>{value}</div>
    </div>
  );
}