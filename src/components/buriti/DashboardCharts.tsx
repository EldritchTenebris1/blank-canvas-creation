import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardChartsProps {
  daysData: any[];
  topData: any[];
}

export default function DashboardCharts({ daysData, topData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="premium-card p-6 lg:col-span-2 border-white/5 relative overflow-hidden group">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Fluxo de Vendas</h3>
            <p className="text-[11px] text-muted-foreground/60 font-bold uppercase tracking-widest">Desempenho dos últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">Volume de Vendas</span>
          </div>
        </div>

        <div className="h-[320px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.03)" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="oklch(0.7 0.02 250 / 0.3)" 
                fontSize={10} 
                fontWeight={700}
                tickLine={false} 
                axisLine={false} 
                dy={15}
              />
              <YAxis 
                stroke="oklch(0.7 0.02 250 / 0.3)" 
                fontSize={10} 
                fontWeight={700}
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip
                cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  background: "oklch(0.16 0.025 255 / 0.9)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 20,
                  boxShadow: "0 20px 50px -12px oklch(0 0 0 / 0.5)",
                  padding: "12px 16px"
                }}
                itemStyle={{ color: "var(--primary)", fontWeight: "900", textTransform: "uppercase", fontSize: "10px" }}
                labelStyle={{ fontWeight: "900", color: "white", marginBottom: "4px", fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="vendas"
                name="Vendas"
                stroke="var(--primary)"
                strokeWidth={4}
                fill="url(#g1)"
                animationDuration={2000}
                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="premium-card p-6 border-white/5 relative overflow-hidden group">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-colors" />
        
        <div className="mb-8 relative z-10">
          <h3 className="text-lg font-bold tracking-tight">Produtos Estrela</h3>
          <p className="text-[11px] text-muted-foreground/60 font-bold uppercase tracking-widest">Mais vendidos no período</p>
        </div>
        
        <div className="h-[320px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topData} layout="vertical" margin={{ left: -30, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.03)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="oklch(0.7 0.02 250 / 0.5)" 
                fontSize={9} 
                fontWeight={800}
                width={120} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip
                cursor={{ fill: 'oklch(1 0 0 / 0.05)', radius: 10 }}
                contentStyle={{
                  background: "oklch(0.16 0.025 255 / 0.9)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 20,
                  padding: "8px 12px"
                }}
                itemStyle={{ color: "var(--accent)", fontWeight: "900", textTransform: "uppercase", fontSize: "10px" }}
                labelStyle={{ display: "none" }}
              />
              <Bar 
                dataKey="qty" 
                name="Quantidade"
                fill="var(--accent)" 
                radius={[0, 10, 10, 0]} 
                barSize={16}
                animationDuration={2000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
