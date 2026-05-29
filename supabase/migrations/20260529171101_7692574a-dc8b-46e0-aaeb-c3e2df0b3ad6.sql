REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.user_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.user_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.user_role) TO authenticated;