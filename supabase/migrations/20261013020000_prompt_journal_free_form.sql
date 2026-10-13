-- Prompt Journal: tambah bentuk Bebas (FREE). Isinya satu kotak prompt dengan kunci 'b'.
-- Entri ACTIONS dan ACT yang sudah ada tidak berubah.

alter table public.prompt_journal_entries drop constraint prompt_journal_entries_framework_check;
alter table public.prompt_journal_entries add constraint prompt_journal_entries_framework_check
  check (framework in ('ACTIONS','ACT','FREE'));

create or replace function public.prompt_journal_save(
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
  -- Formula fields keep 5000 characters each; the free-form box keeps up to 20000.
  select coalesce(jsonb_object_agg(key, left(value, case when key = 'b' then 20000 else 5000 end)), '{}'::jsonb) into clean_fields
  from jsonb_each_text(p_fields)
  where key in ('a','c','t','i','o','n','s','b') and length(trim(value)) > 0;
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

revoke all on function public.prompt_journal_save(text, text, text, jsonb, text, text) from public, anon;
grant execute on function public.prompt_journal_save(text, text, text, jsonb, text, text) to authenticated;
