CREATE OR REPLACE FUNCTION public.membership_admin_create_member(p_email text, p_name text, p_role text, p_tier text, p_group_name text, p_allowed_portals text[], p_expires_at text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  normalized_email text := lower(trim(p_email));
  target_person_id uuid;
  target_user_id uuid;
  target_member_id uuid;
begin
  if not membership.is_admin() then
    raise exception 'Admin access required';
  end if;

  if normalized_email is null or normalized_email = '' then
    raise exception 'Email is required';
  end if;

  update addressbook.people p
  set
    full_name = coalesce(p.full_name, nullif(trim(coalesce(p_name, split_part(normalized_email, '@', 1))), '')),
    primary_email = normalized_email,
    updated_at = timezone('utc'::text, now())
  where p.primary_email_normalized = normalized_email
  returning p.id into target_person_id;

  if target_person_id is null then
    insert into addressbook.people (full_name, primary_email, source)
    values (nullif(trim(coalesce(p_name, split_part(normalized_email, '@', 1))), ''), normalized_email, 'membership_admin')
    returning id into target_person_id;
  end if;

  select u.id
  into target_user_id
  from auth.users u
  where lower(trim(u.email)) = normalized_email
  limit 1;

  update membership.members m
  set
    person_id = target_person_id,
    user_id = coalesce(m.user_id, target_user_id),
    display_name = nullif(trim(coalesce(p_name, split_part(normalized_email, '@', 1))), ''),
    role_code = case when lower(coalesce(p_role, 'member')) = 'admin' then 'admin' else 'member' end,
    tier_code = public.membership_tier_code(p_tier),
    status = 'active',
    expires_at = case when nullif(p_expires_at, '') is null then null else p_expires_at::timestamptz end,
    updated_at = timezone('utc'::text, now())
  where m.email_normalized = normalized_email
    and m.deleted_at is null
  returning m.id into target_member_id;

  if target_member_id is null then
    insert into membership.members (
      person_id,
      user_id,
      email,
      display_name,
      role_code,
      tier_code,
      status,
      source,
      source_ref,
      expires_at
    )
    values (
      target_person_id,
      target_user_id,
      normalized_email,
      nullif(trim(coalesce(p_name, split_part(normalized_email, '@', 1))), ''),
      case when lower(coalesce(p_role, 'member')) = 'admin' then 'admin' else 'member' end,
      public.membership_tier_code(p_tier),
      'active',
      'membership_admin',
      'pending:' || md5(normalized_email),
      case when nullif(p_expires_at, '') is null then null else p_expires_at::timestamptz end
    )
    returning id into target_member_id;
  end if;

  perform public.membership_admin_update_member(
    target_member_id::text,
    p_role,
    p_tier,
    p_expires_at,
    p_allowed_portals,
    false,
    false,
    p_group_name
  );

  return public.membership_member_json(target_member_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.membership_admin_update_member(p_member_id text, p_role text, p_tier text, p_expires_at text, p_allowed_portals text[], p_sinad_materi boolean, p_sinad_exercise boolean, p_group_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  target_id uuid;
  target_group_id uuid;
  normalized_role text := case when lower(coalesce(p_role, 'member')) = 'admin' then 'admin' else 'member' end;
  normalized_tier text := public.membership_tier_code(p_tier);
  normalized_group text := nullif(trim(coalesce(p_group_name, '')), '');
  portal text;
begin
  if not membership.is_admin() then
    raise exception 'Admin access required';
  end if;

  select m.id
  into target_id
  from membership.members m
  where m.deleted_at is null
    and (m.id::text = p_member_id or m.source_ref = p_member_id)
  limit 1;

  if target_id is null then
    raise exception 'Member not found';
  end if;

  if normalized_group is not null then
    insert into membership.groups (code, name)
    values (regexp_replace(lower(normalized_group), '[^a-z0-9]+', '_', 'g'), normalized_group)
    on conflict (code) do update set name = excluded.name, updated_at = timezone('utc'::text, now())
    returning id into target_group_id;
  end if;

  update membership.members m
  set
    role_code = normalized_role,
    tier_code = normalized_tier,
    group_id = target_group_id,
    expires_at = case when nullif(p_expires_at, '') is null then null else p_expires_at::timestamptz end,
    metadata = coalesce(m.metadata, '{}'::jsonb) || jsonb_build_object(
      'sinadMateri', coalesce(p_sinad_materi, false),
      'sinadExercise', coalesce(p_sinad_exercise, false),
      'updatedAt', timezone('utc'::text, now())
    ),
    updated_at = timezone('utc'::text, now())
  where m.id = target_id;

  update membership.program_access
  set is_active = false
  where member_id = target_id;

  foreach portal in array coalesce(p_allowed_portals, array['aif']::text[])
  loop
    insert into membership.program_access (member_id, program_code, is_active, expires_at)
    values (
      target_id,
      lower(trim(portal)),
      true,
      case when nullif(p_expires_at, '') is null then null else p_expires_at::timestamptz end
    )
    on conflict (member_id, program_code) do update set
      is_active = true,
      expires_at = excluded.expires_at;
  end loop;

  insert into membership.website_access (member_id, website_code, is_active, expires_at)
  values (target_id, 'member', true, case when nullif(p_expires_at, '') is null then null else p_expires_at::timestamptz end)
  on conflict (member_id, website_code) do update set
    is_active = true,
    expires_at = excluded.expires_at;

  insert into membership.website_access (member_id, website_code, is_active, expires_at)
  values (target_id, 'idl', 'idl' = any(coalesce(p_allowed_portals, array[]::text[])), case when nullif(p_expires_at, '') is null then null else p_expires_at::timestamptz end)
  on conflict (member_id, website_code) do update set
    is_active = excluded.is_active,
    expires_at = excluded.expires_at;

  insert into membership.website_access (member_id, website_code, is_active, expires_at)
  values (target_id, 'sinau', normalized_role = 'admin' or normalized_tier = 'internal', case when nullif(p_expires_at, '') is null then null else p_expires_at::timestamptz end)
  on conflict (member_id, website_code) do update set
    is_active = excluded.is_active,
    expires_at = excluded.expires_at;

  return public.membership_member_json(target_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.membership_get_my_profile()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_email text := public.membership_current_email();
  target_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select m.id
  into target_id
  from membership.members m
  where m.deleted_at is null
    and (m.user_id = auth.uid() or m.email_normalized = current_email)
  order by (m.user_id = auth.uid()) desc
  limit 1;

  if target_id is null then
    raise exception 'Member access not found for %', current_email;
  end if;

  if not membership.has_website_access('member') then
    raise exception 'Member portal access is not active for %', current_email;
  end if;

  return public.membership_member_json(target_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.membership_member_json(p_member_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select jsonb_build_object(
    'id', m.id::text,
    'userId', coalesce(m.user_id::text, m.id::text),
    'email', m.email,
    'name', coalesce(m.display_name, split_part(m.email, '@', 1)),
    'role', case when r.is_admin then 'admin' else 'member' end,
    'status', coalesce(m.status, 'active'),
    'tier', public.membership_tier_name(m.tier_code),
    'group', coalesce(g.name, ''),
    'allowedPortals', coalesce((
      select array_agg(pa.program_code order by pa.program_code)
      from membership.program_access pa
      where pa.member_id = m.id
        and pa.is_active = true
        and (pa.expires_at is null or pa.expires_at > timezone('utc'::text, now()))
    ), array['aif']::text[]),
    'expiresAt', m.expires_at,
    'sinadMateri', coalesce((m.metadata ->> 'sinadMateri')::boolean, false),
    'sinadExercise', coalesce((m.metadata ->> 'sinadExercise')::boolean, false),
    'createdAt', m.created_at::text,
    'updatedAt', m.updated_at::text
  )
  from membership.members m
  join membership.roles r on r.code = m.role_code
  left join membership.groups g on g.id = m.group_id
  where m.id = p_member_id
    and m.deleted_at is null;
$function$;
