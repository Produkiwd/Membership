create or replace function public.membership_can_read_module_v2(p_module_id text)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from membership.members m
    where m.deleted_at is null and m.status = 'active'
      and (m.expires_at is null or m.expires_at > now())
      and (m.user_id = auth.uid() or m.email_normalized = membership.current_email())
      and exists (
        select 1 from membership.program_access pa
        where pa.member_id = m.id and pa.program_code = 'aif' and pa.is_active
          and (pa.expires_at is null or pa.expires_at > now())
      )
      and case
        when p_module_id in ('internal-1', 'internal-2', 'internal-3')
          then (membership.effective_access_v2(m.id)->'tiers') ? 'internal'
        else (membership.effective_access_v2(m.id)->'modules') ? case p_module_id
          when '01' then 'strategize' when '02' then 'prompt' when '03' then 'create'
          when '04' then 'think' when '05' then 'build' when '06' then 'act'
          when '07' then 'ai_operating_system' when '08' then 'thinking_with_claude'
          when '09' then 'selling_idea_with_ai' end
      end
  );
$$;

-- Apply the tier check even to admins, who bypass the general module read policy.
create policy "Internal tier reads presentation materials"
on public.module_materials as restrictive for select to authenticated
using (
  module_id not in ('internal-1', 'internal-2', 'internal-3')
  or public.membership_can_read_module_v2(module_id)
);

create policy "Internal tier reads presentation files"
on storage.objects as restrictive for select to authenticated
using (
  bucket_id <> 'module-materials'
  or split_part(name, '/', 1) not in ('internal-1', 'internal-2', 'internal-3')
  or public.membership_can_read_module_v2(split_part(name, '/', 1))
);

alter table public.module_materials
add constraint internal_presentation_material_private_path
check (
  module_id not in ('internal-1', 'internal-2', 'internal-3')
  or starts_with(url, 'storage:' || module_id || '/')
);
