-- Plugin & Skills di Prompt Studio: admin mengunggah SKILL.md atau ZIP sebagai module_materials
-- dengan module_id 'skills'. Upload, hapus, dan aturan admin memakai policy materi yang sudah ada.
ALTER TABLE public.module_materials
  ADD COLUMN IF NOT EXISTS description TEXT CHECK (description IS NULL OR length(description) <= 500);

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['text/html', 'application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/markdown', 'application/zip']
WHERE id = 'module-materials';
