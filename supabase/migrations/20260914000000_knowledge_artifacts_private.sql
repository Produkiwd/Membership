-- Private HTML for SinauTech Knowledge. Upload files before removing live public copies.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('knowledge-artifacts', 'knowledge-artifacts', false, 5242880, ARRAY['text/html'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Match the portal's membership profile, but enforce it on Storage, not in the browser.
CREATE OR REPLACE FUNCTION public.knowledge_artifact_member_can_read()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  profile jsonb;
  expiry text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  profile := to_jsonb(public.membership_get_my_profile());
  IF profile IS NULL OR NULLIF(profile ->> 'id', '') IS NULL THEN
    RETURN false;
  END IF;
  IF lower(coalesce(profile ->> 'status', '')) <> 'active' THEN
    RETURN false;
  END IF;

  expiry := coalesce(profile ->> 'expiresAt', profile ->> 'expires_at');
  RETURN expiry IS NULL OR expiry::timestamptz > now();
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.knowledge_artifact_member_can_read() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.knowledge_artifact_member_can_read() TO authenticated;

DROP POLICY IF EXISTS "Active members can read knowledge artifacts" ON storage.objects;
CREATE POLICY "Active members can read knowledge artifacts" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'knowledge-artifacts'
    AND (public.knowledge_artifact_member_can_read() OR public.membership_is_admin())
  );

-- Restrictive policies prevent any broader policy on storage.objects from
-- accidentally granting access to this bucket.
DROP POLICY IF EXISTS "Knowledge artifacts enforce member reads" ON storage.objects;
CREATE POLICY "Knowledge artifacts enforce member reads" ON storage.objects
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    bucket_id <> 'knowledge-artifacts'
    OR public.knowledge_artifact_member_can_read()
    OR public.membership_is_admin()
  );

DROP POLICY IF EXISTS "Admins can upload knowledge artifacts" ON storage.objects;
CREATE POLICY "Admins can upload knowledge artifacts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'knowledge-artifacts'
    AND public.membership_is_admin()
  );

DROP POLICY IF EXISTS "Knowledge artifacts enforce admin uploads" ON storage.objects;
CREATE POLICY "Knowledge artifacts enforce admin uploads" ON storage.objects
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (bucket_id <> 'knowledge-artifacts' OR public.membership_is_admin());

DROP POLICY IF EXISTS "Admins can replace knowledge artifacts" ON storage.objects;
CREATE POLICY "Admins can replace knowledge artifacts" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'knowledge-artifacts' AND public.membership_is_admin())
  WITH CHECK (bucket_id = 'knowledge-artifacts' AND public.membership_is_admin());

DROP POLICY IF EXISTS "Knowledge artifacts enforce admin replacements" ON storage.objects;
CREATE POLICY "Knowledge artifacts enforce admin replacements" ON storage.objects
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (bucket_id <> 'knowledge-artifacts' OR public.membership_is_admin())
  WITH CHECK (bucket_id <> 'knowledge-artifacts' OR public.membership_is_admin());

DROP POLICY IF EXISTS "Admins can delete knowledge artifacts" ON storage.objects;
CREATE POLICY "Admins can delete knowledge artifacts" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'knowledge-artifacts' AND public.membership_is_admin());

DROP POLICY IF EXISTS "Knowledge artifacts enforce admin deletions" ON storage.objects;
CREATE POLICY "Knowledge artifacts enforce admin deletions" ON storage.objects
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (bucket_id <> 'knowledge-artifacts' OR public.membership_is_admin());
