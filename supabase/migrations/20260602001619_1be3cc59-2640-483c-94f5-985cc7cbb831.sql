-- TABELA: shifts
CREATE TABLE public.shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_type text NOT NULL DEFAULT 'manha',
  responsible_user_id uuid NOT NULL,
  responsible_name text,
  conferente_user_id uuid,
  conferente_name text,
  cash_opening numeric NOT NULL DEFAULT 0,
  cash_closing numeric,
  status text NOT NULL DEFAULT 'aberto',
  notes text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view shifts"
ON public.shifts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can open shifts"
ON public.shifts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = responsible_user_id);

CREATE POLICY "Authenticated can update shifts"
ON public.shifts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage shifts"
ON public.shifts FOR ALL TO authenticated
USING (auth_utils.has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::user_role));

-- TABELA: shift_counts
CREATE TABLE public.shift_counts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id uuid NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  counted_qty integer NOT NULL DEFAULT 0,
  system_qty integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_counts_shift_id ON public.shift_counts(shift_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shift_counts TO authenticated;
GRANT ALL ON public.shift_counts TO service_role;

ALTER TABLE public.shift_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view shift counts"
ON public.shift_counts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert shift counts"
ON public.shift_counts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update shift counts"
ON public.shift_counts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage shift counts"
ON public.shift_counts FOR ALL TO authenticated
USING (auth_utils.has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::user_role));

-- Trigger updated_at em shifts
CREATE TRIGGER update_shifts_updated_at
BEFORE UPDATE ON public.shifts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();