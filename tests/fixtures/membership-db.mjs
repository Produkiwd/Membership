import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

// Shared synthetic Supabase schema for PostgreSQL integration checks.
export const admin = '00000000-0000-0000-0000-000000000001';
export async function createMembershipDb() {
  const db = new PGlite();
  await db.exec(`
  set time zone 'UTC';
  create role anon; create role authenticated; create role service_role;
  create schema auth; create schema membership; create schema addressbook; create schema storage;
  create table auth.users(id uuid primary key default gen_random_uuid(),email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
  create table addressbook.people(id uuid primary key default gen_random_uuid(),full_name text,primary_email text,primary_email_normalized text generated always as(lower(trim(primary_email))) stored,source text,updated_at timestamptz default now());
  create table membership.roles(code text primary key,is_admin boolean);
  insert into membership.roles values('admin',true),('member',false);
  create table membership.tiers(code text primary key);
  insert into membership.tiers values('community'),('professional'),('leaders'),('internal'),('sinad_student'),('sinad_teacher'),('twc'),('ai_os');
  create table membership.groups(id uuid primary key default gen_random_uuid(),code text unique,name text unique,is_active boolean default true,created_at timestamptz default now(),updated_at timestamptz default now());
  create table membership.members(id uuid primary key default gen_random_uuid(),person_id uuid references addressbook.people(id),user_id uuid references auth.users(id),email text,email_normalized text generated always as(lower(trim(email))) stored,display_name text,role_code text references membership.roles(code),tier_code text references membership.tiers(code),group_id uuid references membership.groups(id),status text default 'active',source text,source_ref text,metadata jsonb default '{}',expires_at timestamptz,created_at timestamptz default now(),updated_at timestamptz default now(),deleted_at timestamptz);
  create function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=timezone('utc'::text,now());return new;end $$;
  create trigger members_set_updated_at before update on membership.members for each row execute function public.set_updated_at();
  create table membership.program_access(member_id uuid references membership.members(id),program_code text,is_active boolean,expires_at timestamptz,primary key(member_id,program_code));
  create table membership.website_access(member_id uuid references membership.members(id),website_code text,is_active boolean,expires_at timestamptz,primary key(member_id,website_code));
  create table public.module_materials(id uuid primary key default gen_random_uuid(),module_id text,url text);
  alter table public.module_materials enable row level security;
  create policy original_module_read on public.module_materials for select to authenticated using(true);
  create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
  alter table storage.objects enable row level security;
  create policy original_storage_read on storage.objects for select to authenticated using(bucket_id='module-materials');
  grant usage on schema auth,membership,storage to authenticated;
  grant select on public.module_materials,storage.objects to authenticated;
  create function membership.current_email() returns text language sql security definer stable as $$ select email from auth.users where id=auth.uid() $$;
  create function public.membership_current_email() returns text language sql security definer stable as $$ select membership.current_email() $$;
  create function membership.is_admin() returns boolean language sql stable as $$ select coalesce(auth.uid()='${admin}'::uuid,false) $$;
  create function membership.has_website_access(code text) returns boolean language sql security definer stable as $$ select exists(select 1 from membership.members m join membership.website_access w on w.member_id=m.id where m.user_id=auth.uid() and w.website_code=code and w.is_active and m.deleted_at is null and m.status='active' and (m.expires_at is null or m.expires_at>now())) $$;
  create function public.membership_tier_code(t text) returns text language sql immutable as $$ select case lower(t) when 'ai os' then 'ai_os' when 'student' then 'sinad_student' when 'teacher' then 'sinad_teacher' else lower(t) end $$;
  create function public.membership_tier_name(t text) returns text language sql immutable as $$ select case t when 'ai_os' then 'AI OS' when 'twc' then 'TWC' when 'sinad_teacher' then 'Teacher' when 'sinad_student' then 'Student' else initcap(t) end $$;
  `);
  await db.exec(await readFile(new URL('./membership-existing-rpcs.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../../supabase/migrations/20261009015015_member_access_v2.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../../supabase/migrations/20261009022238_member_access_v2_trigger_timestamp_fix.sql', import.meta.url), 'utf8'));
  return db;
}
