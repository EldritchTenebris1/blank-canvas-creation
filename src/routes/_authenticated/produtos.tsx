import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/buriti/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/produtos")({ component: ProdutosPage });

type Product = {
  id: string; name: string; category: string | null; brand: string | null;
  internal_code: string | null; barcode: string | null; description: string | null;
  pista_qty: number; estoque_qty: number; pista_min: number; estoque_min: number;
  cost_price: number; sale_price: number;
};

function ProdutoForm({ initial, onDone }: { initial?: Partial<Product>; onDone: () => void }) {
  const [f, setF] = React.useState<Partial<Product>>(
    initial ?? { pista_min: 5, estoque_min: 10, cost_price: 0, sale_price: 0 },
  );
  const [loading, setLoading] = React.useState(false);
  const qc = useQueryClient();

  async function save() {
    if (!f.name) return toast.error("Nome obrigatório");
    setLoading(true);
    // Do NOT include pista_qty / estoque_qty here — those are managed in /pista and /estoque.
    const payload = {
      name: f.name!,
      category: f.category ?? null,
      brand: f.brand ?? null,
      internal_code: f.internal_code ?? null,
      barcode: f.barcode ?? null,
      description: f.description ?? null,
      cost_price: Number(f.cost_price ?? 0),
      sale_price: Number(f.sale_price ?? 0),
      pista_min: Number(f.pista_min ?? 0),
      estoque_min: Number(f.estoque_min ?? 0),
    };
    const { error } = initial?.id
      ? await supabase.from("products").update(payload).eq("id", initial.id)
      : await supabase.from("products").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    qc.invalidateQueries({ queryKey: ["products"] });
    onDone();
  }

  const fields: [keyof Product, string, string?][] = [
    ["name", "Nome"],
    ["category", "Categoria"],
    ["brand", "Marca"],
    ["internal_code", "Código interno"],
    ["barcode", "Código de barras"],
    ["cost_price", "Custo (R$)", "number"],
    ["sale_price", "Venda (R$)", "number"],
    ["pista_min", "Mín. na Pista", "number"],
    ["estoque_min", "Mín. no Estoque", "number"],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([k, label, type]) => (
          <div key={k}>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <Input
              type={type ?? "text"}
              value={(f[k] as string | number | undefined) ?? ""}
              onChange={(e) =>
                setF({ ...f, [k]: type === "number" ? Number(e.target.value) : e.target.value })
              }
            />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/40 bg-card/30 p-3 text-xs text-muted-foreground">
        💡 As <strong className="text-foreground">quantidades em Pista e Estoque</strong> são
        controladas nas páginas <strong className="text-foreground">Pista</strong> e{" "}
        <strong className="text-foreground">Estoque</strong>, com registro automático em
        Movimentações.
      </div>
      <Button
        onClick={save}
        disabled={loading}
        className="w-full"
        style={{ background: "var(--gradient-primary)" }}
      >
        {loading ? <Loader2 className="animate-spin" /> : "Salvar"}
      </Button>
    </div>
  );
}

function ProdutosPage() {
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const qc = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      return (data ?? []) as Product[];
    },
    refetchInterval: 5000,
  });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.internal_code?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()),
  );

  async function remove(id: string) {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Cadastro completo do catálogo"
        action={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button style={{ background: "var(--gradient-accent)", color: "oklch(0.18 0.04 255)" }}>
                <Plus size={16} /> Novo produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
              <ProdutoForm initial={editing ?? undefined} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mb-4">
        <Input placeholder="Buscar por nome, código ou marca..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
      </div>
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-right">Pista</th>
              <th className="px-4 py-3 text-right">Estoque</th>
              <th className="px-4 py-3 text-right">Custo</th>
              <th className="px-4 py-3 text-right">Venda</th>
              <th className="px-4 py-3 text-right">Margem</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const margin = p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0;
              return (
                <tr key={p.id} className="border-t border-border/40 transition hover:bg-card/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand ?? "—"} · {p.category ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.internal_code ?? "—"}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${p.pista_qty < p.pista_min ? "text-destructive" : ""}`}>{p.pista_qty}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${p.estoque_qty < p.estoque_min ? "text-destructive" : ""}`}>{p.estoque_qty}</td>
                  <td className="px-4 py-3 text-right">R$ {Number(p.cost_price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">R$ {Number(p.sale_price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-accent">{margin.toFixed(0)}%</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Pencil size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhum produto cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}