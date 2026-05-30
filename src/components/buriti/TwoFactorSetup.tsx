import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, ShieldAlert, Trash2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type EnrollData = { factorId: string; qr: string; secret: string };

export function TwoFactorSetup() {
  const qc = useQueryClient();
  const [enroll, setEnroll] = React.useState<EnrollData | null>(null);
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const { data: factors, isLoading } = useQuery({
    queryKey: ["mfa-factors"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data.totp ?? [];
    },
  });

  const verified = (factors ?? []).filter((f) => f.status === "verified");
  const isEnabled = verified.length > 0;

  async function startEnroll() {
    setBusy(true);
    // Limpa fatores não verificados pendentes para evitar erro de duplicidade
    const pending = (factors ?? []).filter((f) => f.status === "unverified");
    for (const f of pending) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Autenticador ${new Date().toLocaleDateString("pt-BR")}`,
    });
    setBusy(false);
    if (error) return toast.error("Erro ao iniciar: " + error.message);
    setEnroll({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    setCode("");
  }

  async function confirmEnroll() {
    if (!enroll) return;
    if (!/^\d{6}$/.test(code)) return toast.error("Digite o código de 6 dígitos");
    setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
    if (chErr) {
      setBusy(false);
      return toast.error("Erro: " + chErr.message);
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: ch.id,
      code,
    });
    setBusy(false);
    if (error) return toast.error("Código inválido. Tente novamente.");
    toast.success("Verificação em duas etapas ativada!");
    setEnroll(null);
    setCode("");
    qc.invalidateQueries({ queryKey: ["mfa-factors"] });
  }

  async function disable(factorId: string) {
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (error) return toast.error("Erro ao desativar: " + error.message);
    toast.success("Verificação em duas etapas desativada");
    qc.invalidateQueries({ queryKey: ["mfa-factors"] });
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="animate-spin" size={16} /> Carregando...
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-4 py-3">
        {isEnabled ? (
          <ShieldCheck className="text-accent" size={20} />
        ) : (
          <ShieldAlert className="text-muted-foreground" size={20} />
        )}
        <div className="flex-1">
          <div className="text-sm font-medium">
            {isEnabled ? "Ativada" : "Desativada"}
          </div>
          <div className="text-xs text-muted-foreground">
            {isEnabled
              ? "Seu login exige um código do aplicativo autenticador."
              : "Proteja sua conta com um app como Google Authenticator ou Authy."}
          </div>
        </div>
        {isEnabled && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => disable(verified[0].id)}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} /> Desativar
          </Button>
        )}
      </div>

      {!isEnabled && !enroll && (
        <div className="flex justify-start">
          <Button onClick={startEnroll} disabled={busy} className="bg-accent hover:bg-accent/90 text-white">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Smartphone size={16} />} Ativar 2FA
          </Button>
        </div>
      )}

      {enroll && (
        <div className="grid gap-4 rounded-xl border border-accent/20 bg-card/40 p-5">
          <div className="text-sm">
            1. Escaneie o QR Code com seu aplicativo autenticador.
          </div>
          <div className="flex justify-center">
            <img
              src={enroll.qr}
              alt="QR Code 2FA"
              className="h-44 w-44 rounded-lg bg-white p-2"
            />
          </div>
          <div className="text-center text-xs text-muted-foreground">
            Ou insira a chave manualmente:
            <div className="mt-1 break-all font-mono text-[11px] text-foreground">{enroll.secret}</div>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              2. Digite o código de 6 dígitos
            </label>
            <Input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="text-center text-2xl font-bold tracking-[0.4em]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={confirmEnroll} disabled={busy} className="flex-1 bg-accent hover:bg-accent/90 text-white">
              {busy ? <Loader2 className="animate-spin" size={16} /> : "Confirmar e ativar"}
            </Button>
            <Button variant="ghost" onClick={() => setEnroll(null)} disabled={busy}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
