import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuritiLogo } from "@/components/buriti/Logo";
import { supabase } from "@/integrations/supabase/client";
import { codeToEmail } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar — Frentista | Posto Buriti" }],
  }),
  component: LoginFrentista,
});

function LoginFrentista() {
  const [code, setCode] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{1,3}$/.test(code)) return toast.error("Código inválido");
    if (!/^\d{2,4}$/.test(pin)) return toast.error("Senha de 2 a 4 dígitos");
    setLoading(true);
    const email = codeToEmail(code);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
    setLoading(false);
    if (error) return toast.error("Código ou senha incorretos");
    toast.success("Bem-vindo!");
    navigate({ to: "/operador", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-glow)" }}
        />
        <BuritiLogo size="lg" />
        <div className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Operação <span className="gradient-text">fluida</span>
            <br />
            na pista.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Acesso rápido para frentistas registrarem vendas e consultarem o
            estoque da pista em segundos.
          </p>
          <div className="grid max-w-md grid-cols-3 gap-3 pt-4">
            {["Rápido", "Seguro", "Em tempo real"].map((t) => (
              <div
                key={t}
                className="glass rounded-xl px-4 py-3 text-center text-xs font-medium"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Posto Buriti · Todos os direitos reservados
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <form
          onSubmit={handleSubmit}
          className="glass-strong w-full max-w-sm space-y-6 rounded-2xl p-8 shadow-lg animate-float-up"
        >
          <div className="lg:hidden">
            <BuritiLogo size="md" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Acesso Frentista
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Entrar na pista
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use seu código e senha numérica.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Código de acesso
              </label>
              <Input
                inputMode="numeric"
                autoFocus
                maxLength={3}
                placeholder="01"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="h-12 border-border/60 bg-background/40 text-center text-2xl font-bold tracking-[0.4em]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Senha numérica (2-4 dígitos)
              </label>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="h-12 border-border/60 bg-background/40 pr-12 text-center text-2xl font-bold tracking-[0.4em]"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="group h-12 w-full text-base font-semibold text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight className="ml-1 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            É administrador?{" "}
            <a href="/admin" className="font-medium text-accent hover:underline">
              Acessar painel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}