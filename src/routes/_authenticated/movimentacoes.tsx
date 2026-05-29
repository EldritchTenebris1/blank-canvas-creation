import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, ShoppingCart, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/buriti/PageHeader";
import { listSystemUsersFn } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/movimentacoes")({ component: MovimentacoesPage });

type Movement = {
  id: string; created_at: string; type: "venda" | "entrada" | "ajuste" | "reposicao";
  quantity: number; location: string; notes: string | null;
  product_id: string; user_id: string | null;
};
type Product = { id: string; name: string; brand: string | null };

const TYPE_META = {
  venda: { label: "Venda", icon: ShoppingCart, color: "text-accent" },
  entrada: { label: "Entrada", icon: ArrowDownToLine, color: "text-emerald-400" },
  ajuste: { label: "Ajuste", icon: ArrowUpFromLine, color: "text-destructive" },
  reposicao: { label: "Reposição", icon: RefreshCw, color: "text-blue-400" },
} as const;

function MovimentacoesPage() {
  const [filter, setFilter] = React.useState<string>("todos");
  const listUsers = useServerFn(listSystemUsersFn);

  const { data: movements = [] } = useQuery({
    queryKey: ["movements"],
    queryFn: async () =>
      ((await supabase.from("movements").select("*").order("created_at", { ascending: false }).limit(300)).data ?? []) as Movement[],
    refetchInterval: 5000,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products-min"],
    queryFn: async () =>
      ((await supabase.from("products").select("id,name,brand")).data ?? []) as Product[],
  });
  const { data: users = {} } = useQuery({
    queryKey: ["system-users"],
    queryFn: () => listUsers({}),
    refetchInterval: 30000,
  });

  const productMap = React.useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const filtered = movements.filter((m) => filter === "todos" || m.type === filter);

  return (
    <div>
      <PageHeader title="Movimentações" description="Histórico completo de entradas, saídas e vendas" />
      <div className="mb-6 flex flex-wrap gap-2 premium-glass p-2 rounded-2xl border-white/5">
        {(["todos", "venda", "entrada", "ajuste", "reposicao"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              filter === t
                ? "bg-accent text-accent-foreground shadow-glow-accent scale-105"
                : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/5"
            }`}
          >
            {t === "todos" ? "Todos" : TYPE_META[t].label}
          </button>
        ))}
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-right">Quantidade</th>
              <th className="px-4 py-3 text-left">Local</th>
              <th className="px-4 py-3 text-left">Responsável</th>
              <th className="px-4 py-3 text-right">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const meta = TYPE_META[m.type];
              const Icon = meta.icon;
              const product = productMap[m.product_id];
              const author = m.user_id ? users[m.user_id] : null;
              return (
                <tr key={m.id} className="border-t border-border/40 hover:bg-card/30">
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-2 ${meta.color}`}>
                      <Icon size={14} /> <span className="font-medium">{meta.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{product?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{product?.brand ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{m.quantity}</td>
                  <td className="px-4 py-3 text-xs uppercase text-muted-foreground">{m.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <UserCircle size={14} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">{author?.name ?? "Sistema"}</div>
                        {author?.role && (
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {author.role === "admin" ? "Administrador" : "Frentista"}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Sem movimentações.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}