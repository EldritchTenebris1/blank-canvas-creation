import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []) as Category[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const saveMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: any; id?: string }) => {
      if (id) {
        const { data, error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;

        // If name changed, update all products that use this category
        if (payload.name) {
          await supabase
            .from("products")
            .update({ category: payload.name })
            .eq("category_id", id);
        }

        return data;
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria salva com sucesso");
    },
    onError: (error) => {
      console.error("Error saving category:", error);
      toast.error("Erro ao salvar categoria");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida com sucesso");
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast.error("Erro ao remover categoria. Verifique se existem produtos vinculados.");
    },
  });

  return {
    ...query,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
