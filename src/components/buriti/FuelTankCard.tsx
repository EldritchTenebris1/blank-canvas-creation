import { Progress } from "@/components/ui/progress";
import { Database } from "@/integrations/supabase/types";
import { Fuel } from "lucide-react";

type FuelTank = Database["public"]["Tables"]["fuel_tanks"]["Row"] & {
  product?: { name: string };
};

interface FuelTankCardProps {
  tank: FuelTank;
}

export function FuelTankCard({ tank }: FuelTankCardProps) {
  const percentage = (Number(tank.current_volume) / Number(tank.capacity)) * 100;
  const isLow = percentage < 20;

  return (
    <div className="glass rounded-2xl p-4 relative overflow-hidden group">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${isLow ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
          <Fuel size={20} />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{tank.name}</h4>
          <p className="text-xs text-muted-foreground">{tank.product?.name || "Sem combustível"}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Volume Atual</span>
          <span className="font-medium">{Number(tank.current_volume).toLocaleString()} L</span>
        </div>
        <Progress value={percentage} className={`h-2 ${isLow ? 'bg-destructive/20' : ''}`} />
        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          <span>0 L</span>
          <span>{percentage.toFixed(1)}%</span>
          <span>{Number(tank.capacity).toLocaleString()} L</span>
        </div>
      </div>

      {isLow && (
        <div className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
        </div>
      )}
    </div>
  );
}
