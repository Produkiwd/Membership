process.on('uncaughtException', error => { console.error(error.message); process.exit(1); });
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
const admin = '00000000-0000-0000-0000-000000000001';
const student = '00000000-0000-0000-0000-000000000002';
const db = new PGlite();
const value = async (sql, params = []) => (await db.query(sql, params)).rows[0]?.value;
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
await db.exec(await readFile(new URL('./fixtures/membership-existing-rpcs.sql', import.meta.url), 'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/20261009015015_member_access_v2.sql', import.meta.url), 'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/20261009022238_member_access_v2_trigger_timestamp_fix.sql', import.meta.url), 'utf8'));
await db.query('insert into auth.users(id,email) values($1,$2),($3,$4)', [admin, 'admin@example.test', student, 'member@example.test']);
await db.query("select set_config('test.uid',$1,false)", [admin]);
const input = (overrides = {}) => ({ access: { version: 2, tiers: ['aif_how_to'], modules: ['thinking_with_claude'], sinadRole: 'student' }, role: 'member', expiry: '2099-10-09', portals: ['aif'], groupName: 'Batch Sintetis', sinadMateri: false, sinadExercise: false, ...overrides });
let member = await value("select public.membership_admin_create_member_v2('member@example.test','Member Sintetis',$1::jsonb) value", [JSON.stringify(input())]);
let passed = 0;
async function check(name, callback) { await callback(); passed++; console.log('PASS', name); }
await check('Create links existing Auth identity and saves canonical permissions', async () => {
  assert.equal(member.userId, student); assert.deepEqual(member.accessV2.modules.sort(), ['strategize','thinking_with_claude']);
  assert.equal(member.group,'Batch Sintetis'); assert.equal(member.expiryDate,'2099-10-09');
  assert.equal(new Date(member.expiresAt).toISOString(),'2099-10-09T17:00:00.000Z');
});
await check('Duplicate create does not overwrite existing member', async () => {
  await assert.rejects(value("select public.membership_admin_create_member_v2('member@example.test','Other',$1::jsonb) value", [JSON.stringify(input())]), /sudah terdaftar/);
  assert.equal(await value('select count(*)::int value from membership.members'),1);
});
await check('Case-insensitive batch reuse and similar names stay distinct', async () => {
  const first = await value("select public.membership_admin_add_group_v2('Batch A/B') value");
  const same = await value("select public.membership_admin_add_group_v2('batch a/b') value");
  const other = await value("select public.membership_admin_add_group_v2('Batch A-B') value");
  assert.equal(first.id,same.id); assert.notEqual(first.id,other.id);
});
await check('Invalid portal, module, role, empty module, and date are rejected', async () => {
  const invalid = [input({ portals: ['unknown'] }), input({ role: 'superadmin' }), input({ expiry: '2026-02-30' }), input({ access: { version: 2, tiers: ['aif'], modules: [], sinadRole: 'student' } }), input({ access: { version: 2, tiers: ['aif'], modules: ['thinking_with_claude'], sinadRole: 'student' } }), input({ access: { version: 2, tiers: ['aif'], modules: ['invented'], sinadRole: 'student' } })];
  for (const candidate of invalid) await assert.rejects(value('select membership.validate_access_v2($1::jsonb) value',[JSON.stringify(candidate)]));
});
await check('Successful update keeps unrelated metadata and captures original state', async () => {
  await db.query("update membership.members set metadata=metadata||'{\"otherDashboard\":true}'::jsonb where id=$1",[member.id]);
  const previous = await value('select updated_at::text value from membership.members where id=$1',[member.id]);
  member = await value('select public.membership_admin_save_member_v2($1,$2::jsonb,$3) value',[member.id,JSON.stringify(input({ groupName:'Batch Lanjutan' })),previous]);
  assert.equal(member.group,'Batch Lanjutan');
  assert.equal(await value("select (metadata->>'otherDashboard')::boolean value from membership.members where id=$1",[member.id]),true);
  const history = await value('select member_before value from membership.member_access_v2_history where member_id=$1 order by id desc limit 1',[member.id]);
  assert.equal(new Date(history.updated_at).getTime(),new Date(previous).getTime());
});
await check('Stale edits are rejected without changing group or access', async () => {
  await assert.rejects(value('select public.membership_admin_save_member_v2($1,$2::jsonb,$3) value',[member.id,JSON.stringify(input({groupName:'Stale Batch'})),'2000-01-01']),/Data member berubah/);
  assert.equal(await value("select count(*)::int value from membership.groups where name='Stale Batch'"),0);
});
await check('IDL website is granted for AIF even without an explicit portal flag', async () => {
  assert.equal(await value("select is_active value from membership.website_access where member_id=$1 and website_code='idl'",[member.id]),true);
});
await db.query("select set_config('test.uid',$1,false)",[student]);
await check('Non-admin cannot list, save, create, or add groups', async () => {
  for (const query of ['select public.membership_admin_catalog_v2() value',"select public.membership_admin_add_group_v2('Denied') value",'select public.membership_admin_save_member_v2($1,$2::jsonb,$3) value']) {
    await assert.rejects(value(query,query.includes('$1') ? [member.id,JSON.stringify(input()),member.updatedAt] : []),/Admin access required/);
  }
  await assert.rejects(value("select public.membership_admin_validate_create_v2('new@example.test',$1::jsonb) value",[JSON.stringify(input())]),/Admin access required/);
});
await check('Own profile and Think / Claude permission remain distinct', async () => {
  const profile = await value('select public.membership_get_my_profile_v2() value');
  assert.equal(profile.id,member.id);
  assert.equal(await value("select public.membership_can_read_module_v2('08') value"),true);
  assert.equal(await value("select public.membership_can_read_module_v2('04') value"),false);
  assert.equal(await value("select public.membership_can_read_module_v2('02') value"),false);
});
await db.exec("insert into public.module_materials(module_id,url) values('01','storage:strategize/example.html'),('02','storage:prompt/example.html'),('04','storage:think/example.html'); insert into storage.objects(bucket_id,name) values('module-materials','strategize/example.html'),('module-materials','prompt/example.html'),('module-materials','think/example.html');");
await db.exec('set role authenticated');
await check('RLS permits basic + shared Claude source and blocks Prompt file', async () => {
  const materials = await db.query('select module_id from public.module_materials order by module_id');
  assert.deepEqual(materials.rows.map(r=>r.module_id),['01','04']);
  const files = await db.query('select name from storage.objects order by name');
  assert.deepEqual(files.rows.map(r=>r.name),['strategize/example.html','think/example.html']);
  await assert.rejects(db.query('select * from membership.member_access_v2_history'),/permission denied/);
  await assert.rejects(value('select membership.effective_access_v2($1) value',[member.id]),/permission denied/);
});
await db.exec('reset role');
await db.query("select set_config('test.uid',$1,false)",[admin]);
await check('Internal canonicalization grants all nine modules and all portals', async () => {
  member = await value('select public.membership_admin_save_member_v2($1,$2::jsonb,$3) value',[member.id,JSON.stringify(input({access:{version:2,tiers:['internal'],modules:[],sinadRole:'student'},portals:[]})),member.updatedAt]);
  assert.equal(member.accessV2.modules.length,9); assert.deepEqual(member.allowedPortals.sort(),['aif','idl','sinad']);
});
await check('SinaD role and student permissions are persisted separately', async () => {
  member = await value('select public.membership_admin_save_member_v2($1,$2::jsonb,$3) value',[member.id,JSON.stringify(input({access:{version:2,tiers:['sinad'],modules:[],sinadRole:'student'},portals:['sinad'],sinadMateri:true,sinadExercise:false})),member.updatedAt]);
  assert.equal(member.tier,'Student'); assert.equal(member.sinadMateri,true); assert.equal(member.sinadExercise,false);
});
await check('Expired accounts remain stored and are omitted from admin list', async () => {
  member = await value('select public.membership_admin_save_member_v2($1,$2::jsonb,$3) value',[member.id,JSON.stringify(input({expiry:'2000-01-01'})),member.updatedAt]);
  const catalog = await value('select public.membership_admin_catalog_v2() value');
  assert.equal(catalog.members.length,0); assert.equal(await value('select count(*)::int value from membership.members'),1);
  await db.query("select set_config('test.uid',$1,false)",[student]);
  assert.equal(await value("select public.membership_can_read_module_v2('08') value"),false);
});
await db.query("select set_config('test.uid',$1,false)",[admin]);
await check('Recovery restores the previous edit without deleting any member', async () => {
  const latest = await value('select max(id)::int value from membership.member_access_v2_history where member_id=$1',[member.id]);
  await db.query('select membership.restore_member_access_v2($1,$2)',[member.id,latest]);
  const restored = await value('select membership.member_json_v2($1) value',[member.id]);
  assert.equal(restored.tier,'Student'); assert.equal(restored.sinadMateri,true);
  assert.equal(await value('select count(*)::int value from membership.members'),1);
  await assert.rejects(db.query('select membership.restore_member_access_v2($1,$2)',[member.id,latest]),/Cadangan bukan perubahan terakhir/);
});
await db.query("select set_config('test.uid','',false)");
await check('Anonymous access is denied', async () => {
  assert.equal(await value("select public.membership_can_read_module_v2('01') value"),false);
  await assert.rejects(value('select public.membership_admin_catalog_v2() value'),/Admin access required/);
});
await db.close();
console.log(`${passed} PostgreSQL integration checks passed (synthetic data only).`);
