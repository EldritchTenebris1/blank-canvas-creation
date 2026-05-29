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
  const { data: goalValue } = useQuery({
    queryKey: ["setting", "monthly_goal"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "monthly_goal")
        .maybeSingle();
      return Number(data?.value ?? 0);
    },
  });
  const [goal, setGoal] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (goalValue !== undefined) setGoal(String(goalValue));
  }, [goalValue]);

  async function saveGoal() {
    const v = Number(goal);
    if (!Number.isFinite(v) || v < 0) return toast.error("Informe um valor válido");
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "monthly_goal", value: String(v), updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Meta atualizada");
    qc.invalidateQueries({ queryKey: ["setting", "monthly_goal"] });
    qc.invalidateQueries({ queryKey: ["frentista-goal"] });
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Configurações" description="Preferências do sistema" />
      <div className="grid gap-4">
        <Section icon={Target} title="Meta de vendas" description="Meta mensal exibida no painel do frentista">
          <div className="grid gap-1.5 sm:grid-cols-[180px_1fr_auto] sm:items-center">
            <label className="text-xs font-medium text-muted-foreground">Meta mensal (R$)</label>
            <Input
              type="number"
              min={0}
              step="100"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="10000"
            />
            <Button onClick={saveGoal} disabled={saving} style={{ background: "var(--gradient-primary)" }}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : "Salvar"}
            </Button>
          </div>
        </Section>
        <Section icon={Building2} title="Posto Buriti" description="Informações do estabelecimento">
          <Field label="Nome" defaultValue="Posto Buriti" />
          <Field label="CNPJ" defaultValue="00.000.000/0001-00" />
          <Field label="Endereço" defaultValue="—" />
        </Section>
        <Section icon={Shield} title="Conta administrador" description="Sua conta de acesso">
          <Field label="E-mail" defaultValue={user?.email ?? ""} disabled />
        </Section>
        <Section icon={Bell} title="Notificações" description="Alertas e avisos">
          <Toggle label="Alertas de estoque baixo" defaultChecked />
          <Toggle label="Resumo diário por e-mail" />
          <Toggle label="Notificar movimentações de pista" defaultChecked />
        </Section>
        <Section icon={Palette} title="Aparência" description="Tema visual do sistema">
          <Toggle label="Modo escuro" defaultChecked disabled />
          <Toggle label="Animações reduzidas" />
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3 border-b border-border/40 pb-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-card/60"><Icon size={18} className="text-accent" /></div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}
function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[180px_1fr] sm:items-center">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input {...rest} />
    </div>
  );
}
function Toggle({ label, defaultChecked, disabled }: { label: string; defaultChecked?: boolean; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
      <div className="text-sm">{label}</div>
      <Switch defaultChecked={defaultChecked} disabled={disabled} />
    </div>
  );
}