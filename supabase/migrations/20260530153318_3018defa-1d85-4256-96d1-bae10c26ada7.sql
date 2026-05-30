ALTER TABLE public.fuel_tanks
  DROP CONSTRAINT IF EXISTS fuel_tanks_product_id_fkey;

ALTER TABLE public.fuel_tanks
  ADD CONSTRAINT fuel_tanks_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;