process.on('uncaughtException', error => { console.error(error.message); process.exit(1); });
import { admin, createMembershipDb } from './fixtures/membership-db.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
const student = '00000000-0000-0000-0000-000000000002';
const db = await createMembershipDb();
const value = async (sql, params = []) => (await db.query(sql, params)).rows[0]?.value;
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
