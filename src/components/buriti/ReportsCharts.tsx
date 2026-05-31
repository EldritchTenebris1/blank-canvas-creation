import * as React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area, ScatterChart, Scatter, ZAxis
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
  scatterData?: any[];
}

export default function Charts({ topProducts, byCategory, evolution, scatterData = [] }: ChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-6">
        {/* Main Evolution Chart */}
        <div className="premium-card p-6 lg:col-span-4 overflow-hidden animate-reveal" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent/80">Evolução de Vendas</h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tight">Comparativo entre receita e lucro no período</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.2_250)]" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.85_0.18_90)]" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Lucro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.7_0.2_25)]" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Margem %</span>
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
                  yAxisId="left"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'oklch(0.65 0.2 250)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  yAxisId="left"
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
                  yAxisId="left"
                  type="monotone" 
                  dataKey="profit" 
                  name="Lucro"
                  stroke="oklch(0.85 0.18 90)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  animationDuration={2000}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="margin"
                  name="Margem"
                  stroke="oklch(0.7 0.2 25)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Chart */}
        <div className="premium-card p-6 lg:col-span-2 animate-reveal" style={{ animationDelay: "200ms" }}>
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent/80">Correlação: Qtd vs Receita</h3>
            <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tight">Análise de volume por ticket</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  type="number" 
                  dataKey="qty" 
                  name="Quantidade" 
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  axisLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="revenue" 
                  name="Receita" 
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  axisLine={false}
                  tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <ZAxis type="number" dataKey="avgPrice" range={[50, 400]} name="Preço Médio" />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Produtos" data={scatterData} fill="oklch(0.85 0.18 90)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="premium-card p-6 lg:col-span-3 animate-reveal" style={{ animationDelay: "300ms" }}>
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
        <div className="premium-card p-6 lg:col-span-3 animate-reveal" style={{ animationDelay: "400ms" }}>
          <h3 className="mb-8 text-xs font-black uppercase tracking-[0.2em] text-accent/80">Distribuição por Categoria</h3>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={byCategory} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    innerRadius={70}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-1 gap-y-3">
              {byCategory.map((cat, i) => {
                const total = byCategory.reduce((acc, c) => acc + c.value, 0);
                const percent = (cat.value / total) * 100;
                return (
                  <div key={cat.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{cat.name}</span>
                      </div>
                      <span className="text-foreground">R$ {cat.value.toLocaleString('pt-BR')} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ width: `${percent}%`, backgroundColor: COLORS[i % COLORS.length] }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Detailed Table */}
        <div className="premium-card p-6 lg:col-span-6 animate-reveal overflow-x-auto" style={{ animationDelay: "500ms" }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent/80">Inteligência de Mix de Produtos</h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tight">Análise profunda de rentabilidade e volume</p>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Produto</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-right">Qtd</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-right">Receita</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-right">Participação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topProducts.map((p, i) => {
                const totalRevenue = topProducts.reduce((sum, item) => sum + item.revenue, 0);
                const share = (p.revenue / totalRevenue) * 100;
                return (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 text-[11px] font-bold text-foreground">{p.name}</td>
                    <td className="py-4 text-[11px] font-black text-right tabular-nums text-muted-foreground">{p.qty.toLocaleString('pt-BR')}</td>
                    <td className="py-4 text-[11px] font-black text-right tabular-nums text-accent">R$ {p.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground/40 w-8">{share.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                {typeof entry.value === 'number' && entry.name.toLowerCase().includes('margem')
                  ? `${entry.value.toFixed(1)}%`
                  : typeof entry.value === 'number' && (entry.name.toLowerCase().includes('receita') || entry.name.toLowerCase().includes('lucro') || entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('profit'))
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
