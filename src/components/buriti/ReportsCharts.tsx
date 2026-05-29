import * as React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, Legend 
} from "recharts";

const COLORS = ["oklch(0.82 0.18 90)", "oklch(0.65 0.15 250)", "oklch(0.7 0.18 145)", "oklch(0.7 0.2 25)", "oklch(0.68 0.16 320)"];

interface ChartsProps {
  topProducts: any[];
  byCategory: any[];
}

export default function Charts({ topProducts, byCategory }: ChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass rounded-2xl p-6 lg:col-span-2">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top produtos por receita</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 255)" />
              <XAxis dataKey="name" tick={{ fill: "oklch(0.7 0.02 255)", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fill: "oklch(0.7 0.02 255)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "oklch(0.22 0.04 255)", border: "1px solid oklch(0.3 0.03 255)", borderRadius: 12 }} />
              <Bar dataKey="revenue" fill="oklch(0.82 0.18 90)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Por categoria</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.22 0.04 255)", border: "1px solid oklch(0.3 0.03 255)", borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
