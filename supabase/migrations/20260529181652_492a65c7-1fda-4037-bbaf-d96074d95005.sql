-- 1. Refine user_roles SELECT policy
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT TO authenticated 
USING (auth_utils.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" 
ON public.user_roles FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- 2. Refine profiles SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth_utils.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth.uid() = id); -- Assuming profiles.id is user_id

-- 3. Refine transactions SELECT policy (if it exists)
DROP POLICY IF EXISTS "Transactions are viewable by authenticated users" ON public.transactions;

CREATE POLICY "Admins can view all transactions" 
ON public.transactions FOR SELECT TO authenticated 
USING (auth_utils.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT TO authenticated 
USING (auth.uid() = user_id);
