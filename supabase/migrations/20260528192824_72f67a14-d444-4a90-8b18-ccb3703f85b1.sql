
-- Fix mutable search path on set_updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Revoke broad execute on trigger-only function
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- has_role must remain executable by authenticated for RLS policies to work
