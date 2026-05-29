-- 1. Create a private schema for security functions
CREATE SCHEMA IF NOT EXISTS auth_utils;

-- 2. Move has_role logic to the new schema
CREATE OR REPLACE FUNCTION auth_utils.has_role(_user_id uuid, _role user_role)
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

-- 3. Revoke all from PUBLIC on the new schema/function
REVOKE ALL ON SCHEMA auth_utils FROM PUBLIC;
REVOKE ALL ON FUNCTION auth_utils.has_role(uuid, user_role) FROM PUBLIC;
GRANT USAGE ON SCHEMA auth_utils TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_utils.has_role(uuid, user_role) TO authenticated, service_role;

-- 4. Drop ALL policies that use public.has_role
DROP POLICY IF EXISTS "Only admins can modify roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can modify products" ON public.products;
DROP POLICY IF EXISTS "Only admins can modify categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can modify employees" ON public.employees;
DROP POLICY IF EXISTS "Only admins can modify settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only admins can modify fuel tanks" ON public.fuel_tanks;
DROP POLICY IF EXISTS "Only admins can modify fuel pumps" ON public.fuel_pumps;
DROP POLICY IF EXISTS "Only admins can modify pump nozzles" ON public.pump_nozzles;
DROP POLICY IF EXISTS "Update stock based on role and location" ON public.stock_items;
DROP POLICY IF EXISTS "Admins can manage movements" ON public.movements;
DROP POLICY IF EXISTS "Admins can insert app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can update app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can delete app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
DROP POLICY IF EXISTS "admins manage movements" ON public.movements;
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage employees" ON public.employees;
DROP POLICY IF EXISTS "admins manage products" ON public.products;
DROP POLICY IF EXISTS "admins manage settings" ON public.app_settings;
DROP POLICY IF EXISTS "Enable write for admins" ON public.fuel_tanks;
DROP POLICY IF EXISTS "Enable write for admins" ON public.fuel_pumps;
DROP POLICY IF EXISTS "Enable write for admins" ON public.pump_nozzles;

-- 5. Drop the old function now that dependencies are gone
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role);
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- 6. Re-create all policies using auth_utils.has_role

-- user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (auth_utils.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'));

-- products
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated
  USING (auth_utils.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'));

-- categories
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (auth_utils.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'));

-- employees
CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL TO authenticated
  USING (auth_utils.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'));

-- app_settings
CREATE POLICY "Admins can manage settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (auth_utils.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'));

-- movements
CREATE POLICY "Admins can manage movements" ON public.movements
  FOR ALL TO authenticated
  USING (auth_utils.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'));

-- stock_items
CREATE POLICY "Update stock based on role and location" ON public.stock_items
  FOR UPDATE TO authenticated
  USING (location = 'pista' OR auth_utils.has_role(auth.uid(), 'admin'))
  WITH CHECK (location = 'pista' OR auth_utils.has_role(auth.uid(), 'admin'));

-- fuel_tanks, fuel_pumps, pump_nozzles
CREATE POLICY "Admins manage fuel tanks" ON public.fuel_tanks
  FOR ALL TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage fuel pumps" ON public.fuel_pumps
  FOR ALL TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage pump nozzles" ON public.pump_nozzles
  FOR ALL TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'));
