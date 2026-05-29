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
  ajuste: { label: "Ajuste", icon: RefreshCw, color: "text-muted-foreground/50" },
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

      {/* Desktop View: Table */}
      <div className="hidden md:block premium-card overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Tipo</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Produto</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Quantidade</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Local</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Responsável</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filtered.map((m) => {
                const meta = TYPE_META[m.type];
                const Icon = meta.icon;
                const product = productMap[m.product_id];
                const author = m.user_id ? users[m.user_id] : null;
                return (
                  <tr key={m.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-current/10 bg-current/5 ${meta.color} text-[10px] font-black uppercase tracking-widest`}>
                        <Icon size={12} strokeWidth={3} /> {meta.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">{product?.name ?? "—"}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">{product?.brand ?? ""}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-black tabular-nums text-foreground">{m.quantity}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 bg-white/5 px-2 py-1 rounded-md">
                        {m.location}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/40">
                          <UserCircle size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-foreground uppercase tracking-tight">{author?.name ?? "Sistema"}</div>
                          {author?.role && (
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                              {author.role === "admin" ? "Administrador" : "Frentista"}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-[11px] font-bold tabular-nums text-muted-foreground/40">
                      {new Date(m.created_at).toLocaleString("pt-BR", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">Sem movimentações.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((m) => {
          const meta = TYPE_META[m.type];
          const Icon = meta.icon;
          const product = productMap[m.product_id];
          const author = m.user_id ? users[m.user_id] : null;
          return (
            <div key={m.id} className="premium-card border-white/5 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-current/10 bg-current/5 ${meta.color} text-[10px] font-black uppercase tracking-widest`}>
                  <Icon size={12} strokeWidth={3} /> {meta.label}
                </div>
                <span className="text-2xl font-black tabular-nums text-foreground leading-none">{m.quantity}</span>
              </div>
              <div>
                <div className="font-black text-sm tracking-tight text-foreground">{product?.name ?? "—"}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">{product?.brand ?? ""}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/40">
                    <UserCircle size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-foreground uppercase tracking-tight truncate">{author?.name ?? "Sistema"}</div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 bg-white/5 px-1.5 py-0.5 rounded-md">{m.location}</span>
                  </div>
                </div>
                <div className="text-right text-[10px] font-bold tabular-nums text-muted-foreground/40 shrink-0">
                  {new Date(m.created_at).toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="premium-card border-white/5 px-6 py-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">Sem movimentações.</div>
        )}
      </div>


    </div>
  );
}