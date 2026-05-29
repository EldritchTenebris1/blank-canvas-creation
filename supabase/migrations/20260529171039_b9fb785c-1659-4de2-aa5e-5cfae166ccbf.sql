-- Função security definer para checar cargo sem disparar RLS recursivo
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- user_roles: remover política recursiva e recriar usando has_role
DROP POLICY IF EXISTS "Only admins can modify roles" ON public.user_roles;
CREATE POLICY "Only admins can modify roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- products
DROP POLICY IF EXISTS "Only admins can modify products" ON public.products;
CREATE POLICY "Only admins can modify products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- categories
DROP POLICY IF EXISTS "Only admins can modify categories" ON public.categories;
CREATE POLICY "Only admins can modify categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- employees
DROP POLICY IF EXISTS "Only admins can modify employees" ON public.employees;
CREATE POLICY "Only admins can modify employees" ON public.employees
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- stock_items
DROP POLICY IF EXISTS "Only admins can update main stock" ON public.stock_items;
DROP POLICY IF EXISTS "Update stock based on role and location" ON public.stock_items;
CREATE POLICY "Update stock based on role and location" ON public.stock_items
  FOR UPDATE TO authenticated
  USING (location = 'pista' OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (location = 'pista' OR public.has_role(auth.uid(), 'admin'));
