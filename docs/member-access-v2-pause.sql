-- PREPARED RECOVERY ONLY: run after the exact recovery action is approved.
-- Preserves data, functions and history; disables v2 writes for normal clients.
begin;
revoke execute on function public.membership_admin_save_member_v2(uuid,jsonb,timestamptz) from authenticated;
revoke execute on function public.membership_admin_create_member_v2(text,text,jsonb) from authenticated;
revoke execute on function public.membership_admin_validate_create_v2(text,jsonb) from authenticated;
revoke execute on function public.membership_admin_add_group_v2(text) from authenticated;
commit;

-- Separate approval required: this restores the former broad material read rules.
-- Do not execute these statements unless that read-access change is approved.
-- alter policy "Module access v2 limits reads" on public.module_materials using (true);
-- alter policy "Module access v2 limits file reads" on storage.objects using (true);
