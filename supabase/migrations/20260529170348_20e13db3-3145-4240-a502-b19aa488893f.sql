-- Fix search_path for the function
ALTER FUNCTION public.make_first_user_admin() SET search_path = public;

-- Attach trigger to profiles (assuming it's created on signup)
DROP TRIGGER IF EXISTS on_profile_created_admin ON public.profiles;
CREATE TRIGGER on_profile_created_admin
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.make_first_user_admin();

-- Also, let's make sure the trigger handles the case where user_roles is empty
-- and assigns the role correctly.
