import { Fuel } from "lucide-react";
import { cn } from "@/lib/utils";

export function BuritiLogo({ 
  size = "md", 
  name, 
  className 
}: { 
  size?: "sm" | "md" | "lg"; 
  name?: string;
  className?: string;
}) {
  const sizes = {
    sm: { wrap: "h-9 w-9", icon: 18, text: "text-xs" },
    md: { wrap: "h-11 w-11", icon: 22, text: "text-base" },
    lg: { wrap: "h-16 w-16", icon: 32, text: "text-2xl" },
  } as const;
  
  const s = sizes[size];
  
  return (
    <div className={cn("flex items-center gap-3.5 group", className)}>
      <div className="relative">
        <div
          className={cn(
            s.wrap,
            "relative z-10 grid place-items-center rounded-2xl shadow-glow-accent transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          )}
          style={{ background: "var(--gradient-accent)" }}
        >
          <Fuel size={s.icon} className="text-primary" strokeWidth={3} />
        </div>
        {/* Glow Layer */}
        <div
          className="absolute -inset-2 rounded-[24px] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-700"
          style={{ background: "var(--gradient-accent)" }}
        />
        {/* Ring Decoration */}
        <div className="absolute -inset-1 border border-white/5 rounded-2xl z-0" />
      </div>
      
      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60 mb-1 group-hover:text-accent transition-colors">
          Premium ERP
        </span>
        <div className={cn(
          s.text,
          "font-black tracking-tighter text-white uppercase italic group-hover:translate-x-1 transition-transform"
        )}>
          {name || "Posto Buriti"}
        </div>
      </div>
    </div>
  );
}
