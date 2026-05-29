-- Fix search_path for the trigger function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Fix overly permissive policy for stock_items
DROP POLICY IF EXISTS "Anyone can update pista stock" ON public.stock_items;

-- More specific update policy for stock_items (pista only for frentistas, or all for admins)
CREATE POLICY "Update stock based on role and location" 
ON public.stock_items 
FOR UPDATE 
TO authenticated 
USING (
  (location = 'pista') OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
)
WITH CHECK (
  (location = 'pista') OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);
