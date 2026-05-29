import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus, Trash2, Loader2, KeyRound, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/buriti/PageHeader";
import { createEmployeeFn, deleteEmployeeFn, toggleEmployeeFn } from "@/lib/employees.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/funcionarios")({ component: FuncionariosPage });

type Employee = { id: string; name: string; access_code: string; active: boolean; created_at: string };

function FuncionariosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const createEmp = useServerFn(createEmployeeFn);
  const deleteEmp = useServerFn(deleteEmployeeFn);
  const toggleEmp = useServerFn(toggleEmployeeFn);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () =>
      ((await supabase.from("employees").select("*").order("access_code")).data ?? []) as Employee[],
    refetchInterval: 5000,
  });

  const [form, setForm] = React.useState({ name: "", access_code: "", pin: "" });
  const [saving, setSaving] = React.useState(false);

  async function save() {
    if (!form.name || !form.access_code || !form.pin) return toast.error("Preencha todos os campos");
    setSaving(true);
    try {
      await createEmp({ data: form });
      toast.success("Frentista criado");
      setForm({ name: "", access_code: "", pin: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm("Excluir este frentista?")) return;
    try {
      await deleteEmp({ data: { id } });
      toast.success("Excluído");
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  async function toggle(id: string, active: boolean) {
    try {
      await toggleEmp({ data: { id, active } });
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div>
      <PageHeader
        title="Funcionários"
        description="Gerencie frentistas e códigos de acesso"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button style={{ background: "var(--gradient-accent)", color: "oklch(0.18 0.04 255)" }}>
                <UserPlus size={16} /> Novo frentista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo frentista</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome completo</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Código de acesso (1-3 dígitos)</label>
                  <Input value={form.access_code} maxLength={3} onChange={(e) => setForm({ ...form, access_code: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Senha numérica (2-4 dígitos)</label>
                  <Input type="password" value={form.pin} maxLength={4} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} />
                </div>
                <Button onClick={save} disabled={saving} style={{ background: "var(--gradient-primary)" }}>
                  {saving ? <Loader2 className="animate-spin" /> : "Criar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((e) => (
          <div key={e.id} className={`glass rounded-2xl p-5 ${!e.active ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <KeyRound size={11} /> Código <span className="font-mono font-bold text-accent">{e.access_code}</span>
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                {e.name[0]?.toUpperCase()}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
              <div className="flex items-center gap-2 text-xs">
                <Power size={12} /> <Switch checked={e.active} onCheckedChange={(v) => toggle(e.id, v)} />
                <span className="text-muted-foreground">{e.active ? "Ativo" : "Inativo"}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(e.id)}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {employees.length === 0 && (
          <div className="glass col-span-full rounded-2xl p-12 text-center text-sm text-muted-foreground">
            Nenhum frentista cadastrado. Crie o primeiro para começar.
          </div>
        )}
      </div>
    </div>
  );
}