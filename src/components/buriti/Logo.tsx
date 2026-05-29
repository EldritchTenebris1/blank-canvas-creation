import { Fuel } from "lucide-react";

export function BuritiLogo({ size = "md", name }: { size?: "sm" | "md" | "lg"; name?: string }) {
  const sizes = {
    sm: { wrap: "h-8 w-8", icon: 16, text: "text-sm" },
    md: { wrap: "h-10 w-10", icon: 20, text: "text-base" },
    lg: { wrap: "h-14 w-14", icon: 28, text: "text-xl" },
  } as const;
  const s = sizes[size];
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.wrap} relative grid place-items-center rounded-xl shadow-glow-accent`}
        style={{ background: "var(--gradient-accent)" }}
      >
        <Fuel size={s.icon} className="text-primary" strokeWidth={3} />
        <div
          className="absolute -inset-px rounded-xl opacity-30 blur-md"
          style={{ background: "var(--gradient-accent)" }}
        />
      </div>
      <div className="leading-tight">
        <div className={`${s.text} font-bold tracking-tight text-white`}>
          {name || "Posto Buriti"}
        </div>
      </div>
    </div>
  );
}