import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "@tanstack/react-router";

import { ArrowUpRight, ArrowDownLeft, RefreshCcw, Package, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/hooks/use-products";
import { motion } from "framer-motion";

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
  const navigate = useNavigate();
  const getProduct = (id: string) => products.find(p => p.id === id);


  const getTypeConfig = (type: string) => {
    switch (type) {
      case "venda":
        return { icon: ArrowUpRight, color: "text-success", bg: "bg-success/10", border: "border-success/20", label: "Venda" };
      case "entrada":
        return { icon: ArrowDownLeft, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Entrada" };
      case "saida":
        return { icon: ArrowUpRight, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20", label: "Saída" };
      default:
        return { icon: RefreshCcw, color: "text-muted-foreground/40", bg: "bg-white/5", border: "border-white/10", label: "Ajuste" };
    }
  };

  const recentItems = movements.slice(0, 8);

  return (
    <div className="premium-card p-1 border-white/5 h-full bg-card/30 flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-glow group-hover:rotate-6 transition-transform">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-accent leading-none mb-1.5">Fluxo Operacional</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
              <Clock size={10} />
              Tempo Real
            </div>
          </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_oklch(var(--success))]" />
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[600px] scrollbar-hide">
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-3xl bg-white/5 mb-4 text-muted-foreground/10">
              <Package size={48} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">Aguardando Movimentação</p>
          </div>
        ) : (
          recentItems.map((m, idx) => {
            const product = getProduct(m.product_id);
            const config = getTypeConfig(m.type);
            const Icon = config.icon;

            return (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5 mx-2"
              >
                <div className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110", 
                  config.bg, 
                  config.color,
                  config.border
                )}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-black text-sm truncate leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {product?.name ?? "Item não identificado"}
                    </p>
                    <span className="text-[10px] font-black text-muted-foreground/20 tabular-nums uppercase">
                      {format(new Date(m.created_at), "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border", config.bg, config.color, config.border)}>
                      {config.label}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
                      {m.quantity.toLocaleString('pt-BR')} {m.quantity === 1 ? 'UN' : 'UNS'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {recentItems.length > 0 && (
        <div className="p-4 mt-auto border-t border-white/5">
          <button 
            onClick={() => navigate({ to: "/movimentacoes" })}
            className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 hover:text-primary transition-all shadow-inner"
          >
            Auditoria Completa
          </button>

        </div>
      )}
    </div>
  );
}
