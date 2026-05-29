import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Bell, Shield, Palette, Target, Loader2, User } from "lucide-react";
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
  
  const { data: settings = {}, isLoading: loadingSettings } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*");
      return (data ?? []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
    },
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [formState, setFormState] = React.useState<Record<string, string>>({});
  const [profileName, setProfileName] = React.useState("");
  const [saving, setSaving] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      setFormState(prev => ({ ...settings, ...prev }));
    }
  }, [settings]);

  React.useEffect(() => {
    if (profile?.full_name) {
      setProfileName(profile.full_name);
    }
  }, [profile]);

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
      if (key === "station_name") qc.invalidateQueries({ queryKey: ["app-setting", "station_name"] });
    }
    setSaving(null);
  }

  async function saveProfile() {
    if (!user) return;
    setSaving("profile");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profileName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    
    if (error) {
      toast.error("Erro ao salvar perfil: " + error.message);
    } else {
      toast.success("Perfil atualizado");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    }
    setSaving(null);
  }

  const handleInputChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  if (loadingSettings || loadingProfile) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Configurações" description="Gerencie as preferências e informações do sistema" />
      
      <div className="grid gap-6 pb-20">
        <Section icon={User} title="Seu Perfil" description="Como você aparece no sistema">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome Completo</label>
              <Input 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Seu nome completo"
                className="bg-background/50 border-border/40 focus:border-accent/50"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={saveProfile} 
                disabled={saving !== null}
                className="bg-accent hover:bg-accent/90 text-white min-w-[120px]"
              >
                {saving === "profile" ? <Loader2 className="animate-spin" size={16} /> : "Salvar Perfil"}
              </Button>
            </div>
          </div>
        </Section>

        <Section icon={Target} title="Meta de Vendas (Global)" description="Meta padrão caso o frentista não tenha uma meta individual">
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
              disabled={saving !== null}
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

        <Section icon={Shield} title="Conta e Segurança" description="Informações de acesso e segurança">
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


        <Section icon={Palette} title="Aparência" description="Personalize a interface do sistema">
          <div className="grid gap-2">
            
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