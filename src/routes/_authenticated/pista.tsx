import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, AlertTriangle, Fuel, Activity, Package, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/buriti/PageHeader";
import { FuelTankCard } from "@/components/buriti/FuelTankCard";
import { FuelPumpCard } from "@/components/buriti/FuelPumpCard";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_authenticated/pista")({ component: PistaPage });

function PistaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, category:categories(name)").order("name");
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  const { data: tanks = [], isLoading: loadingTanks } = useQuery({
    queryKey: ["fuel_tanks"],
    queryFn: async () => {
      const { data } = await supabase.from("fuel_tanks").select("*, product:products(name)");
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  const { data: pumps = [], isLoading: loadingPumps } = useQuery({
    queryKey: ["fuel_pumps"],
    queryFn: async () => {
      const { data } = await supabase.from("fuel_pumps").select("*, nozzles:pump_nozzles(*, tank:fuel_tanks(*, product:products(name)))");
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  async function reabastecer(p: any, qty: number) {
    if (p.estoque_qty < qty) return toast.error("Estoque insuficiente no depósito principal");
    
    const { error } = await supabase.from("products").update({
      pista_qty: (p.pista_qty || 0) + qty,
      estoque_qty: (p.estoque_qty || 0) - qty,
    }).eq("id", p.id);

    if (error) return toast.error(error.message);

    await supabase.from("movements").insert({ 
      product_id: p.id, 
      type: "reposicao", 
      quantity: qty, 
      location: "pista", 
      user_id: user?.id 
    });

    toast.success(`+${qty} de ${p.name} enviado para a pista`);
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  const convenienceProducts = products.filter(p => p.category?.name !== "Combustíveis");
  const fuelProducts = products.filter(p => p.category?.name === "Combustíveis");

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Operação de Pista" 
        description="Monitoramento em tempo real de bombas, tanques e conveniência" 
      />

      <Tabs defaultValue="monitoramento" className="w-full">
        <TabsList className="bg-white/40 backdrop-blur-sm p-1 rounded-xl mb-6">
          <TabsTrigger value="monitoramento" className="rounded-lg gap-2">
            <Activity size={16} /> Monitoramento
          </TabsTrigger>
          <TabsTrigger value="conveniencia" className="rounded-lg gap-2">
            <Package size={16} /> Conveniência
          </TabsTrigger>
          <TabsTrigger value="combustiveis" className="rounded-lg gap-2">
            <Fuel size={16} /> Combustíveis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoramento" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <section>
            <div className="flex items-center gap-2 mb-4 text-accent font-bold uppercase tracking-wider text-xs">
              <LayoutGrid size={14} /> Bombas de Abastecimento
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pumps.map((pump) => (
                <FuelPumpCard key={pump.id} pump={pump} />
              ))}
              {pumps.length === 0 && !loadingPumps && (
                <div className="glass col-span-full py-12 text-center text-muted-foreground rounded-2xl border-dashed">
                  Nenhuma bomba cadastrada no sistema.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 text-accent font-bold uppercase tracking-wider text-xs">
              <Fuel size={14} /> Monitoramento de Tanques
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tanks.map((tank) => (
                <FuelTankCard key={tank.id} tank={tank} />
              ))}
              {tanks.length === 0 && !loadingTanks && (
                <div className="glass col-span-full py-12 text-center text-muted-foreground rounded-2xl border-dashed">
                  Nenhum tanque cadastrado no sistema.
                </div>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="conveniencia" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {convenienceProducts.map((p) => {
                const isLow = p.pista_qty < (p.pista_min || 0);
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={p.id} 
                    className={`glass rounded-2xl p-5 border-t-2 ${isLow ? "border-t-destructive" : "border-t-transparent"}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm leading-none">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter">{p.brand || "Generico"}</div>
                      </div>
                      {isLow && (
                        <div className="p-1 bg-destructive/10 text-destructive rounded-full">
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>

                    <div className="my-6 flex items-baseline justify-between">
                      <div>
                        <div className={`text-3xl font-black tracking-tight ${isLow ? "text-destructive" : "text-slate-800"}`}>
                          {p.pista_qty}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold">QTD PISTA</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800">R$ {Number(p.sale_price).toFixed(2)}</div>
                        <div className="text-[10px] text-muted-foreground">PREÇO VENDA</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                        <span>Depósito: {p.estoque_qty}</span>
                        <span>Mínimo: {p.pista_min}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[5, 10, 20].map((q) => (
                          <Button 
                            key={q} 
                            size="sm" 
                            variant="secondary" 
                            className="flex-1 h-8 text-[10px] font-bold bg-white/50 hover:bg-accent hover:text-white transition-all shadow-none" 
                            onClick={() => reabastecer(p, q)}
                            disabled={p.estoque_qty < q}
                          >
                            +{q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {convenienceProducts.length === 0 && !loadingProducts && (
              <div className="glass col-span-full py-20 text-center text-muted-foreground rounded-2xl border-dashed">
                Nenhum produto de conveniência encontrado.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="combustiveis" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fuelProducts.map((p) => {
              const isLow = p.pista_qty < (p.pista_min || 0);
              return (
                <div key={p.id} className="glass rounded-2xl p-5 border-l-4 border-l-orange-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                    <Fuel className="text-orange-500" size={20} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Volume</p>
                      <p className="text-2xl font-black">{Number(p.pista_qty).toLocaleString()} L</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preço</p>
                      <p className="text-2xl font-black text-accent">R$ {Number(p.sale_price).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs" size="sm">Histórico</Button>
                    <Button className="flex-1 text-xs bg-accent hover:bg-accent/90" size="sm">Ajustar Preço</Button>
                  </div>
                </div>
              ))}
              {fuelProducts.length === 0 && !loadingProducts && (
                <div className="glass col-span-full py-20 text-center text-muted-foreground rounded-2xl border-dashed">
                  Nenhum combustível cadastrado.
                </div>
              )}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
