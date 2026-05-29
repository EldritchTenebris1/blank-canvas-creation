import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, Package2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/buriti/PageHeader";
import { toast } from "sonner";

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
    <div>
      <PageHeader title="Estoque" description="Controle do depósito interno" />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Itens cadastrados" value={products.length.toString()} icon={Package2} />
        <Stat label="Valor em estoque" value={`R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
        <Stat label="Abaixo do mínimo" value={lowCount.toString()} highlight={lowCount > 0} />
      </div>
      <div className="mb-4">
        <Input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
      </div>
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-right">Estoque</th>
              <th className="px-4 py-3 text-right">Mínimo</th>
              <th className="px-4 py-3 text-right">Pista</th>
              <th className="px-4 py-3 text-center">Ajuste</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const low = p.estoque_qty < p.estoque_min;
              const v = qtyMap[p.id] ?? 0;
              return (
                <tr key={p.id} className="border-t border-border/40 hover:bg-card/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand ?? "—"}</div>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${low ? "text-destructive" : "text-accent"}`}>
                    {low && <AlertTriangle size={12} className="mr-1 inline" />}
                    {p.estoque_qty}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.estoque_min}</td>
                  <td className="px-4 py-3 text-right">{p.pista_qty}</td>
                  <td className="px-4 py-3">
                    <Input
                      type="number" value={v || ""} min={0}
                      onChange={(e) => setQtyMap({ ...qtyMap, [p.id]: Number(e.target.value) })}
                      className="mx-auto h-9 w-24 text-center"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" disabled={!v} onClick={() => move(p, v, "entrada")}>
                        <Plus size={14} /> Entrada
                      </Button>
                      <Button size="sm" variant="outline" disabled={!v} onClick={() => move(p, -v, "ajuste")}>
                        <Minus size={14} /> Saída
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhum produto.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, highlight }: { label: string; value: string; icon?: React.ElementType; highlight?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-5 ${highlight ? "ring-1 ring-destructive/40" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && <Icon size={16} className="text-accent" />}
      </div>
      <div className={`mt-2 text-2xl font-bold ${highlight ? "text-destructive" : ""}`}>{value}</div>
    </div>
  );
}
