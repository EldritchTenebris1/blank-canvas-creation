-- Revoke direct execution from public roles to prevent Data API abuse
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, user_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, user_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, user_role) FROM anon;

-- Re-grant to authenticated/service_role if you want them to be able to call it in SELECTs
-- but usually RLS policies run with enough privilege if calling it internally.
-- Actually, if an RLS policy uses it, and the user doesn't have EXECUTE, the policy might fail.
-- Let's grant it specifically to authenticated and service_role but keep it away from 'PUBLIC'.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, user_role) TO service_role;
