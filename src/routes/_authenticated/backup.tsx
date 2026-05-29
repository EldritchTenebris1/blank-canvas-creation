import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, Download, Loader2, ShieldAlert, History, Clock, FileJson, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/buriti/PageHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/backup")({
  component: BackupPage,
});

function BackupPage() {
  const { user, session, loading } = useAuth();
  const qc = useQueryClient();
  const isMasterAdmin = user?.email === "eldritch.tenebris1@gmail.com";

  const { data: backups = [], isLoading } = useQuery({
    queryKey: ["backups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backups")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isMasterAdmin,
  });

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      if (!session?.access_token) throw new Error("Sessão expirada. Faça login novamente.");

      const { data, error } = await supabase.functions.invoke("create-backup", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Backup realizado com sucesso!");
      qc.invalidateQueries({ queryKey: ["backups"] });
    },
    onError: (err: any) => {
      toast.error("Erro ao realizar backup: " + err.message);
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!isMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <ShieldAlert size={64} className="text-destructive opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Acesso Restrito</h2>
        <p className="text-muted-foreground max-w-sm">Esta área é exclusiva para o administrador mestre do sistema.</p>
      </div>
    );
  }

  const downloadBackup = async (filePath: string, name: string) => {
    const { data, error } = await supabase.storage
      .from("backups")
      .download(filePath);
    
    if (error) {
      toast.error("Erro ao baixar arquivo: " + error.message);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-reveal">
      <PageHeader 
        title="Backup Master" 
        description="Sistema de redundância e salvamento de dados crítico"
        action={
          <Button 
            onClick={() => createBackupMutation.mutate()}
            disabled={createBackupMutation.isPending}
            className="rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] gap-2 h-14 px-8 shadow-glow"
          >
            {createBackupMutation.isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Database size={20} strokeWidth={3} />
            )}
            Gerar Backup Agora
          </Button>
        }
      />

      <div className="grid gap-6">
        <div className="premium-card p-8 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent">Status do Sistema</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                Backups diários automáticos ativos • Redundância Supabase
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground/60 leading-relaxed max-w-2xl">
            Este sistema realiza o snapshot de todas as tabelas operacionais (Produtos, Movimentações, Funcionários e Configurações). 
            Os arquivos são criptografados e armazenados em bucket privado com acesso exclusivo via chave mestre.
          </div>
        </div>

        <div className="premium-card overflow-hidden border-white/5 bg-card/30">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
            <History size={18} className="text-muted-foreground/40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Histórico de Snapshots</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.01] text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/30 border-b border-white/5">
                  <th className="px-6 py-4 text-left">Arquivo</th>
                  <th className="px-6 py-4 text-center">Tamanho</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Data / Hora</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                    </td>
                  </tr>
                ) : backups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 font-black uppercase tracking-widest italic">
                      Nenhum backup registrado.
                    </td>
                  </tr>
                ) : (
                  backups.map((b) => (
                    <tr key={b.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/5 text-muted-foreground/40 group-hover:text-primary transition-colors">
                            <FileJson size={16} />
                          </div>
                          <span className="font-bold tracking-tight text-foreground">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-[10px] font-bold text-muted-foreground/40 tabular-nums">
                        {(Number(b.size_bytes || 0) / 1024).toFixed(1)} KB
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/10 text-success text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={10} /> Concluído
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-[11px] font-bold text-foreground tabular-nums">
                          {new Date(b.created_at).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                          {new Date(b.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground transition-all"
                          onClick={() => downloadBackup(b.file_path, b.name)}
                        >
                          <Download size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
