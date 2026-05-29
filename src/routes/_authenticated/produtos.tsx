import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Package, Tag, Hash, DollarSign, ArrowDownToLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/buriti/PageHeader";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/produtos")({ component: ProdutosPage });

type Product = {
  id: string;
  name: string;
  category: string | null;
  brand: string | null;
  internal_code: string | null;
  barcode: string | null;
  description: string | null;
  pista_qty: number;
  estoque_qty: number;
  pista_min: number;
  estoque_min: number;
  cost_price: number;
  sale_price: number;
};

function ProdutoForm({ initial, onDone }: { initial?: Partial<Product>; onDone: () => void }) {
  const [f, setF] = React.useState<Partial<Product>>(
    initial ?? { pista_min: 5, estoque_min: 10, cost_price: 0, sale_price: 0 },
  );
  const [loading, setLoading] = React.useState(false);
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("name").order("name");
      return data || [];
    },
  });

  async function save() {
    if (!f.name) return toast.error("Nome obrigatório");
    setLoading(true);
    const payload = {
      name: f.name!,
      category: f.category ?? null,
      internal_code: f.internal_code ?? null,
      sale_price: Number(f.sale_price ?? 0),
      pista_min: Number(f.pista_min ?? 0),
      estoque_min: Number(f.estoque_min ?? 0),
      // Keep existing values for other fields if they exist
      brand: f.brand ?? null,
      barcode: f.barcode ?? null,
      cost_price: Number(f.cost_price ?? 0),
    };
    const { error } = initial?.id
      ? await supabase.from("products").update(payload).eq("id", initial.id)
      : await supabase.from("products").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Produto salvo com sucesso");
    qc.invalidateQueries({ queryKey: ["products"] });
    onDone();
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Package size={14} className="text-accent" /> Nome do Produto
          </Label>
          <Input
            placeholder="Ex: Óleo 5W30 Sintético"
            value={f.name ?? ""}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            className="h-11 bg-background/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Tag size={14} className="text-accent" /> Categoria
          </Label>
          <Select
            value={f.category ?? ""}
            onValueChange={(v) => setF({ ...f, category: v })}
          >
            <SelectTrigger className="h-11 bg-background/50 border-border/50">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Hash size={14} className="text-accent" /> Código Interno
          </Label>
          <Input
            placeholder="Ex: LUB001"
            value={f.internal_code ?? ""}
            onChange={(e) => setF({ ...f, internal_code: e.target.value })}
            className="h-11 bg-background/50 border-border/50 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <DollarSign size={14} className="text-accent" /> Preço de Venda (R$)
          </Label>
          <Input
            type="number"
            step="0.01"
            value={f.sale_price ?? ""}
            onChange={(e) => setF({ ...f, sale_price: Number(e.target.value) })}
            className="h-11 bg-background/50 border-border/50 text-accent font-semibold"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            Custo (R$) - Opcional
          </Label>
          <Input
            type="number"
            step="0.01"
            value={f.cost_price ?? ""}
            onChange={(e) => setF({ ...f, cost_price: Number(e.target.value) })}
            className="h-11 bg-background/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <ArrowDownToLine size={14} className="text-destructive" /> Mín. na Pista
          </Label>
          <Input
            type="number"
            value={f.pista_min ?? ""}
            onChange={(e) => setF({ ...f, pista_min: Number(e.target.value) })}
            className="h-11 bg-background/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <ArrowDownToLine size={14} className="text-destructive" /> Mín. no Estoque
          </Label>
          <Input
            type="number"
            value={f.estoque_min ?? ""}
            onChange={(e) => setF({ ...f, estoque_min: Number(e.target.value) })}
            className="h-11 bg-background/50 border-border/50"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-accent/5 p-4 text-xs text-muted-foreground leading-relaxed">
        <p>💡 <strong>Atenção:</strong> O controle de quantidades atuais é feito diretamente nas páginas de <span className="text-foreground font-medium">Pista</span> e <span className="text-foreground font-medium">Estoque</span> para garantir o registro correto das movimentações.</p>
      </div>

      <Button
        onClick={save}
        disabled={loading}
        className="w-full h-12 text-base font-bold shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: "var(--gradient-accent)", color: "oklch(0.18 0.04 255)" }}
      >
        {loading ? <Loader2 className="animate-spin" /> : editing ? "Atualizar Produto" : "Cadastrar Produto"}
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