-- Add company branding fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url text;

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
  ON CONFLICT (id) DO NOTHING;

-- Public read access for logos
DROP POLICY IF EXISTS "Public read access for logos" ON storage.objects;
CREATE POLICY "Public read access for logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

-- Authenticated upload for logos
DROP POLICY IF EXISTS "Authenticated upload for logos" ON storage.objects;
CREATE POLICY "Authenticated upload for logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Authenticated delete for own logos
DROP POLICY IF EXISTS "Authenticated delete for logos" ON storage.objects;
CREATE POLICY "Authenticated delete for logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');
