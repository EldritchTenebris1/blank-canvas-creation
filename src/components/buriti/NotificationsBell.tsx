import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, AlertTriangle, ShoppingCart, ArrowDownToLine, RefreshCw, ArrowUpFromLine } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

type Movement = {
  id: string; type: "venda" | "entrada" | "ajuste" | "reposicao";
  quantity: number; created_at: string; product_id: string;
};
type Product = { id: string; name: string; pista_qty: number; pista_min: number; estoque_qty: number; estoque_min: number };

const ICONS = {
  venda: ShoppingCart, entrada: ArrowDownToLine, ajuste: ArrowUpFromLine, reposicao: RefreshCw,
} as const;
const LABELS = { venda: "Venda", entrada: "Entrada", ajuste: "Ajuste", reposicao: "Reposição" } as const;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NotificationsBell() {
  const { data: products = [] } = useQuery({
    queryKey: ["notif-products"],
    queryFn: async () =>
      ((await supabase.from("products").select("id,name,pista_qty,pista_min,estoque_qty,estoque_min")).data ?? []) as Product[],
    refetchInterval: 8000,
  });
  const { data: movements = [] } = useQuery({
    queryKey: ["notif-movements"],
    queryFn: async () =>
      ((await supabase.from("movements").select("id,type,quantity,created_at,product_id").order("created_at", { ascending: false }).limit(8)).data ?? []) as Movement[],
    refetchInterval: 8000,
  });

  const productMap = React.useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const lowPista = products.filter((p) => p.pista_qty < p.pista_min);
  const lowEstoque = products.filter((p) => p.estoque_qty < p.estoque_min);
  const totalAlerts = lowPista.length + lowEstoque.length;

  const [open, setOpen] = React.useState(false);
  const totalBadge = totalAlerts;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 shrink-0 rounded-xl border border-border/60 bg-card/50">
          <Bell size={18} />
          {totalBadge > 0 && (
            <span className="pulse-glow absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {totalBadge > 9 ? "9+" : totalBadge}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 sm:w-[380px]">
        <div className="border-b border-border/40 px-4 py-3">
          <div className="text-sm font-semibold">Notificações</div>
          <div className="text-xs text-muted-foreground">
            {totalAlerts > 0 ? `${totalAlerts} alerta${totalAlerts > 1 ? "s" : ""} de estoque` : "Tudo em ordem"}
          </div>
        </div>

        <div className="max-h-[420px] overflow-auto">
          {(lowPista.length > 0 || lowEstoque.length > 0) && (
            <div className="px-2 py-2">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">Alertas</div>
              {[...lowPista.map((p) => ({ p, where: "pista" as const })), ...lowEstoque.map((p) => ({ p, where: "estoque" as const }))]
                .slice(0, 6)
                .map(({ p, where }) => (
                  <Link
                    key={`${p.id}-${where}`}
                    to={where === "pista" ? "/pista" : "/estoque"}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-card/60"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-destructive/15 text-destructive">
                      <AlertTriangle size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {where === "pista"
                          ? `Pista: ${p.pista_qty} (mín. ${p.pista_min})`
                          : `Estoque: ${p.estoque_qty} (mín. ${p.estoque_min})`}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}

          <div className="px-2 py-2">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Atividade recente</div>
            {movements.length === 0 && (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">Sem movimentações ainda</div>
            )}
            {movements.slice(0, 6).map((m) => {
              const Icon = ICONS[m.type];
              const prod = productMap[m.product_id];
              return (
                <Link
                  key={m.id}
                  to="/movimentacoes"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-card/60"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-card/80 text-accent">
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      <span className="font-medium">{LABELS[m.type]}</span>{" "}
                      <span className="text-muted-foreground">— {prod?.name ?? "produto"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.quantity} un · {timeAgo(m.created_at)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/40 p-2">
          <Link
            to="/movimentacoes"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-center text-xs font-medium text-accent hover:bg-card/60"
          >
            Ver todas as movimentações →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}