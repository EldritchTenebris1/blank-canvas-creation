import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/hooks/use-products";

interface Movement {
  id: string;
  type: "venda" | "entrada" | "saida" | "transferencia" | "ajuste";
  quantity: number;
  product_id: string;
  created_at: string;
}

interface RecentMovementsProps {
  movements: any[];
  products: Product[];
}

export function RecentMovements({ movements, products }: RecentMovementsProps) {
  const getProduct = (id: string) => products.find(p => p.id === id);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "venda":
        return { icon: ArrowUpRight, color: "text-green-500", bg: "bg-green-500/10", label: "Venda" };
      case "entrada":
        return { icon: ArrowDownLeft, color: "text-blue-500", bg: "bg-blue-500/10", label: "Entrada" };
      case "saida":
        return { icon: ArrowUpRight, color: "text-orange-500", bg: "bg-orange-500/10", label: "Saída" };
      default:
        return { icon: RefreshCcw, color: "text-slate-400", bg: "bg-slate-400/10", label: "Ajuste" };
    }
  };

  const recentItems = movements.slice(0, 6);

  return (
    <div className="premium-card p-6 border-white/5 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Atividades Recentes</h3>
          <p className="text-[11px] text-muted-foreground/60">Últimas movimentações de estoque.</p>
        </div>
        <div className="p-2 rounded-xl bg-white/5">
          <RefreshCcw size={16} className="text-muted-foreground/40" />
        </div>
      </div>

      <div className="space-y-4">
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-20">
            <Package size={40} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">Sem movimentações</p>
          </div>
        ) : (
          recentItems.map((m) => {
            const product = getProduct(m.product_id);
            const config = getTypeConfig(m.type);
            const Icon = config.icon;

            return (
              <div key={m.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                <div className={cn("p-2 rounded-xl shrink-0", config.bg, config.color)}>
                  <Icon size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">
                      {product?.name ?? "Produto não encontrado"}
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground/40 whitespace-nowrap">
                      {format(new Date(m.created_at), "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] font-black uppercase tracking-wider", config.color)}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <span className="text-[10px] font-medium text-muted-foreground/60">
                      {m.quantity} {m.quantity === 1 ? 'unidade' : 'unidades'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {recentItems.length > 0 && (
        <button className="w-full mt-6 py-3 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all">
          Ver Histórico Completo
        </button>
      )}
    </div>
  );
}