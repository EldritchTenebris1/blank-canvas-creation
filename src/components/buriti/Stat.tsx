import * as React from "react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string;
  icon?: React.ElementType;
  highlight?: boolean;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
}

export function Stat({ label, value, icon: Icon, highlight, trend, description }: StatProps) {
  return (
    <div className={cn(
      "premium-card p-6 border-white/5 relative overflow-hidden group",
      highlight && "bg-destructive/10 border-destructive/20 shadow-[0_0_20px_oklch(var(--destructive)/0.1)]"
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn(
              "p-2 rounded-xl bg-white/5 shadow-inner transition-transform group-hover:scale-110",
              highlight ? "text-destructive" : "text-primary"
            )}>
              <Icon size={18} />
            </div>
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
            {label}
          </span>
        </div>
        {highlight ? (
          <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
        ) : trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
            trend.isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend.isUp ? "+" : "-"}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <div className={cn(
          "text-3xl font-black tracking-tighter text-gradient leading-none mb-1",
          highlight && "from-destructive to-destructive/60 bg-clip-text text-transparent"
        )}>
          {value}
        </div>
        {description && (
          <p className="text-[10px] text-muted-foreground/60 font-medium">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
