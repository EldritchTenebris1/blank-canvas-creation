import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("name").order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60, // Categories change rarely
  });
}
