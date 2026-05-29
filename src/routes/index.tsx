import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, TrendingUp, AlertCircle, Fuel, Users, Package, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const stats = [
    { title: "Produtos na Pista", value: "842", sub: "Estoque atual", icon: Fuel, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Produtos no Estoque", value: "2,450", sub: "Estoque principal", icon: Package, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Vendas do Dia", value: "R$ 4.820", sub: "+12.5% vs ontem", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Funcionários Ativos", value: "12", sub: "Pista / Administrativo", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-white uppercase italic">
          <span className="text-yellow-500">Posto</span> Buriti
        </h2>
        <p className="text-white/50 font-medium">Bem-vindo ao centro de controle operacional.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#121212] border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 group overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-white/70">{stat.title}</CardTitle>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <p className="text-xs font-semibold text-white/40">{stat.sub}</p>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-[#121212] border-yellow-500/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl font-bold">Vendas Recentes</CardTitle>
              <p className="text-xs text-white/40">Últimas 24 horas de movimentação</p>
            </div>
            <TrendingUp className="text-emerald-500 h-6 w-6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { user: "João Silva", type: "Venda", item: "Óleo 5W30", qty: "2 un", time: "Há 5 min", status: "success" },
                { user: "Maria Santos", type: "Reposição", item: "Pista Central", qty: "20 un", time: "Há 18 min", status: "info" },
                { user: "Carlos Edu", type: "Ajuste", item: "Fluido Freio", qty: "-1 un", time: "Há 45 min", status: "warning" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                  <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center font-black text-yellow-500 group-hover:scale-105 transition-transform">
                    {item.user[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-white">{item.user}</p>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{item.time}</span>
                    </div>
                    <p className="text-xs font-medium text-white/60">
                      Realizou uma <span className="text-yellow-500 font-bold">{item.type}</span> de <span className="text-white font-bold">{item.qty}</span> de <span className="text-white font-bold">{item.item}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-[#121212] border-yellow-500/10 overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold">Alertas Críticos</CardTitle>
            <p className="text-xs text-white/40">Itens que precisam de atenção imediata</p>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-4 group">
               <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                 <AlertCircle className="h-6 w-6 animate-pulse" />
               </div>
               <div>
                 <p className="text-sm font-black text-red-500 uppercase italic tracking-wider">Estoque em Falta</p>
                 <p className="text-xs font-bold text-white mb-2">Óleo 15W40 - Lote A2</p>
                 <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[15%]" />
                 </div>
                 <p className="text-[10px] text-white/40 mt-1">Restam apenas 3 unidades na pista</p>
               </div>
             </div>

             <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex gap-4 group">
               <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
                 <AlertCircle className="h-6 w-6" />
               </div>
               <div>
                 <p className="text-sm font-black text-yellow-500 uppercase italic tracking-wider">Necessita Reposição</p>
                 <p className="text-xs font-bold text-white mb-2">Aditivo Radiador</p>
                 <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full w-[40%]" />
                 </div>
                 <p className="text-[10px] text-white/40 mt-1">5 unidades na pista (Mínimo: 10)</p>
               </div>
             </div>
          </CardContent>
          {/* Subtle logo watermark */}
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12">
            <Fuel className="w-48 h-48 text-white" />
          </div>
        </Card>
      </div>
    </div>
  );
}
