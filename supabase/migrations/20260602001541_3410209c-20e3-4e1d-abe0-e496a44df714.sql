REVOKE EXECUTE ON FUNCTION public.register_sale(jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.register_sale(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.register_sale(jsonb) TO authenticated;