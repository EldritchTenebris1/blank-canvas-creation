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
      "glass rounded-2xl p-5 border-none shadow-sm transition-all",
      highlight && "bg-destructive/5 ring-1 ring-destructive/20"
    )}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{label}</div>
        {Icon && <Icon size={18} className={highlight ? "text-destructive" : "text-accent"} />}
      </div>
      <div className={cn(
        "mt-2 text-[clamp(1.5rem,4vw,2rem)] font-black tracking-tighter leading-none",
        highlight ? "text-destructive" : "text-slate-800"
      )}>{value}</div>
    </div>
  );
}
