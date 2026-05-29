-- Fix products table columns
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'selling_price') THEN
    ALTER TABLE public.products RENAME COLUMN selling_price TO sale_price;
  END IF;
END $$;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS pista_qty INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS estoque_qty INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS pista_min INTEGER NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS estoque_min INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'frentista',
  UNIQUE(user_id, role)
);

-- Create movements table
CREATE TABLE IF NOT EXISTS public.movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type public.transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  location public.stock_location NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT ON public.movements TO authenticated;
GRANT ALL ON public.movements TO service_role;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Users can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify roles" ON public.user_roles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policies for movements
CREATE POLICY "Movements are viewable by authenticated users" ON public.movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own movements" ON public.movements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies for app_settings
CREATE POLICY "App settings are viewable by everyone" ON public.app_settings FOR SELECT TO authenticated USING (true);

-- Seed initial data
INSERT INTO public.categories (name) VALUES ('Lubrificantes'), ('Aditivos'), ('Fluidos'), ('Filtros'), ('Acessórios') ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, brand, category, internal_code, pista_qty, estoque_qty, pista_min, estoque_min, cost_price, sale_price) 
VALUES 
('Óleo 5W30 Sintético', 'Ipiranga', 'Lubrificantes', 'LUB001', 12, 50, 5, 10, 30.00, 45.90),
('Óleo 15W40 Mineral', 'Ipiranga', 'Lubrificantes', 'LUB002', 8, 40, 5, 10, 25.00, 38.00),
('Aditivo Radiador', 'STP', 'Aditivos', 'ADT001', 3, 15, 8, 10, 15.00, 28.00),
('Fluido de Freio DOT 4', 'Bosch', 'Fluidos', 'FLD001', 10, 20, 5, 5, 20.00, 32.00),
('Água Desmineralizada', 'Radnaq', 'Fluidos', 'FLD002', 25, 100, 10, 20, 4.00, 8.50)
ON CONFLICT DO NOTHING;

INSERT INTO public.app_settings (key, value) VALUES ('monthly_goal', '5000') ON CONFLICT (key) DO UPDATE SET value = '5000';
