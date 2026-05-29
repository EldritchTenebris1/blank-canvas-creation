-- Clean up movements policies
DROP POLICY IF EXISTS "Movements are viewable by authenticated users" ON public.movements;
DROP POLICY IF EXISTS "Users can insert their own movements" ON public.movements;
DROP POLICY IF EXISTS "auth read movements" ON public.movements;
DROP POLICY IF EXISTS "admins manage movements" ON public.movements;
DROP POLICY IF EXISTS "frentistas insert sales" ON public.movements;

CREATE POLICY "Admins can manage movements" 
ON public.movements FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own movements" 
ON public.movements FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movements" 
ON public.movements FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Clean up employees policies
DROP POLICY IF EXISTS "Employees are viewable by authenticated users" ON public.employees;
DROP POLICY IF EXISTS "frentista reads self" ON public.employees;
DROP POLICY IF EXISTS "Only admins can modify employees" ON public.employees;

CREATE POLICY "Admins can manage employees" 
ON public.employees FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own employee record" 
ON public.employees FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- App Settings
DROP POLICY IF EXISTS "App settings are viewable by everyone" ON public.app_settings;
DROP POLICY IF EXISTS "auth read settings" ON public.app_settings;
DROP POLICY IF EXISTS "admins manage settings" ON public.app_settings;

CREATE POLICY "Settings are viewable by authenticated users" 
ON public.app_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage settings" 
ON public.app_settings FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
