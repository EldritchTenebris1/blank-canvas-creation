-- Create fuel_tanks table
CREATE TABLE public.fuel_tanks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    capacity DECIMAL(12,2) NOT NULL,
    current_volume DECIMAL(12,2) NOT NULL DEFAULT 0,
    product_id UUID REFERENCES public.products(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fuel_pumps table
CREATE TABLE public.fuel_pumps (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, maintenance, offline
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pump_nozzles table (bicos)
CREATE TABLE public.pump_nozzles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pump_id UUID REFERENCES public.fuel_pumps(id) ON DELETE CASCADE,
    tank_id UUID REFERENCES public.fuel_tanks(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- e.g., "01", "A", "G"
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_tanks TO authenticated;
GRANT ALL ON public.fuel_tanks TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_pumps TO authenticated;
GRANT ALL ON public.fuel_pumps TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pump_nozzles TO authenticated;
GRANT ALL ON public.pump_nozzles TO service_role;

-- Enable RLS
ALTER TABLE public.fuel_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pump_nozzles ENABLE ROW LEVEL SECURITY;

-- Policies for fuel_tanks
CREATE POLICY "Enable read for all authenticated users" ON public.fuel_tanks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write for admins" ON public.fuel_tanks
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Policies for fuel_pumps
CREATE POLICY "Enable read for all authenticated users" ON public.fuel_pumps
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write for admins" ON public.fuel_pumps
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Policies for pump_nozzles
CREATE POLICY "Enable read for all authenticated users" ON public.pump_nozzles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write for admins" ON public.pump_nozzles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_fuel_tanks_updated_at BEFORE UPDATE ON public.fuel_tanks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fuel_pumps_updated_at BEFORE UPDATE ON public.fuel_pumps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
