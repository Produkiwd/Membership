CREATE TABLE IF NOT EXISTS public.module_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS module_materials_module_id_created_at_idx
  ON public.module_materials (module_id, created_at);

ALTER TABLE public.module_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.module_materials;
CREATE POLICY "Allow read access for authenticated users" ON public.module_materials
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.module_materials;
DROP POLICY IF EXISTS "Admin can insert module materials" ON public.module_materials;
CREATE POLICY "Admin can insert module materials" ON public.module_materials
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = 'stephen.tssgroup@gmail.com');

DROP POLICY IF EXISTS "Admin can delete module materials" ON public.module_materials;
CREATE POLICY "Admin can delete module materials" ON public.module_materials
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'stephen.tssgroup@gmail.com');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'module-materials',
  'module-materials',
  false,
  5242880,
  ARRAY['text/html', 'application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users can read module material files" ON storage.objects;
CREATE POLICY "Authenticated users can read module material files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'module-materials');

DROP POLICY IF EXISTS "Authenticated users can upload module material files" ON storage.objects;
CREATE POLICY "Authenticated users can upload module material files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'module-materials'
    AND (auth.jwt() ->> 'email') = 'stephen.tssgroup@gmail.com'
  );

DROP POLICY IF EXISTS "Authenticated users can delete module material files" ON storage.objects;
CREATE POLICY "Authenticated users can delete module material files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'module-materials'
    AND (auth.jwt() ->> 'email') = 'stephen.tssgroup@gmail.com'
  );
