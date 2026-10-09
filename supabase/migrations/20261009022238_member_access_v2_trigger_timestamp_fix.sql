-- Capture the final row timestamp after existing BEFORE UPDATE triggers run.
-- No data backfill, trigger replacement, or change to the approved access model.
create or replace function public.membership_admin_save_member_v2(p_member_id uuid,p_input jsonb,p_expected_updated_at timestamptz)
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
    updated_at=saved_at where id=m.id returning updated_at into saved_at;
  update membership.member_access_v2_history set saved_updated_at=saved_at where id=backup_id;
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

create or replace function membership.restore_member_access_v2(p_member_id uuid,p_history_id bigint)
returns void language plpgsql set search_path = '' as $$
declare
  m membership.members%rowtype; h membership.member_access_v2_history%rowtype;
  before_member membership.members%rowtype; stamp timestamptz := clock_timestamp();
  item jsonb; restore_history_id bigint;
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
    (select coalesce(jsonb_agg(to_jsonb(wa)),'[]'::jsonb) from membership.website_access wa where wa.member_id=m.id),stamp) returning id into restore_history_id;
  update membership.members set role_code=before_member.role_code,tier_code=before_member.tier_code,group_id=before_member.group_id,
    expires_at=before_member.expires_at,metadata=before_member.metadata,updated_at=stamp where id=m.id returning updated_at into stamp;
  update membership.member_access_v2_history set saved_updated_at=stamp where id=restore_history_id;
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
