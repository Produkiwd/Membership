-- Prepared locally. Apply only after Stephen approves the reviewed deployment plan.
-- No backfill, deletion, or changes to existing RPC signatures.
create table membership.member_access_v2_history (
  id bigint generated always as identity primary key,
  member_id uuid not null references membership.members(id),
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  member_before jsonb not null,
  programs_before jsonb not null,
  websites_before jsonb not null,
  saved_updated_at timestamptz
);
create index member_access_v2_history_member_idx on membership.member_access_v2_history(member_id, id desc);
alter table membership.member_access_v2_history enable row level security;
revoke all on membership.member_access_v2_history from public, anon, authenticated, service_role;

create function membership.validate_access_v2(p_input jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  cfg jsonb := p_input->'access';
  tiers text[]; modules text[]; portals text[];
  all_modules text[] := array['strategize','prompt','create','think','build','act','thinking_with_claude','ai_operating_system','selling_idea_with_ai'];
  how_modules text[] := array['thinking_with_claude','ai_operating_system','selling_idea_with_ai'];
  role_name text := p_input->>'role';
  expiry text := nullif(p_input->>'expiry','');
  sinad_role text := cfg->>'sinadRole';
begin
  if p_input is null or jsonb_typeof(p_input) <> 'object' or cfg is null or jsonb_typeof(cfg) <> 'object'
     or cfg->>'version' is distinct from '2'
     or jsonb_typeof(cfg->'tiers') is distinct from 'array'
     or jsonb_typeof(cfg->'modules') is distinct from 'array'
     or jsonb_typeof(p_input->'portals') is distinct from 'array' then
    raise exception 'Format akses tidak valid';
  end if;
  select coalesce(array_agg(distinct v order by v),array[]::text[]) into tiers from jsonb_array_elements_text(cfg->'tiers') v;
  select coalesce(array_agg(distinct v order by v),array[]::text[]) into modules from jsonb_array_elements_text(cfg->'modules') v;
  select coalesce(array_agg(distinct v order by v),array[]::text[]) into portals from jsonb_array_elements_text(p_input->'portals') v;
  if array_position(tiers,null) is not null or array_position(modules,null) is not null or array_position(portals,null) is not null
     or not tiers <@ array['aif','aif_how_to','internal','sinad']::text[]
     or not modules <@ all_modules or not portals <@ array['aif','idl','sinad']::text[]
     or role_name is null or role_name not in ('member','admin')
     or sinad_role is null or sinad_role not in ('student','teacher') then
    raise exception 'Pilihan akses tidak dikenal';
  end if;
  if 'internal'=any(tiers) then
    tiers := array['internal']; modules := all_modules; portals := array['aif','idl','sinad'];
  else
    if ('aif'=any(tiers) or 'aif_how_to'=any(tiers)) and not 'aif'=any(portals) then raise exception 'Aktifkan portal AIF'; end if;
    if 'sinad'=any(tiers) and not 'sinad'=any(portals) then raise exception 'Aktifkan portal SinaD'; end if;
    if 'sinad'=any(portals) and not 'sinad'=any(tiers) then raise exception 'Pilih tier SinaD'; end if;
    if modules && how_modules and not 'aif_how_to'=any(tiers) then raise exception 'Pilih tier AIF How To'; end if;
    if modules && array['prompt','create','think','build','act']::text[] and not 'aif'=any(tiers) then raise exception 'Pilih tier AIF'; end if;
    if 'strategize'=any(modules) and not ('aif'=any(tiers) or 'aif_how_to'=any(tiers)) then raise exception 'Pilih tier AIF'; end if;
    if modules && how_modules and not 'strategize'=any(modules) then modules := array_append(modules,'strategize'); end if;
    if 'aif'=any(portals) and cardinality(modules)=0 then raise exception 'Pilih minimal satu kotak AIF'; end if;
  end if;
  if cardinality(portals)=0 then raise exception 'Pilih minimal satu portal'; end if;
  if expiry is not null and (expiry !~ '^\d{4}-\d{2}-\d{2}$' or to_char(expiry::date,'YYYY-MM-DD') <> expiry) then raise exception 'Tanggal tidak valid'; end if;
  if length(coalesce(p_input->>'groupName','')) > 120 then raise exception 'Nama batch maksimal 120 karakter'; end if;
  return p_input || jsonb_build_object('access',jsonb_build_object('version',2,'tiers',tiers,'modules',modules,'sinadRole',sinad_role),'portals',portals);
end $$;
revoke all on function membership.validate_access_v2(jsonb) from public, anon, authenticated, service_role;

create function membership.effective_access_v2(p_member_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(m.metadata->'accessV2',jsonb_build_object(
    'version',2,
    'tiers',case
      when m.tier_code='internal' then jsonb_build_array('internal')
      when m.tier_code in ('ai_os','twc') then jsonb_build_array('aif_how_to')
      when m.tier_code in ('sinad_student','sinad_teacher') then jsonb_build_array('sinad')
      when m.tier_code in ('professional','leaders','community') then jsonb_build_array('aif')
      else '[]'::jsonb end || case when m.tier_code not in ('internal','sinad_student','sinad_teacher') and exists (
        select 1 from membership.program_access pa where pa.member_id=m.id and pa.program_code='sinad' and pa.is_active
      ) then jsonb_build_array('sinad') else '[]'::jsonb end,
    'modules',case
      when m.tier_code='internal' then jsonb_build_array('strategize','prompt','create','think','build','act','thinking_with_claude','ai_operating_system','selling_idea_with_ai')
      when m.tier_code='leaders' then jsonb_build_array('strategize','prompt','create','think','build','act')
      when m.tier_code='professional' then jsonb_build_array('strategize','prompt','create')
      when m.tier_code='community' then jsonb_build_array('strategize')
      when m.tier_code='twc' then jsonb_build_array('strategize','thinking_with_claude')
      when m.tier_code='ai_os' then jsonb_build_array('strategize','ai_operating_system')
      else '[]'::jsonb end,
    'sinadRole',case when m.tier_code='sinad_teacher' then 'teacher' else 'student' end))
  from membership.members m where m.id=p_member_id and m.deleted_at is null
    and auth.uid() is not null and (membership.is_admin() or m.user_id=auth.uid() or m.email_normalized=membership.current_email());
$$;
revoke all on function membership.effective_access_v2(uuid) from public, anon, authenticated, service_role;

create function membership.member_json_v2(p_member_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select public.membership_member_json(m.id) || jsonb_build_object(
    'accessV2',membership.effective_access_v2(m.id),
    'expiryDate',case when m.metadata ? 'accessV2' then coalesce(m.metadata->>'accessExpiryDate','')
      when m.expires_at is null then '' else to_char(m.expires_at at time zone 'Asia/Bangkok','YYYY-MM-DD') end,
    'allowedPortals',coalesce((select jsonb_agg(pa.program_code order by pa.program_code) from membership.program_access pa where pa.member_id=m.id and pa.is_active),'[]'::jsonb),
    'tier',case when m.metadata ? 'accessV2' and (m.metadata->'accessV2'->'tiers') ? 'sinad' then
      case when m.metadata->'accessV2'->>'sinadRole'='teacher' then 'Teacher' else 'Student' end
      else public.membership_tier_name(m.tier_code) end
  ) from membership.members m where m.id=p_member_id and m.deleted_at is null
    and auth.uid() is not null and (membership.is_admin() or m.user_id=auth.uid() or m.email_normalized=membership.current_email());
$$;
revoke all on function membership.member_json_v2(uuid) from public, anon, authenticated, service_role;

create function public.membership_admin_catalog_v2()
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not membership.is_admin() then raise exception 'Admin access required'; end if;
  return jsonb_build_object('version',2,
    'members',(select coalesce(jsonb_agg(membership.member_json_v2(m.id) order by m.created_at desc),'[]'::jsonb) from membership.members m where m.deleted_at is null and (m.expires_at is null or m.expires_at>now())),
    'groups',(select coalesce(jsonb_agg(g.name order by g.name),'[]'::jsonb) from membership.groups g where g.is_active));
end $$;

create function public.membership_get_my_profile_v2()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare legacy jsonb;
begin
  legacy := public.membership_get_my_profile();
  return membership.member_json_v2((legacy->>'id')::uuid);
end $$;

-- Codes include a hash: adding similar batch names never renames an existing batch.
create function membership.resolve_group_v2(p_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare clean text := nullif(regexp_replace(trim(p_name),'\s+',' ','g'),''); target uuid;
begin
  if auth.uid() is null or not membership.is_admin() then raise exception 'Admin access required'; end if;
  if clean is null then return null; end if;
  if length(clean)>120 then raise exception 'Nama batch maksimal 120 karakter'; end if;
  perform pg_advisory_xact_lock(hashtextextended('member_batch:'||lower(clean),0));
  select id into target from membership.groups where lower(name)=lower(clean) order by created_at limit 1;
  if target is null then
    insert into membership.groups(code,name) values ('batch_'||md5(lower(clean)),clean) returning id into target;
  else
    update membership.groups set is_active=true,updated_at=now() where id=target and not is_active;
  end if;
  return target;
end $$;
revoke all on function membership.resolve_group_v2(text) from public, anon, authenticated, service_role;

create function public.membership_admin_add_group_v2(p_name text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare target uuid;
begin
  target := membership.resolve_group_v2(p_name);
  if target is null then raise exception 'Nama batch wajib diisi'; end if;
  return (select jsonb_build_object('id',g.id,'name',g.name) from membership.groups g where g.id=target);
end $$;

create function public.membership_admin_save_member_v2(p_member_id uuid,p_input jsonb,p_expected_updated_at timestamptz)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  m membership.members%rowtype;
  cfg jsonb; input jsonb; tiers text[]; modules text[]; portals text[];
  expiry timestamptz; grp uuid; backup_id bigint; saved_at timestamptz := clock_timestamp();
  compat_tier text; portal text;
begin
  if auth.uid() is null or not membership.is_admin() then raise exception 'Admin access required'; end if;
  input := membership.validate_access_v2(p_input); cfg := input->'access';
  select * into m from membership.members where id=p_member_id and deleted_at is null for update;
  if not found then raise exception 'Member tidak ditemukan'; end if;
  if p_expected_updated_at is null or m.updated_at is distinct from p_expected_updated_at then
    raise exception 'Data member berubah. Muat ulang daftar sebelum menyimpan.' using errcode='40001';
  end if;
  select array_agg(v) into tiers from jsonb_array_elements_text(cfg->'tiers') v;
  select array_agg(v) into modules from jsonb_array_elements_text(cfg->'modules') v;
  select array_agg(v) into portals from jsonb_array_elements_text(input->'portals') v;
  expiry := case when nullif(input->>'expiry','') is null then null else ((input->>'expiry')::date+1)::timestamp at time zone 'Asia/Bangkok' end;
  grp := membership.resolve_group_v2(input->>'groupName');
  -- Legacy tier retained as a compatibility projection; v2 is authoritative in this portal.
  compat_tier := case
    when 'internal'=any(tiers) then 'internal'
    when not 'aif'=any(portals) and 'sinad'=any(portals) then case when cfg->>'sinadRole'='teacher' then 'sinad_teacher' else 'sinad_student' end
    when modules @> array['strategize','prompt','create','think','build','act']::text[] and not modules && array['thinking_with_claude','ai_operating_system','selling_idea_with_ai']::text[] then 'leaders'
    when modules <@ array['strategize','prompt','create']::text[] and modules @> array['strategize','prompt','create']::text[] then 'professional'
    when modules <@ array['strategize','thinking_with_claude']::text[] and 'thinking_with_claude'=any(modules) then 'twc'
    when modules <@ array['strategize','ai_operating_system']::text[] and 'ai_operating_system'=any(modules) then 'ai_os'
    else 'community' end;
  insert into membership.member_access_v2_history(member_id,changed_by,member_before,programs_before,websites_before,saved_updated_at)
  values(m.id,auth.uid(),to_jsonb(m),
    (select coalesce(jsonb_agg(to_jsonb(pa)),'[]'::jsonb) from membership.program_access pa where pa.member_id=m.id),
    (select coalesce(jsonb_agg(to_jsonb(wa)),'[]'::jsonb) from membership.website_access wa where wa.member_id=m.id),saved_at)
  returning id into backup_id;
  update membership.members set role_code=input->>'role',tier_code=compat_tier,group_id=grp,expires_at=expiry,
    metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('accessV2',cfg,'accessExpiryDate',coalesce(input->>'expiry',''),
      'sinadMateri',coalesce((input->>'sinadMateri')::boolean,false),'sinadExercise',coalesce((input->>'sinadExercise')::boolean,false)),
    updated_at=saved_at where id=m.id;
  foreach portal in array array['aif','idl','sinad']::text[] loop
    insert into membership.program_access(member_id,program_code,is_active,expires_at)
    values(m.id,portal,portal=any(portals),expiry)
    on conflict(member_id,program_code) do update set is_active=excluded.is_active,expires_at=excluded.expires_at;
  end loop;
  insert into membership.website_access(member_id,website_code,is_active,expires_at)
  values(m.id,'member',true,expiry),(m.id,'idl','idl'=any(portals) or 'aif'=any(portals),expiry),
    (m.id,'sinau',input->>'role'='admin' or 'internal'=any(tiers),expiry)
  on conflict(member_id,website_code) do update set is_active=excluded.is_active,expires_at=excluded.expires_at;
  return membership.member_json_v2(m.id);
end $$;

create function public.membership_admin_validate_create_v2(p_email text,p_input jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare email_value text := lower(trim(p_email));
begin
  if auth.uid() is null or not membership.is_admin() then raise exception 'Admin access required'; end if;
  perform membership.validate_access_v2(p_input);
  if email_value is null or length(email_value)>254 or email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Email tidak valid'; end if;
  if exists(select 1 from membership.members where email_normalized=email_value and deleted_at is null) then raise exception 'Email sudah terdaftar. Ubah lewat Daftar Member.'; end if;
  return jsonb_build_object('valid',true,'authUserExists',exists(select 1 from auth.users where lower(trim(email))=email_value));
end $$;

create function public.membership_admin_create_member_v2(p_email text,p_name text,p_input jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare email_value text := lower(trim(p_email)); input jsonb; created jsonb; target uuid; stamp timestamptz;
begin
  if auth.uid() is null or not membership.is_admin() then raise exception 'Admin access required'; end if;
  perform pg_advisory_xact_lock(hashtextextended('member_email:'||email_value,0));
  perform public.membership_admin_validate_create_v2(email_value,p_input);
  input := membership.validate_access_v2(p_input);
  -- Reuse the audited identity linkage, then save v2 permissions in the same transaction.
  created := public.membership_admin_create_member(email_value,p_name,input->>'role','Community',null,array['aif']::text[],null);
  target := (created->>'id')::uuid;
  select updated_at into stamp from membership.members where id=target;
  return public.membership_admin_save_member_v2(target,input,stamp);
end $$;

create function public.membership_can_read_module_v2(p_module_id text)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from membership.members m
    where m.deleted_at is null and m.status='active'
      and (m.expires_at is null or m.expires_at>now())
      and (m.user_id=auth.uid() or m.email_normalized=membership.current_email())
      and exists(select 1 from membership.program_access pa where pa.member_id=m.id and pa.program_code='aif' and pa.is_active and (pa.expires_at is null or pa.expires_at>now()))
      and (membership.effective_access_v2(m.id)->'modules') ? case p_module_id
        when '01' then 'strategize' when '02' then 'prompt' when '03' then 'create'
        when '04' then 'think' when '05' then 'build' when '06' then 'act'
        when '07' then 'ai_operating_system' when '08' then 'thinking_with_claude' when '09' then 'selling_idea_with_ai' end
  );
$$;
-- Think and Thinking With Claude currently share the same material source (04).
-- The cards have distinct permissions; both permitted groups can read this shared source.
create policy "Module access v2 limits reads" on public.module_materials as restrictive for select to authenticated
using ((select membership.is_admin()) or public.membership_can_read_module_v2(module_id) or (module_id='04' and public.membership_can_read_module_v2('08')));
create policy "Module access v2 limits file reads" on storage.objects as restrictive for select to authenticated
using (bucket_id<>'module-materials' or (select membership.is_admin()) or exists (
  select 1 from public.module_materials mm where mm.url='storage:'||name
));

revoke all on function public.membership_admin_catalog_v2() from public,anon;
revoke all on function public.membership_get_my_profile_v2() from public,anon;
revoke all on function public.membership_admin_add_group_v2(text) from public,anon;
revoke all on function public.membership_admin_save_member_v2(uuid,jsonb,timestamptz) from public,anon;
revoke all on function public.membership_admin_validate_create_v2(text,jsonb) from public,anon;
revoke all on function public.membership_admin_create_member_v2(text,text,jsonb) from public,anon;
revoke all on function public.membership_can_read_module_v2(text) from public,anon;
grant execute on function public.membership_admin_catalog_v2(),public.membership_get_my_profile_v2(),public.membership_admin_add_group_v2(text),public.membership_admin_save_member_v2(uuid,jsonb,timestamptz),public.membership_admin_validate_create_v2(text,jsonb),public.membership_admin_create_member_v2(text,text,jsonb),public.membership_can_read_module_v2(text) to authenticated;
-- Restore one saved edit only, after a separately approved recovery action.
-- The backup must be the latest entry and the member must not have changed since.
create function membership.restore_member_access_v2(p_member_id uuid,p_history_id bigint)
returns void language plpgsql set search_path = '' as $$
declare
  m membership.members%rowtype; h membership.member_access_v2_history%rowtype;
  before_member membership.members%rowtype; stamp timestamptz := clock_timestamp();
  item jsonb;
begin
  select * into m from membership.members where id=p_member_id for update;
  if not found then raise exception 'Member tidak ditemukan'; end if;
  select * into h from membership.member_access_v2_history where member_id=p_member_id and id=p_history_id;
  if not found or h.id is distinct from (select max(id) from membership.member_access_v2_history where member_id=p_member_id)
    or m.updated_at is distinct from h.saved_updated_at then
    raise exception 'Cadangan bukan perubahan terakhir. Tinjau data sebelum pemulihan.';
  end if;
  select * into before_member from jsonb_populate_record(null::membership.members,h.member_before);
  insert into membership.member_access_v2_history(member_id,changed_by,member_before,programs_before,websites_before,saved_updated_at)
  values(m.id,auth.uid(),to_jsonb(m),
    (select coalesce(jsonb_agg(to_jsonb(pa)),'[]'::jsonb) from membership.program_access pa where pa.member_id=m.id),
    (select coalesce(jsonb_agg(to_jsonb(wa)),'[]'::jsonb) from membership.website_access wa where wa.member_id=m.id),stamp);
  update membership.members set role_code=before_member.role_code,tier_code=before_member.tier_code,group_id=before_member.group_id,
    expires_at=before_member.expires_at,metadata=before_member.metadata,updated_at=stamp where id=m.id;
  update membership.program_access set is_active=false where member_id=m.id and program_code in ('aif','idl','sinad');
  for item in select value from jsonb_array_elements(h.programs_before) loop
    if item->>'program_code' in ('aif','idl','sinad') then
      update membership.program_access set is_active=(item->>'is_active')::boolean,expires_at=(item->>'expires_at')::timestamptz
        where member_id=m.id and program_code=item->>'program_code';
    end if;
  end loop;
  update membership.website_access set is_active=false where member_id=m.id and website_code in ('member','idl','sinau');
  for item in select value from jsonb_array_elements(h.websites_before) loop
    if item->>'website_code' in ('member','idl','sinau') then
      update membership.website_access set is_active=(item->>'is_active')::boolean,expires_at=(item->>'expires_at')::timestamptz
        where member_id=m.id and website_code=item->>'website_code';
    end if;
  end loop;
end $$;
revoke all on function membership.restore_member_access_v2(uuid,bigint) from public,anon,authenticated,service_role;
