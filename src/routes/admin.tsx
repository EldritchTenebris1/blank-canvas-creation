import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuritiLogo } from "@/components/buriti/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Acesso Administrativo | Posto Buriti" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || password.length < 6) {
      return toast.error("Email válido e senha de 6+ caracteres");
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Credenciais inválidas");
    toast.success("Bem-vindo, administrador");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <form
          onSubmit={handleSubmit}
          className="glass-strong w-full max-w-md space-y-6 rounded-2xl p-8 shadow-lg animate-float-up"
        >
          <div className="lg:hidden">
            <BuritiLogo size="md" />
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Painel Administrativo
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Entrar no painel</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesse o ERP completo do Posto Buriti.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                autoFocus
                placeholder="admin@buriti.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-border/60 bg-background/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-border/60 bg-background/40 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="group h-11 w-full font-semibold text-primary-foreground shadow-glow"
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

          <div className="flex items-center justify-end border-t border-border/40 pt-4 text-xs text-muted-foreground">
            <a href="/login" className="hover:text-foreground">
              Sou frentista →
            </a>
          </div>
        </form>
      </div>

      <div className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="flex justify-end">
          <BuritiLogo size="lg" />
        </div>
        <div className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            ERP <span className="gradient-text">premium</span>
            <br />
            para postos.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Dashboard, controle duplo de estoque, movimentações em tempo real,
            relatórios inteligentes e gestão completa — tudo em um só lugar.
          </p>
          <div className="grid max-w-md grid-cols-2 gap-3 pt-4">
            {[
              ["Estoque duplo", "Pista + principal"],
              ["Tempo real", "Atualização instantânea"],
              ["Produtividade", "Foco no resultado"],
              ["Relatórios", "PDF e Excel"],
            ].map(([t, d]) => (
              <div key={t} className="glass rounded-xl p-4">
                <div className="text-sm font-semibold">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Posto Buriti
        </div>
      </div>
    </div>
  );
}