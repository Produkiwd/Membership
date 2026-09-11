DROP POLICY IF EXISTS "Admin can insert module materials" ON public.module_materials;
CREATE POLICY "Admin can insert module materials" ON public.module_materials
  FOR INSERT TO authenticated
  WITH CHECK (public.membership_is_admin());

DROP POLICY IF EXISTS "Admin can delete module materials" ON public.module_materials;
CREATE POLICY "Admin can delete module materials" ON public.module_materials
  FOR DELETE TO authenticated
  USING (public.membership_is_admin());

DROP POLICY IF EXISTS "Authenticated users can upload module material files" ON storage.objects;
CREATE POLICY "Authenticated users can upload module material files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'module-materials'
    AND public.membership_is_admin()
  );

DROP POLICY IF EXISTS "Authenticated users can delete module material files" ON storage.objects;
CREATE POLICY "Authenticated users can delete module material files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'module-materials'
    AND public.membership_is_admin()
  );
