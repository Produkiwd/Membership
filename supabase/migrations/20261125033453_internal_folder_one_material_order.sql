alter table public.module_materials
  drop constraint internal_presentation_material_private_path,
  add constraint internal_presentation_material_private_path check (
    case
      when starts_with(url, 'reference:') then
        module_id = 'internal-1'
        and legacy_key is not null
        and url = 'reference:' || legacy_key
        and legacy_key in (
          'chinese-open-llms', 'api-token-guide', '7-ways-to-access-llms', 'responsible-ai-untuk-pemimpin'
        )
      when module_id in ('internal-1', 'internal-2', 'internal-3') then
        starts_with(url, 'storage:' || module_id || '/')
      else true
    end
  );

create unique index module_materials_internal_folder_one_reference
  on public.module_materials (url)
  where module_id = 'internal-1' and starts_with(url, 'reference:');

create policy "Keep folder one source references"
  on public.module_materials as restrictive for delete to authenticated
  using (module_id <> 'internal-1' or not starts_with(url, 'reference:'));

-- Start with the same visible order as before the migration.
with uploads as (
  select id, row_number() over (order by sort_order nulls last, created_at, id) as position
  from public.module_materials where module_id = 'internal-1'
)
update public.module_materials as material
set sort_order = (uploads.position + 4)::integer
from uploads where uploads.id = material.id;

insert into public.module_materials (module_id, title, url, legacy_key, sort_order) values
  ('internal-1', 'Kebangkitan Open LLM Cina', 'reference:chinese-open-llms', 'chinese-open-llms', 1),
  ('internal-1', 'LLM API, Token & Pricing Guide', 'reference:api-token-guide', 'api-token-guide', 2),
  ('internal-1', '7 Ways to Access LLMs', 'reference:7-ways-to-access-llms', '7-ways-to-access-llms', 3),
  ('internal-1', 'Responsible AI untuk Pemimpin', 'reference:responsible-ai-untuk-pemimpin', 'responsible-ai-untuk-pemimpin', 4);

create function public.save_internal_folder_one_material_order(p_previous_ids uuid[], p_ordered_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_ids uuid[];
begin
  if (public.membership_is_admin() and public.membership_can_read_module_v2('internal-1')) is not true then
    raise exception 'Hanya admin tier Internal yang dapat mengatur urutan Kotak 1.' using errcode = '42501';
  end if;

  select array(
    select id
    from (
      select id, sort_order, created_at
      from public.module_materials
      where module_id = 'internal-1'
      order by id
      for update
    ) as locked
    order by sort_order nulls last, created_at, id
  ) into current_ids;

  if current_ids is distinct from p_previous_ids then
    raise exception 'Daftar materi sudah berubah. Muat ulang dan coba lagi.' using errcode = '40001';
  end if;

  if cardinality(p_ordered_ids) is distinct from cardinality(current_ids)
    or not (current_ids <@ p_ordered_ids) then
    raise exception 'Urutan harus memuat setiap materi di Kotak 1 tepat satu kali.' using errcode = '22023';
  end if;

  update public.module_materials as material
  set sort_order = ordered.position::integer
  from unnest(p_ordered_ids) with ordinality as ordered(id, position)
  where material.module_id = 'internal-1' and material.id = ordered.id;
end;
$$;

revoke execute on function public.save_internal_folder_one_material_order(uuid[], uuid[]) from public, anon;
grant execute on function public.save_internal_folder_one_material_order(uuid[], uuid[]) to authenticated;
