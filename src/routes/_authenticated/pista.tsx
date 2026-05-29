import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search, Plus, Minus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/buriti/PageHeader";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_authenticated/pista")({ component: PistaPage });

function PistaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("name");
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  async function updateQuantity(p: any, delta: number) {
    const newQty = Math.max(0, (p.pista_qty || 0) + delta);
    
    const { error } = await supabase
      .from("products")
      .update({ pista_qty: newQty })
      .eq("id", p.id);

    if (error) return toast.error(error.message);

    toast.success(`${p.name}: ${newQty} na pista`);
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  const filteredProducts = products.filter(p => 
    p.category?.name !== "Combustíveis" && 
    (p.name.toLowerCase().includes(search.toLowerCase()) || 
     p.brand?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Estoque na Pista" 
        description="Gerencie a quantidade de produtos disponíveis para venda imediata" 
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder="Buscar produto na pista..." 
          className="pl-10 glass border-none h-12 text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((p) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={p.id} 
              className="glass rounded-2xl p-5 border-none shadow-sm hover:shadow-md transition-all group"
            >
              <div className="mb-4">
                <div className="font-bold text-slate-800 line-clamp-1">{p.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  {p.brand || "Geral"}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-accent tracking-tighter">
                    {p.pista_qty || 0}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Na Pista</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-10 w-10 rounded-xl bg-white/50 hover:bg-white shadow-none"
                    onClick={() => updateQuantity(p, -1)}
                  >
                    <Minus size={18} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-10 w-10 rounded-xl bg-accent text-white hover:bg-accent/90 shadow-sm"
                    onClick={() => updateQuantity(p, 1)}
                  >
                    <Plus size={18} />
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                <span>Depósito: {p.estoque_qty || 0}</span>
                <span className={p.pista_qty < (p.pista_min || 0) ? "text-destructive" : ""}>
                  Mín: {p.pista_min || 0}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isLoading && filteredProducts.length === 0 && (
        <div className="glass py-20 text-center rounded-2xl border-dashed border-2">
          <Package className="mx-auto mb-4 text-muted-foreground/30" size={48} />
          <p className="text-muted-foreground font-medium">Nenhum produto encontrado na pista.</p>
        </div>
      )}
    </div>
  );
}
