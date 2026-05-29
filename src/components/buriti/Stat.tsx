import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={cn(
        "premium-card p-6 border-white/5 relative overflow-hidden group transition-all duration-500",
        highlight && "bg-destructive/10 border-destructive/20 shadow-[0_0_20px_oklch(var(--destructive)/0.1)]"
      )}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/15 transition-all duration-500 group-hover:scale-150" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={cn(
              "p-2.5 rounded-xl bg-white/5 border border-white/10 shadow-inner transition-all duration-500 group-hover:rotate-6 group-hover:bg-white/10 group-hover:border-white/20",
              highlight ? "text-destructive" : "text-primary"
            )}>
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
            {label}
          </span>
        </div>
        
        {highlight ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-destructive tracking-widest">Alerta</span>
            <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_oklch(var(--destructive))] animate-pulse" />
          </div>
        ) : trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg border",
            trend.isUp 
              ? "bg-success/10 text-success border-success/20" 
              : "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            {trend.isUp ? "+" : "-"}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <div className={cn(
          "text-4xl font-black tracking-tighter text-gradient leading-none mb-2 tabular-nums group-hover:scale-105 origin-left transition-transform duration-500",
          highlight && "from-destructive to-destructive/60 bg-clip-text text-transparent"
        )}>
          {value}
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground/50 font-medium group-hover:text-muted-foreground/70 transition-colors">
            {description}
          </p>
        )}
      </div>

      {/* Subtle Bottom Accent Line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full",
        highlight && "bg-destructive"
      )} />
    </motion.div>
  );
}
