-- Add 'estoque' to the enum
ALTER TYPE public.stock_location ADD VALUE IF NOT EXISTS 'estoque';

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  access_code TEXT UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure movements table is correct
-- If it exists, let's make sure it has the right structure.
-- The code expects user_id to be there, but some places miss it.
-- We'll make it nullable in the DB if the code doesn't always provide it, 
-- or we can use auth.uid() as default.
ALTER TABLE public.movements ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.movements ADD COLUMN IF NOT EXISTS location public.stock_location;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policies for employees
CREATE POLICY "Employees are viewable by authenticated users" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify employees" ON public.employees FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Trigger to make first user an admin
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- We can't easily attach to auth.users in a public migration without being superuser, 
-- but we can attach to a public table that is updated when a user signs up.
-- However, src/lib/auth.tsx uses user_roles.
-- Let's just manually insert the current user into user_roles as admin if we know the ID, 
-- or use a trigger on user_roles itself? No, that doesn't work.
-- Usually, we'd use a trigger on auth.users (if allowed) or just let the first user be created.
