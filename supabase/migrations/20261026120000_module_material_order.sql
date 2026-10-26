-- All AIF materials now live in module_materials. sort_order sets the display order per module;
-- legacy_key holds the old built-in title so progress and Prompt Journal ids ("<module>:builtin:<title>") survive.
ALTER TABLE public.module_materials
  ADD COLUMN IF NOT EXISTS sort_order INTEGER,
  ADD COLUMN IF NOT EXISTS legacy_key TEXT;

DROP POLICY IF EXISTS "Admin can update module materials" ON public.module_materials;
CREATE POLICY "Admin can update module materials" ON public.module_materials
  FOR UPDATE TO authenticated
  USING (public.membership_is_admin())
  WITH CHECK (public.membership_is_admin());

-- Module 04 rows already replaced the repo copies by title; keep their built-in ids.
UPDATE public.module_materials SET legacy_key = title
WHERE module_id = '04' AND title IN ('Thinking w/ Claude AI', 'Setup Claude') AND legacy_key IS NULL;

-- Current order is upload time; rows for module 06 start at 2 because the moved built-in takes slot 1.
UPDATE public.module_materials m SET sort_order = o.n + CASE WHEN m.module_id = '06' THEN 1 ELSE 0 END
FROM (SELECT id, row_number() OVER (PARTITION BY module_id ORDER BY created_at) AS n FROM public.module_materials) o
WHERE m.id = o.id AND m.sort_order IS NULL;
