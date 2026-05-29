import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Database } from "@/integrations/supabase/types";

type TransactionType = Database["public"]["Enums"]["transaction_type"];
type StockLocation = Database["public"]["Enums"]["stock_location"];

export const productSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
  category: z.string().nullable(),
  internal_code: z.string().nullable(),
  sale_price: z.coerce.number().min(0, "O preço de venda não pode ser negativo"),
  cost_price: z.coerce.number().min(0, "O preço de custo não pode ser negativo"),
  pista_min: z.coerce.number().min(0, "O mínimo na pista não pode ser negativo"),
  estoque_min: z.coerce.number().min(0, "O mínimo no estoque não pode ser negativo"),
});

export type Product = z.infer<typeof productSchema> & {
  id: string;
  brand: string | null;
  barcode: string | null;
  description: string | null;
  pista_qty: number;
  estoque_qty: number;
};

export function useProducts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Product[];
    },
    refetchInterval: 10000, 
  });

  const saveMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: any; id?: string }) => {
      const { error } = id
        ? await supabase.from("products").update(payload).eq("id", id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto salvo com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar produto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir produto");
    },
  });

  const moveStockMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      delta, 
      location, 
      type 
    }: { 
      productId: string; 
      delta: number; 
      location: StockLocation; 
      type: TransactionType;
    }) => {
      const product = query.data?.find(p => p.id === productId);
      if (!product) throw new Error("Produto não encontrado");

      let updatePayload: Database["public"]["Tables"]["products"]["Update"] = {};
      let currentQty = 0;

      if (location === "pista") {
        currentQty = product.pista_qty || 0;
        updatePayload.pista_qty = currentQty + delta;
      } else if (location === "estoque") {
        currentQty = product.estoque_qty || 0;
        updatePayload.estoque_qty = currentQty + delta;
      } else {
        throw new Error("Localização inválida para movimentação manual");
      }

      if ((updatePayload.pista_qty ?? 0) < 0 || (updatePayload.estoque_qty ?? 0) < 0) {
        throw new Error("Quantidade insuficiente");
      }

      const { error: updateError } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", productId);

      if (updateError) throw updateError;

      const { error: movementError } = await supabase.from("movements").insert({
        product_id: productId,
        type,
        quantity: Math.abs(delta),
        location,
        user_id: user?.id,
      });

      if (movementError) throw movementError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  return {
    ...query,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    moveStock: moveStockMutation.mutateAsync,
    isMoving: moveStockMutation.isPending,
  };
}
