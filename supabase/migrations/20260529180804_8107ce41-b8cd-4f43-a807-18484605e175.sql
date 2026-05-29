-- Add missing policies for app_settings
CREATE POLICY "Admins can insert app settings" ON public.app_settings
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.user_role));

CREATE POLICY "Admins can update app settings" ON public.app_settings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.user_role));

CREATE POLICY "Admins can delete app settings" ON public.app_settings
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.user_role));

-- Ensure proper grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
