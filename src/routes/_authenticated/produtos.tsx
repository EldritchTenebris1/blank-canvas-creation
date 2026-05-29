import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Package, Tag, Hash, DollarSign, ArrowDownToLine, Search, Settings2 } from "lucide-react";
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
    <motion.tr 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="group transition-colors hover:bg-white/5"
    >
      <td className="px-6 py-5">
        <div className="font-bold tracking-tight text-foreground">{p.name}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          {p.brand ?? "—"} · {p.category ?? "—"}
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="bg-white/5 px-3 py-1.5 rounded-xl font-mono text-xs text-muted-foreground border border-white/5 group-hover:border-primary/20 group-hover:text-primary transition-colors">
          {p.internal_code ?? "—"}
        </span>
      </td>
      <td className={cn("px-6 py-5 text-right font-black tabular-nums", p.pista_qty < p.pista_min ? "text-destructive" : "text-primary")}>
        {p.pista_qty}
      </td>
      <td className={cn("px-6 py-5 text-right font-black tabular-nums", p.estoque_qty < p.estoque_min ? "text-destructive" : "text-foreground")}>
        {p.estoque_qty}
      </td>
      <td className="px-6 py-5 text-right font-medium text-muted-foreground tabular-nums">
        R$ {Number(p.cost_price).toFixed(2)}
      </td>
      <td className="px-6 py-5 text-right font-black text-primary tabular-nums">
        R$ {Number(p.sale_price).toFixed(2)}
      </td>
      <td className="px-6 py-5 text-right">
        <span className="bg-primary/10 px-3 py-1.5 rounded-xl text-xs font-black text-primary border border-primary/20">
          {margin.toFixed(0)}%
        </span>
      </td>
      <td className="px-6 py-5">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => onEdit(p)}><Pencil size={14} /></Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => onDelete(p.id)}><Trash2 size={14} /></Button>
        </div>
      </td>
    </motion.tr>
  );
});

ProductRow.displayName = "ProductRow";

const ProductCard = React.memo(({ p, onEdit, onDelete }: { p: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void }) => {
  const lowPista = p.pista_qty < p.pista_min;
  const lowEstoque = p.estoque_qty < p.estoque_min;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card p-5 space-y-5 border-white/5 active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-bold text-lg tracking-tight truncate">{p.name}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">
            {p.brand ?? "S/M"} · {p.category ?? "S/C"}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="icon" variant="ghost" className="h-10 w-10 bg-white/5 rounded-xl" onClick={() => onEdit(p)}><Pencil size={14} /></Button>
          <Button size="icon" variant="ghost" className="h-10 w-10 bg-destructive/10 rounded-xl text-destructive" onClick={() => onDelete(p.id)}><Trash2 size={14} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Pista</div>
          <div className={cn("text-xl font-black tabular-nums", lowPista ? "text-destructive" : "text-primary")}>
            {p.pista_qty} <span className="text-xs text-muted-foreground/30 font-bold">/ {p.pista_min}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Estoque</div>
          <div className={cn("text-xl font-black tabular-nums", lowEstoque ? "text-destructive" : "text-foreground")}>
            {p.estoque_qty} <span className="text-xs text-muted-foreground/30 font-bold">/ {p.estoque_min}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-[10px] text-muted-foreground/60">{p.internal_code || "N/A"}</div>
        <div className="text-right">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">Preço Venda</div>
          <div className="text-lg font-black text-primary tabular-nums">R$ {Number(p.sale_price).toFixed(2)}</div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

function ProdutoForm({ initial, onDone }: { initial?: Partial<Product>; onDone: () => void }) {
  const [f, setF] = React.useState<Partial<Product & { category_id?: string | null }>>(
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
      category_id: f.category_id ?? null,
    };

    try {
      await save({ payload, id: initial?.id });
      onDone();
    } catch (e) {
      // Error handled by mutation
    }
  }

  const handleCategoryChange = (name: string) => {
    const cat = categories.find(c => c.name === name);
    setF({ ...f, category: name, category_id: cat?.id || null });
  };

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
            onValueChange={handleCategoryChange}
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

function CategoryManagementDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: categories = [], save, remove, isSaving } = useCategories();
  const [newCategory, setNewCategory] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    await save({ payload: { name: newCategory.trim() } });
    setNewCategory("");
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;
    await save({ payload: { name: editValue.trim() }, id });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    await remove(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] rounded-3xl border-white/5 bg-background/95 backdrop-blur-2xl shadow-premium">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">Categorias</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova categoria..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="h-11 bg-background/50 border-border/50"
            />
            <Button onClick={handleAdd} disabled={isSaving} size="icon" className="shrink-0 h-11 w-11">
              <Plus size={20} />
            </Button>
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group">
                {editingId === c.id ? (
                  <div className="flex flex-1 gap-2 mr-2">
                    <Input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(c.id)}
                      className="h-9 bg-background/50 border-border/50"
                    />
                    <Button size="sm" onClick={() => handleUpdate(c.id)} disabled={isSaving}>OK</Button>
                  </div>
                ) : (
                  <span className="font-medium text-sm pl-2">{c.name}</span>
                )}
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingId(c.id);
                      setEditValue(c.name);
                    }}
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProdutosPage() {
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [open, setOpen] = React.useState(false);
  const [catOpen, setCatOpen] = React.useState(false);
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
    <div className="space-y-8 pb-20 md:pb-0">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl text-gradient">Catálogo</h1>
          <p className="text-sm text-muted-foreground">Gerencie o portfólio de produtos e níveis de segurança.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="lg" onClick={() => setCatOpen(true)} className="w-full sm:w-auto border-white/5 bg-white/5">
            <Settings2 size={20} className="mr-2" /> Categorias
          </Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto shadow-glow-primary">
                <Plus size={20} className="mr-2" /> Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] rounded-3xl md:w-full border-white/5 bg-background/95 backdrop-blur-2xl shadow-premium">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tighter">
                  {editing ? "Refinar Produto" : "Novo Item"}
                </DialogTitle>
              </DialogHeader>
              <ProdutoForm initial={editing ?? undefined} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <CategoryManagementDialog open={catOpen} onOpenChange={setCatOpen} />

      <div className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" size={18} />
        <Input 
          placeholder="Busca instantânea..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-11 h-12 bg-white/5 border-white/5 focus:bg-white/10" 
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Desktop View: Table */}
          <div className="hidden md:block premium-card border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Produto</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">ID Interno</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Pista</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Estoque</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Custo</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Venda</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Margem</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((p) => (
                    <ProductRow key={p.id} p={p} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View: Cards */}
          <div className="grid gap-4 md:hidden">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="premium-card p-24 text-center border-white/5">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/5 text-muted-foreground/20">
                <Package size={40} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Nenhum item encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground/60">Tente ajustar sua busca ou cadastrar um novo produto.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
