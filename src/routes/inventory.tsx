import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCcw, MoreHorizontal, Fuel, Package } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"pista" | "principal">("pista");
  const [search, setSearch] = useState("");

  const products = [
    { id: "1", name: "Óleo 5W30 Sintético", pista: 12, principal: 45, min_pista: 10, min_principal: 20, price: "R$ 45,90" },
    { id: "2", name: "Aditivo STP", pista: 3, principal: 18, min_pista: 8, min_principal: 10, price: "R$ 28,00" },
    { id: "3", name: "Água Desmineralizada", pista: 25, principal: 80, min_pista: 15, min_principal: 30, price: "R$ 8,50" },
    { id: "4", name: "Fluido Freio DOT 4", pista: 8, principal: 15, min_pista: 5, min_principal: 5, price: "R$ 32,00" },
    { id: "5", name: "Palheta Dyna 24", pista: 2, principal: 10, min_pista: 5, min_principal: 5, price: "R$ 65,00" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Controle de <span className="text-yellow-500">Estoque</span>
          </h2>
          <p className="text-white/50 font-medium">Gestão centralizada de mercadorias.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase italic tracking-widest px-6 h-12 flex gap-2">
                <Plus className="w-5 h-5" /> Nova Reposição
            </Button>
        </div>
      </div>

      <div className="flex gap-2 bg-[#121212] p-1.5 rounded-2xl border border-white/5 w-fit">
        <button 
          onClick={() => setActiveTab("pista")}
          className={`px-8 py-3 rounded-xl font-black uppercase italic tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === "pista" ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Fuel className="w-4 h-4" /> Estoque da Pista
        </button>
        <button 
          onClick={() => setActiveTab("principal")}
          className={`px-8 py-3 rounded-xl font-black uppercase italic tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === "principal" ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <Package className="w-4 h-4" /> Estoque Principal
        </button>
      </div>

      <Card className="bg-[#121212] border-white/5 overflow-hidden">
        <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between p-6">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input 
                    placeholder="Filtrar por nome ou código..." 
                    className="bg-white/5 border-white/10 pl-10 h-11 focus-visible:ring-yellow-500/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="border-white/10 h-11 px-4 hover:bg-white/5 flex gap-2">
                    <Filter className="w-4 h-4" /> Filtros
                </Button>
                <Button variant="outline" className="border-white/10 h-11 px-4 hover:bg-white/5 flex gap-2">
                    <ArrowUpRight className="w-4 h-4" /> Exportar
                </Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white font-black uppercase italic tracking-widest py-6 px-6">Produto</TableHead>
                <TableHead className="text-white font-black uppercase italic tracking-widest text-center">Quantidade</TableHead>
                <TableHead className="text-white font-black uppercase italic tracking-widest text-center">Mínimo</TableHead>
                <TableHead className="text-white font-black uppercase italic tracking-widest text-right">Status</TableHead>
                <TableHead className="text-white font-black uppercase italic tracking-widest text-right px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => {
                const qty = activeTab === "pista" ? p.pista : p.principal;
                const min = activeTab === "pista" ? p.min_pista : p.min_principal;
                const isLow = qty < min;

                return (
                  <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-6 px-6">
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-white/40 uppercase font-black">Ref: BUR-{p.id.padStart(4, '0')}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-lg font-black ${isLow ? 'text-red-500' : 'text-white'}`}>{qty} un</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-white/40">{min} un</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isLow ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {isLow ? 'Alerta Crítico' : 'Normal'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="hover:bg-yellow-500/10 hover:text-yellow-500 text-white/40">
                              <RefreshCcw className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="hover:bg-white/10 text-white/40">
                              <MoreHorizontal className="w-4 h-4" />
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[#121212] border-white/5">
              <CardHeader>
                  <CardTitle className="text-white text-lg font-bold">Resumo de Reposição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><ArrowUpRight className="w-5 h-5" /></div>
                          <div>
                              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Capacidade Total</p>
                              <p className="text-xl font-black text-white">4.250 <span className="text-xs font-medium text-white/40">Itens</span></p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-500 uppercase">92% Utilizado</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
          
          <Card className="bg-[#121212] border-white/5">
              <CardHeader>
                  <CardTitle className="text-white text-lg font-bold">Movimentação Rápida</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                  <Button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-16 flex flex-col gap-1 items-center justify-center group">
                      <ArrowUpRight className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Entrada de Nota</span>
                  </Button>
                  <Button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-16 flex flex-col gap-1 items-center justify-center group">
                      <RefreshCcw className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Transf. Pista</span>
                  </Button>
                  <Button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-16 flex flex-col gap-1 items-center justify-center group">
                      <ArrowDownLeft className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Saída Avulsa</span>
                  </Button>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
