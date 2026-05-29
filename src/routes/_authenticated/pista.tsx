import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/buriti/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pista")({ component: PistaPage });

function PistaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await supabase.from("products").select("*").order("name")).data ?? [],
    refetchInterval: 5000,
  });

  async function reabastecer(p: typeof products[number], qty: number) {
    if (p.estoque_qty < qty) return toast.error("Estoque insuficiente");
    const { error } = await supabase.from("products").update({
      pista_qty: p.pista_qty + qty,
      estoque_qty: p.estoque_qty - qty,
    }).eq("id", p.id);
    if (error) return toast.error(error.message);
    await supabase.from("movements").insert({ product_id: p.id, type: "reposicao", quantity: qty, location: "pista", user_id: user?.id });
    toast.success(`+${qty} para a pista`);
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div>
      <PageHeader title="Pista" description="Produtos disponíveis para venda imediata" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const low = p.pista_qty < p.pista_min;
          return (
            <div key={p.id} className={`glass rounded-2xl p-5 ${low ? "ring-1 ring-destructive/40" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.brand ?? "—"}</div>
                </div>
                {low && <AlertTriangle size={16} className="text-destructive" />}
              </div>
              <div className="my-4 flex items-end justify-between">
                <div>
                  <div className={`text-4xl font-bold ${low ? "text-destructive" : "text-accent"}`}>{p.pista_qty}</div>
                  <div className="text-xs text-muted-foreground">mín. {p.pista_min} · estoque: {p.estoque_qty}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-muted-foreground">Venda</div>
                  <div className="font-semibold">R$ {Number(p.sale_price).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {[5, 10, 20].map((q) => (
                  <Button key={q} size="sm" variant="outline" className="flex-1" onClick={() => reabastecer(p, q)}>
                    <ArrowDown size={12} /> +{q}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="glass col-span-full rounded-2xl p-8 text-center text-sm text-muted-foreground">Cadastre produtos para visualizar a pista.</div>
        )}
      </div>
    </div>
  );
}