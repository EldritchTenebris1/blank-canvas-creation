import * as React from "react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string;
  icon?: React.ElementType;
  highlight?: boolean;
}

export function Stat({ label, value, icon: Icon, highlight }: StatProps) {
  return (
    <div className={cn(
      "premium-card p-6 border-white/5",
      highlight && "bg-destructive/10 border-destructive/20 shadow-[0_0_20px_oklch(var(--destructive)/0.1)]"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn(
              "p-2 rounded-xl bg-white/5 shadow-inner",
              highlight ? "text-destructive" : "text-primary"
            )}>
              <Icon size={18} />
            </div>
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
            {label}
          </span>
        </div>
        {highlight && (
          <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
        )}
      </div>
      <div className={cn(
        "text-3xl font-black tracking-tighter text-gradient leading-none",
        highlight && "from-destructive to-destructive/60 bg-clip-text text-transparent"
      )}>
        {value}
      </div>
    </div>
  );
}
