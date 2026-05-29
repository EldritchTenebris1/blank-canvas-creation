ALTER TABLE public.employees ADD COLUMN monthly_goal NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.employees.monthly_goal IS 'Meta de venda mensal individual para o frentista';