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
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass rounded-2xl p-5 lg:col-span-2 border-none shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800">Vendas — últimos 7 dias</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Evolução das movimentações</p>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daysData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.85 0.18 90)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.85 0.18 90)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="day" stroke="oklch(0.68 0.03 250)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.68 0.03 250)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.22 0.045 255)",
                  border: "none",
                  borderRadius: 16,
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="oklch(0.82 0.18 90)"
                strokeWidth={3}
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border-none shadow-sm">
        <h3 className="mb-4 font-bold text-slate-800">Mais Vendidos</h3>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" stroke="oklch(0.68 0.03 250)" fontSize={10} width={80} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.22 0.045 255)",
                  border: "none",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="qty" fill="oklch(0.65 0.22 250)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
