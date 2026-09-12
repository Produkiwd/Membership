-- The member RPCs use membership.tiers and these two public mapping functions.
-- Adding an option only in the React admin panel does not make the tier persist.
BEGIN;

INSERT INTO membership.tiers (code, name, description, sort_order, is_active)
VALUES ('ai_os', 'AI OS', 'AI OS membership tier', 70, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO membership.groups (code, name)
VALUES ('ai_os', 'AI OS')
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.membership_tier_code(p_tier text)
RETURNS text
LANGUAGE sql STABLE
SET search_path TO ''
AS $function$
  SELECT CASE
    WHEN regexp_replace(lower(trim(coalesce(p_tier, ''))), '[^a-z0-9]+', '_', 'g') = 'ai_os' THEN 'ai_os'
    WHEN lower(coalesce(p_tier, '')) LIKE '%twc%' THEN 'twc'
    WHEN lower(coalesce(p_tier, '')) LIKE '%leader%' THEN 'leaders'
    WHEN lower(coalesce(p_tier, '')) LIKE '%community%' THEN 'community'
    WHEN lower(coalesce(p_tier, '')) LIKE '%internal%' THEN 'internal'
    WHEN lower(coalesce(p_tier, '')) LIKE '%teacher%' THEN 'sinad_teacher'
    WHEN lower(coalesce(p_tier, '')) LIKE '%student%' THEN 'sinad_student'
    ELSE 'professional'
  END;
$function$;

CREATE OR REPLACE FUNCTION public.membership_tier_name(p_tier_code text)
RETURNS text
LANGUAGE sql STABLE
SET search_path TO ''
AS $function$
  SELECT CASE lower(coalesce(p_tier_code, 'professional'))
    WHEN 'ai_os' THEN 'AI OS'
    WHEN 'twc' THEN 'TWC'
    WHEN 'leaders' THEN 'Leaders'
    WHEN 'community' THEN 'Community'
    WHEN 'internal' THEN 'Internal'
    WHEN 'sinad_teacher' THEN 'Teacher'
    WHEN 'sinad_student' THEN 'Student'
    ELSE 'Professional'
  END;
$function$;

DO $check$
BEGIN
  IF public.membership_tier_code('AI OS') <> 'ai_os'
     OR public.membership_tier_name('ai_os') <> 'AI OS' THEN
    RAISE EXCEPTION 'AI OS tier mapping verification failed';
  END IF;
END;
$check$;

COMMIT;
