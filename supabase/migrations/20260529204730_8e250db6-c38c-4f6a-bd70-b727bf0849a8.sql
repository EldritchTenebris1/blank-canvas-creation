-- Create backups table
CREATE TABLE IF NOT EXISTS public.backups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'completed'
);

-- Grant permissions
GRANT SELECT, INSERT ON public.backups TO authenticated;
GRANT ALL ON public.backups TO service_role;

-- Enable RLS
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow eldritch.tenebris1@gmail.com to see backups
-- Note: We use auth.jwt() to check email
CREATE POLICY "Only eldritch.tenebris1 can view backups" 
ON public.backups 
FOR SELECT 
USING (auth.jwt() ->> 'email' = 'eldritch.tenebris1@gmail.com');

CREATE POLICY "Only eldritch.tenebris1 can insert backups" 
ON public.backups 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'email' = 'eldritch.tenebris1@gmail.com');

-- Storage setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Only eldritch.tenebris1 can access backup files"
ON storage.objects
FOR ALL
USING (bucket_id = 'backups' AND auth.jwt() ->> 'email' = 'eldritch.tenebris1@gmail.com');
