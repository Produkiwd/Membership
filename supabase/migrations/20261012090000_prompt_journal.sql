-- Prompt Journal: setiap peserta menyimpan versi prompt per materi modul Prompt.
-- Satu simpan = satu versi baru, jadi perjalanan perubahan prompt tetap utuh.
-- Tabel hanya bisa diakses lewat fungsi di bawah. Peserta melihat jurnal sendiri
-- dan jurnal rekan satu batch (group_id sama). Admin melihat semua batch.

create table public.prompt_journal_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references membership.members(id) on delete cascade,
  material_key text not null check (material_key ~ '^0[1-9]:(builtin|remote):.+$' and length(material_key) <= 300),
  material_title text not null check (length(trim(material_title)) between 1 and 200),
  version integer not null check (version > 0),
  framework text not null check (framework in ('ACTIONS','ACT')),
  fields jsonb not null check (jsonb_typeof(fields) = 'object'),
  prompt_text text not null check (length(trim(prompt_text)) between 1 and 20000),
  notes text check (notes is null or length(notes) <= 2000),
  created_at timestamptz not null default now(),
  unique (member_id, material_key, version)
);
create index prompt_journal_entries_material_idx on public.prompt_journal_entries (material_key, member_id, version);
alter table public.prompt_journal_entries enable row level security;
revoke all on public.prompt_journal_entries from public, anon, authenticated;

-- Member aktif milik akun yang sedang login.
create function membership.prompt_journal_member_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select m.id from membership.members m
  where auth.uid() is not null and m.deleted_at is null and m.status = 'active'
    and (m.expires_at is null or m.expires_at > now())
    and (m.user_id = auth.uid() or m.email_normalized = membership.current_email())
  order by (m.user_id = auth.uid()) desc, m.created_at
  limit 1;
$$;

-- Sama dengan aturan tombol Prompt Studio: punya salah satu modul selain Strategize.
create function membership.prompt_journal_allowed()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (membership.is_admin() or exists (
    select 1 from unnest(array['02','03','04','05','06','07','08','09']) as module_id
    where public.membership_can_read_module_v2(module_id)
  ));
$$;

create function membership.prompt_journal_json(e public.prompt_journal_entries, p_me uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', e.id,
    'materialKey', e.material_key,
    'materialTitle', e.material_title,
    'version', e.version,
    'framework', e.framework,
    'fields', e.fields,
    'promptText', e.prompt_text,
    'notes', e.notes,
    'createdAt', e.created_at,
    'isMine', e.member_id = p_me,
    'authorId', e.member_id,
    'authorName', coalesce(nullif(trim(m.display_name), ''), split_part(m.email, '@', 1)),
    'batch', g.name
  )
  from membership.members m left join membership.groups g on g.id = m.group_id
  where m.id = e.member_id;
$$;

create function public.prompt_journal_save(
  p_material_key text, p_material_title text, p_framework text,
  p_fields jsonb, p_prompt_text text, p_notes text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  me uuid := membership.prompt_journal_member_id();
  clean_fields jsonb;
  next_version integer;
  saved public.prompt_journal_entries;
begin
  if me is null or not membership.prompt_journal_allowed() then
    raise exception 'Akun ini belum punya akses Prompt Journal';
  end if;
  if p_fields is null or jsonb_typeof(p_fields) <> 'object' then
    raise exception 'Isi formula tidak valid';
  end if;
  select coalesce(jsonb_object_agg(key, left(value, 5000)), '{}'::jsonb) into clean_fields
  from jsonb_each_text(p_fields)
  where key in ('a','c','t','i','o','n','s') and length(trim(value)) > 0;
  if clean_fields = '{}'::jsonb then
    raise exception 'Isi minimal satu kolom formula';
  end if;

  perform pg_advisory_xact_lock(hashtext(me::text || ':' || p_material_key));
  select coalesce(max(version), 0) + 1 into next_version
  from public.prompt_journal_entries where member_id = me and material_key = p_material_key;

  insert into public.prompt_journal_entries (member_id, material_key, material_title, version, framework, fields, prompt_text, notes)
  values (me, p_material_key, trim(p_material_title), next_version, p_framework, clean_fields, p_prompt_text, nullif(trim(p_notes), ''))
  returning * into saved;
  return membership.prompt_journal_json(saved, me);
end $$;

-- Tanpa p_material_key: semua entri yang boleh dilihat. Dengan p_material_key: satu materi saja.
create function public.prompt_journal_list(p_material_key text default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  me uuid := membership.prompt_journal_member_id();
  my_group uuid;
  admin boolean := membership.is_admin();
begin
  if not membership.prompt_journal_allowed() or (me is null and not admin) then
    raise exception 'Akun ini belum punya akses Prompt Journal';
  end if;
  select group_id into my_group from membership.members where id = me;
  return coalesce((
    select jsonb_agg(membership.prompt_journal_json(e, me) order by e.material_key, e.member_id, e.version)
    from public.prompt_journal_entries e
    join membership.members author on author.id = e.member_id and author.deleted_at is null
    where (p_material_key is null or e.material_key = p_material_key)
      and (admin or e.member_id = me or (my_group is not null and author.group_id = my_group))
  ), '[]'::jsonb);
end $$;

create function public.prompt_journal_delete(p_entry_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare me uuid := membership.prompt_journal_member_id();
begin
  if me is null or not membership.prompt_journal_allowed() then
    raise exception 'Akun ini belum punya akses Prompt Journal';
  end if;
  delete from public.prompt_journal_entries where id = p_entry_id and member_id = me;
  if not found then raise exception 'Entri tidak ditemukan atau bukan milik Anda'; end if;
end $$;

revoke all on function membership.prompt_journal_member_id() from public, anon, authenticated;
revoke all on function membership.prompt_journal_allowed() from public, anon, authenticated;
revoke all on function membership.prompt_journal_json(public.prompt_journal_entries, uuid) from public, anon, authenticated;
revoke all on function public.prompt_journal_save(text, text, text, jsonb, text, text) from public, anon;
revoke all on function public.prompt_journal_list(text) from public, anon;
revoke all on function public.prompt_journal_delete(uuid) from public, anon;
grant execute on function public.prompt_journal_save(text, text, text, jsonb, text, text),
  public.prompt_journal_list(text), public.prompt_journal_delete(uuid) to authenticated;
