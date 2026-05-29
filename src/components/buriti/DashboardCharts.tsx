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
      <div className="premium-card p-6 lg:col-span-2 border-white/5">
        <div className="mb-6">
          <h3 className="text-lg font-bold tracking-tight">Vendas semanais</h3>
          <p className="text-[11px] text-muted-foreground/60">Análise de movimentação dos últimos 7 dias.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daysData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="oklch(0.7 0.02 250 / 0.4)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="oklch(0.7 0.02 250 / 0.4)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.16 0.025 255 / 0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 16,
                  boxShadow: "0 10px 40px -10px oklch(0 0 0 / 0.5)",
                  color: "white"
                }}
                itemStyle={{ color: "var(--primary)", fontWeight: "bold" }}
              />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="var(--primary)"
                strokeWidth={4}
                fill="url(#g1)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="premium-card p-6 border-white/5">
        <div className="mb-6">
          <h3 className="text-lg font-bold tracking-tight">Top Performance</h3>
          <p className="text-[11px] text-muted-foreground/60">Produtos com maior giro hoje.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topData} layout="vertical" margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="oklch(1 0 0 / 0.05)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="oklch(0.7 0.02 250 / 0.6)" 
                fontSize={10} 
                width={100} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip
                cursor={{ fill: 'oklch(1 0 0 / 0.05)' }}
                contentStyle={{
                  background: "oklch(0.16 0.025 255 / 0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 16,
                }}
              />
              <Bar 
                dataKey="qty" 
                fill="var(--accent)" 
                radius={[0, 8, 8, 0]} 
                barSize={20}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
