import { Database } from "@/integrations/supabase/types";
import { Droplet, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type FuelPump = Database["public"]["Tables"]["fuel_pumps"]["Row"] & {
  nozzles?: ({
    created_at: string;
    id: string;
    label: string;
    pump_id: string | null;
    tank_id: string | null;
    tank?: { product?: { name: string } | null } | null;
  })[];
};

interface FuelPumpCardProps {
  pump: FuelPump;
}

export function FuelPumpCard({ pump }: FuelPumpCardProps) {
  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    maintenance: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    offline: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  const statusLabels = {
    active: "Operacional",
    maintenance: "Manutenção",
    offline: "Offline",
  };

  return (
    <div className="glass rounded-2xl p-5 border-l-4 border-l-accent shadow-xl border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
            <Activity size={20} />
          </div>
          <h3 className="font-bold text-lg tracking-tight">{pump.name}</h3>
        </div>
        <Badge variant="outline" className={statusColors[pump.status as keyof typeof statusColors]}>
          {statusLabels[pump.status as keyof typeof statusLabels]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pump.nozzles?.map((nozzle) => (
          <div key={nozzle.id} className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-accent/50 transition-all group">
            <div className="flex items-center gap-2 mb-1">
              <Droplet size={14} className="text-accent group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Bico {nozzle.label}</span>
            </div>
            <p className="text-xs font-bold truncate text-slate-700">
              {nozzle.tank?.product?.name || "Indisponível"}
            </p>
          </div>
        ))}
        {(!pump.nozzles || pump.nozzles.length === 0) && (
          <p className="col-span-2 text-center text-xs text-muted-foreground py-2 italic">Nenhum bico configurado</p>
        )}
      </div>
    </div>
  );
}
