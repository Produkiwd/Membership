ALTER TABLE public.module_materials
  ADD COLUMN IF NOT EXISTS section TEXT;

UPDATE public.module_materials
SET section = CASE
  WHEN lower(title) LIKE '%thinking%claude%' THEN 'thinking-with-claude'
  WHEN lower(title) LIKE '%responsible%' OR lower(title) LIKE '%ethic%' OR lower(title) LIKE '%safety%' THEN 'responsible-ethic-safety'
  ELSE 'umum'
END
WHERE module_id = '01' AND section IS NULL;
