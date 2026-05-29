import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Loader2, Package, Tag, Hash, DollarSign, ArrowDownToLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/buriti/PageHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProducts, productSchema, type Product } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/produtos")({ component: ProdutosPage });

const ProductRow = React.memo(({ p, onEdit, onDelete }: { p: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void }) => {
  const margin = p.sale_price > 0 ? ((p.sale_price - (p.cost_price || 0)) / p.sale_price) * 100 : 0;
  return (
    <tr className="transition-colors hover:bg-card/30">
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-800">{p.name}</div>
        <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60">
          {p.brand ?? "—"} · {p.category ?? "—"}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="bg-accent/5 px-2 py-1 rounded-md font-mono text-xs text-accent">
          {p.internal_code ?? "—"}
        </span>
      </td>
      <td className={cn("px-6 py-4 text-right font-bold", p.pista_qty < p.pista_min ? "text-destructive" : "text-accent")}>{p.pista_qty}</td>
      <td className={cn("px-6 py-4 text-right font-bold", p.estoque_qty < p.estoque_min ? "text-destructive" : "")}>{p.estoque_qty}</td>
      <td className="px-6 py-4 text-right font-medium">R$ {Number(p.cost_price).toFixed(2)}</td>
      <td className="px-6 py-4 text-right font-bold text-accent">R$ {Number(p.sale_price).toFixed(2)}</td>
      <td className="px-6 py-4 text-right">
        <span className="bg-accent/10 px-2 py-1 rounded-full text-xs font-black text-accent">
          {margin.toFixed(0)}%
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-accent/10 hover:text-accent" onClick={() => onEdit(p)}><Pencil size={15} /></Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(p.id)}><Trash2 size={15} /></Button>
        </div>
      </td>
    </tr>
  );
});

ProductRow.displayName = "ProductRow";

const ProductCard = React.memo(({ p, onEdit, onDelete }: { p: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void }) => {
  const lowPista = p.pista_qty < p.pista_min;
  const lowEstoque = p.estoque_qty < p.estoque_min;
  return (
    <div className="glass rounded-2xl p-4 space-y-4 border-none shadow-sm active:scale-[0.98] transition-transform">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-bold text-base leading-tight truncate">{p.name}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
            {p.brand ?? "S/M"} · {p.category ?? "S/C"}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="icon" variant="ghost" className="h-10 w-10 bg-accent/5 rounded-xl text-accent" onClick={() => onEdit(p)}><Pencil size={16} /></Button>
          <Button size="icon" variant="ghost" className="h-10 w-10 bg-destructive/5 rounded-xl text-destructive" onClick={() => onDelete(p.id)}><Trash2 size={16} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="text-[9px] font-black uppercase text-muted-foreground/70 mb-1">Pista</div>
          <div className={cn("text-lg font-black", lowPista ? "text-destructive" : "text-accent")}>
            {p.pista_qty} <span className="text-[10px] text-muted-foreground/60 font-medium">/ {p.pista_min}</span>
          </div>
        </div>
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="text-[9px] font-black uppercase text-muted-foreground/70 mb-1">Estoque</div>
          <div className={cn("text-lg font-black", lowEstoque ? "text-destructive" : "text-foreground")}>
            {p.estoque_qty} <span className="text-[10px] text-muted-foreground/60 font-medium">/ {p.estoque_min}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/10">
        <div className="text-xs font-mono text-muted-foreground">{p.internal_code || "N/A"}</div>
        <div className="text-right">
          <div className="text-[9px] font-bold uppercase text-muted-foreground/70">Venda</div>
          <div className="text-base font-black text-accent">R$ {Number(p.sale_price).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

function ProdutoForm({ initial, onDone }: { initial?: Partial<Product>; onDone: () => void }) {
  const [f, setF] = React.useState<Partial<Product>>(
    initial ?? { pista_min: 5, estoque_min: 10, cost_price: 0, sale_price: 0 },
  );
  const { save, isSaving } = useProducts();
  const { data: categories = [] } = useCategories();

  async function handleSave() {
    const result = productSchema.safeParse(f);
    if (!result.success) {
      return toast.error(result.error.errors[0].message);
    }

    const payload = {
      ...result.data,
      brand: f.brand ?? null,
      barcode: f.barcode ?? null,
    };

    try {
      await save({ payload, id: initial?.id });
      onDone();
    } catch (e) {
      // Error handled by mutation
    }
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
        onClick={handleSave}
        disabled={isSaving}
        className="w-full h-12 text-base font-bold shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: "var(--gradient-accent)", color: "oklch(0.18 0.04 255)" }}
      >
        {isSaving ? <Loader2 className="animate-spin" /> : initial ? "Atualizar Produto" : "Cadastrar Produto"}
      </Button>
    </div>
  );
}

function ProdutosPage() {
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { data: products = [], remove, isLoading } = useProducts();

  const filtered = React.useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.internal_code?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s),
    );
  }, [products, search]);

  const handleDelete = React.useCallback(async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await remove(id);
  }, [remove]);

  const handleEdit = React.useCallback((p: Product) => {
    setEditing(p);
    setOpen(true);
  }, []);

  return (
    <div className="space-y-[clamp(1rem,3vw,1.5rem)] pb-20 md:pb-0">
      <PageHeader
        title="Produtos"
        description="Cadastro completo do catálogo"
        action={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button 
                className="h-12 md:h-11 px-6 shadow-glow-accent transition-transform active:scale-95"
                style={{ background: "var(--gradient-accent)", color: "oklch(0.18 0.04 255)" }}
              >
                <Plus size={18} className="mr-2" /> Novo produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] rounded-2xl md:w-full">
              <DialogHeader><DialogTitle className="text-[clamp(1.25rem,4vw,1.5rem)]">{editing ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
              <ProdutoForm initial={editing ?? undefined} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" size={18} />
        <Input 
          placeholder="Buscar por nome, código ou marca..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-11 h-12 md:h-11 max-w-md bg-card/50 border-border/40 focus:bg-card transition-all" 
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : (
        <>
          {/* Desktop View: Table */}
          <div className="hidden md:block glass overflow-hidden rounded-2xl border-none shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card/40 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70">
                  <tr>
                    <th className="px-6 py-4 text-left">Produto</th>
                    <th className="px-6 py-4 text-left">Código</th>
                    <th className="px-6 py-4 text-right">Pista</th>
                    <th className="px-6 py-4 text-right">Estoque</th>
                    <th className="px-6 py-4 text-right">Custo</th>
                    <th className="px-6 py-4 text-right">Venda</th>
                    <th className="px-6 py-4 text-right">Margem</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filtered.map((p) => (
                    <ProductRow key={p.id} p={p} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View: Cards */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center text-muted-foreground border-none">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhum produto cadastrado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
