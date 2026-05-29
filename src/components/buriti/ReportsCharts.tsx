import * as React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line,
  AreaChart, Area
} from "recharts";

const COLORS = [
  "oklch(0.65 0.2 250)", // Azul Ipiranga (Primary)
  "oklch(0.85 0.18 90)",  // Amarelo Ipiranga (Accent)
  "oklch(0.7 0.2 25)",    // Laranja Ipiranga (Secondary)
  "oklch(0.5 0.15 145)", 
  "oklch(0.45 0.12 320)"
];

interface ChartsProps {
  topProducts: any[];
  byCategory: any[];
  evolution: any[];
}

export default function Charts({ topProducts, byCategory, evolution }: ChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Evolution Chart - Revenue & Profit over time */}
        <div className="premium-card p-6 lg:col-span-3 overflow-hidden animate-reveal" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent/80">Evolução de Vendas</h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tight">Comparativo entre receita e lucro no período</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.2_250)]" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[oklch(0.85_0.18_90)]" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Lucro</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.85 0.18 90)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="oklch(0.85 0.18 90)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700 }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'oklch(0.65 0.2 250)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Receita"
                  stroke="oklch(0.65 0.2 250)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  name="Lucro"
                  stroke="oklch(0.85 0.18 90)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="premium-card p-6 lg:col-span-2 animate-reveal" style={{ animationDelay: "200ms" }}>
          <h3 className="mb-8 text-xs font-black uppercase tracking-[0.2em] text-accent/80">Performance por Produto</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }} 
                  width={120}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar 
                  dataKey="revenue" 
                  name="Receita"
                  fill="oklch(0.65 0.2 250)" 
                  radius={[0, 10, 10, 0]} 
                  barSize={20}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share */}
        <div className="premium-card p-6 animate-reveal" style={{ animationDelay: "300ms" }}>
          <h3 className="mb-8 text-xs font-black uppercase tracking-[0.2em] text-accent/80">Share por Categoria</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie 
                  data={byCategory} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 w-full px-4">
              {byCategory.slice(0, 4).map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-bold uppercase truncate text-muted-foreground/80">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="premium-glass rounded-2xl p-4 min-w-[180px] border-white/5 shadow-2xl backdrop-blur-xl animate-reveal">
        {label && <p className="text-[10px] font-black uppercase text-accent mb-3 tracking-[0.2em]">{label}</p>}
        <div className="space-y-2.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{entry.name}:</span>
              <span className="text-[11px] font-black text-foreground tabular-nums">
                {typeof entry.value === 'number' && (entry.name.toLowerCase().includes('receita') || entry.name.toLowerCase().includes('lucro') || entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('profit'))
                  ? `R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
