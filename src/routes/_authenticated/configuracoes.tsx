import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Bell, Shield, Palette, Target, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/buriti/PageHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({ component: ConfigPage });

function ConfigPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*");
      return (data ?? []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
    },
  });

  const [formState, setFormState] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      setFormState(prev => ({ ...settings, ...prev }));
    }
  }, [settings]);

  async function saveSetting(key: string, value: string) {
    setSaving(key);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() });
    
    if (error) {
      toast.error(`Erro ao salvar ${key}: ` + error.message);
    } else {
      toast.success("Configuração atualizada");
      qc.invalidateQueries({ queryKey: ["app-settings"] });
      if (key === "monthly_goal") qc.invalidateQueries({ queryKey: ["frentista-goal"] });
    }
    setSaving(null);
  }

  const handleInputChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Configurações" description="Gerencie as preferências e informações do sistema" />
      
      <div className="grid gap-6">
        <Section icon={Target} title="Meta de Vendas" description="Meta mensal exibida no painel do frentista">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta mensal (R$)</label>
              <Input
                type="number"
                min={0}
                step="100"
                value={formState.monthly_goal ?? ""}
                onChange={(e) => handleInputChange("monthly_goal", e.target.value)}
                placeholder="Ex: 50000"
                className="bg-background/50 border-border/40 focus:border-accent/50 transition-colors"
              />
            </div>
            <Button 
              onClick={() => saveSetting("monthly_goal", formState.monthly_goal)} 
              disabled={saving === "monthly_goal"}
              className="bg-accent hover:bg-accent/90 text-white min-w-[100px]"
            >
              {saving === "monthly_goal" ? <Loader2 className="animate-spin" size={16} /> : "Salvar Meta"}
            </Button>
          </div>
        </Section>

        <Section icon={Building2} title="Informações do Posto" description="Dados que aparecem em relatórios e notas">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome do Estabelecimento</label>
                <Input 
                  value={formState.station_name ?? ""} 
                  onChange={(e) => handleInputChange("station_name", e.target.value)}
                  placeholder="Ex: Posto Ipiranga Matriz"
                  className="bg-background/50 border-border/40 focus:border-accent/50"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">CNPJ</label>
                <Input 
                  value={formState.station_cnpj ?? ""} 
                  onChange={(e) => handleInputChange("station_cnpj", e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="bg-background/50 border-border/40 focus:border-accent/50"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Endereço Completo</label>
              <Input 
                value={formState.station_address ?? ""} 
                onChange={(e) => handleInputChange("station_address", e.target.value)}
                placeholder="Rua, Número, Bairro, Cidade - UF"
                className="bg-background/50 border-border/40 focus:border-accent/50"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={async () => {
                  await saveSetting("station_name", formState.station_name);
                  await saveSetting("station_cnpj", formState.station_cnpj);
                  await saveSetting("station_address", formState.station_address);
                }} 
                disabled={saving !== null}
                className="bg-accent hover:bg-accent/90 text-white min-w-[120px]"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : "Salvar Informações"}
              </Button>
            </div>
          </div>
        </Section>

        <Section icon={Shield} title="Sua Conta" description="Informações de acesso e segurança">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail de Acesso</label>
              <Input value={user?.email ?? ""} disabled className="bg-muted/30 border-border/40 cursor-not-allowed" />
            </div>
            <Button variant="outline" className="border-accent/20 text-accent hover:bg-accent/10">
              Alterar Senha
            </Button>
          </div>
        </Section>

        <Section icon={Bell} title="Notificações e Alertas" description="Configure como deseja ser avisado">
          <div className="grid gap-2">
            <Toggle 
              label="Alertas de estoque baixo" 
              checked={formState.notify_low_stock === "true"}
              onCheckedChange={(checked) => {
                const val = String(checked);
                handleInputChange("notify_low_stock", val);
                saveSetting("notify_low_stock", val);
              }}
            />
            <Toggle 
              label="Resumo diário por e-mail" 
              checked={formState.notify_daily_summary === "true"}
              onCheckedChange={(checked) => {
                const val = String(checked);
                handleInputChange("notify_daily_summary", val);
                saveSetting("notify_daily_summary", val);
              }}
            />
            <Toggle 
              label="Notificar movimentações de pista" 
              checked={formState.notify_pista_movements === "true"}
              onCheckedChange={(checked) => {
                const val = String(checked);
                handleInputChange("notify_pista_movements", val);
                saveSetting("notify_pista_movements", val);
              }}
            />
          </div>
        </Section>

        <Section icon={Palette} title="Aparência" description="Personalize a interface do sistema">
          <div className="grid gap-2">
            <Toggle label="Modo Escuro (Sempre Ativo)" checked={true} disabled />
            <Toggle 
              label="Animações Refinadas" 
              checked={formState.ui_animations !== "false"}
              onCheckedChange={(checked) => {
                const val = String(checked);
                handleInputChange("ui_animations", val);
                saveSetting("ui_animations", val);
              }}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5 hover:border-accent/20 transition-all duration-300">
      <div className="mb-6 flex items-center gap-4 border-b border-border/40 pb-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 shadow-inner">
          <Icon size={22} className="text-accent" />
        </div>
        <div>
          <div className="font-bold text-lg tracking-tight">{title}</div>
          <div className="text-xs text-muted-foreground font-medium">{description}</div>
        </div>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onCheckedChange, disabled }: { label: string; checked?: boolean; onCheckedChange?: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4 bg-card/30 hover:bg-card/50 transition-colors">
      <div className="text-sm font-medium">{label}</div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}