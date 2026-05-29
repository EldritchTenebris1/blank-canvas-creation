-- Create custom types
CREATE TYPE public.user_role AS ENUM ('frentista', 'admin');
CREATE TYPE public.transaction_type AS ENUM ('venda', 'entrada', 'reposicao', 'ajuste');
CREATE TYPE public.stock_location AS ENUM ('pista', 'principal');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'frentista',
  access_code TEXT UNIQUE, -- for frentista quick login
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  brand TEXT,
  internal_code TEXT UNIQUE,
  barcode TEXT,
  description TEXT,
  image_url TEXT,
  cost_price DECIMAL(12,2),
  selling_price DECIMAL(12,2) NOT NULL,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_items table (mapping products to locations)
CREATE TABLE public.stock_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location public.stock_location NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE(product_id, location)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  type public.transaction_type NOT NULL,
  from_location public.stock_location,
  to_location public.stock_location,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2), -- selling price at time of transaction
  total_price DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;

GRANT SELECT ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.stock_items TO authenticated;
GRANT ALL ON public.stock_items TO service_role;

GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policies for products
CREATE POLICY "Products are viewable by authenticated users" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify products" ON public.products FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for categories
CREATE POLICY "Categories are viewable by authenticated users" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify categories" ON public.categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for stock_items
CREATE POLICY "Stock items are viewable by authenticated users" ON public.stock_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can update main stock" ON public.stock_items FOR UPDATE TO authenticated USING (
  location = 'pista' OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Anyone can update pista stock" ON public.stock_items FOR UPDATE TO authenticated USING (true);

-- Policies for transactions
CREATE POLICY "Transactions are viewable by authenticated users" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can create transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
