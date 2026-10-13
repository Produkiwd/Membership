process.on('uncaughtException', error => { console.error(error.message); process.exit(1); });
import { admin, createMembershipDb } from './fixtures/membership-db.mjs';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Synthetic accounts only: two members in one batch, one in another batch, one without Prompt Studio.
const ids = { a: '00000000-0000-0000-0000-00000000000a', b: '00000000-0000-0000-0000-00000000000b', c: '00000000-0000-0000-0000-00000000000c', d: '00000000-0000-0000-0000-00000000000d' };
const db = await createMembershipDb();
await db.exec(await readFile(new URL('../supabase/migrations/20261012090000_prompt_journal.sql', import.meta.url), 'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/20261013020000_prompt_journal_free_form.sql', import.meta.url), 'utf8'));
const value = async (sql, params = []) => (await db.query(sql, params)).rows[0]?.value;
const as = uid => db.query("select set_config('test.uid',$1,false)", [uid]);
await db.query('insert into auth.users(id,email) values($1,$2)', [admin, 'admin@example.test']);
for (const [k, id] of Object.entries(ids)) await db.query('insert into auth.users(id,email) values($1,$2)', [id, `${k}@example.test`]);
await as(admin);
const access = (modules, groupName) => JSON.stringify({ access: { version: 2, tiers: ['aif'], modules, sinadRole: 'student' }, role: 'member', expiry: '2099-12-31', portals: ['aif'], groupName, sinadMateri: false, sinadExercise: false });
await value("select public.membership_admin_create_member_v2('a@example.test','Peserta A',$1::jsonb) value", [access(['prompt'], 'Batch Satu')]);
await value("select public.membership_admin_create_member_v2('b@example.test','Peserta B',$1::jsonb) value", [access(['prompt'], 'Batch Satu')]);
await value("select public.membership_admin_create_member_v2('c@example.test','Peserta C',$1::jsonb) value", [access(['prompt'], 'Batch Dua')]);
await value("select public.membership_admin_create_member_v2('d@example.test','Peserta D',$1::jsonb) value", [access(['strategize'], 'Batch Satu')]);

const KEY = '02:builtin:AIF Prompting';
const save = (fields, notes = null, key = KEY) => value('select public.prompt_journal_save($1,$2,$3,$4::jsonb,$5,$6) value', [key, 'AIF Prompting', 'ACTIONS', JSON.stringify(fields), Object.values(fields).join('\n'), notes]);
const list = (key = null) => value('select public.prompt_journal_list($1) value', [key]);
let passed = 0;
async function check(name, callback) { await callback(); passed++; console.log('PASS', name); }

await db.exec('set role authenticated');
await check('Each save becomes the next version for that member and material', async () => {
  await as(ids.a);
  const v1 = await save({ a: 'Analis', t: 'Ringkas laporan' });
  const v2 = await save({ a: 'Analis senior', t: 'Ringkas laporan jadi 5 poin', x: 'dibuang', c: '  ' }, 'Lebih spesifik');
  assert.equal(v1.version, 1); assert.equal(v2.version, 2); assert.equal(v2.isMine, true);
  assert.deepEqual(v2.fields, { a: 'Analis senior', t: 'Ringkas laporan jadi 5 poin' });
  assert.equal(v2.notes, 'Lebih spesifik'); assert.equal(v2.authorName, 'Peserta A'); assert.equal(v2.batch, 'Batch Satu');
  assert.equal((await save({ t: 'Materi lain' }, null, '02:builtin:AIF Reading')).version, 1);
});
await check('Empty formulas and unknown materials are rejected', async () => {
  await assert.rejects(save({ a: ' ', t: '' }), /minimal satu kolom/);
  await assert.rejects(save({ t: 'x' }, null, 'bebas'), /check constraint/);
});
await check('Free-form prompts are saved as written; unknown frameworks are rejected', async () => {
  const free = await value('select public.prompt_journal_save($1,$2,$3,$4::jsonb,$5,$6) value', [KEY, 'AIF Prompting', 'FREE', JSON.stringify({ b: '<task>Ringkas</task>' }), '<task>Ringkas</task>', null]);
  assert.equal(free.framework, 'FREE'); assert.deepEqual(free.fields, { b: '<task>Ringkas</task>' });
  await db.query('select public.prompt_journal_delete($1)', [free.id]);
  await assert.rejects(value('select public.prompt_journal_save($1,$2,$3,$4::jsonb,$5,$6) value', [KEY, 'AIF Prompting', 'OTHER', JSON.stringify({ b: 'x' }), 'x', null]), /check constraint/);
});
await check('Batchmates see each other, other batches stay hidden', async () => {
  await as(ids.b); await save({ t: 'Versi B' });
  await as(ids.c); await save({ t: 'Versi C' });
  await as(ids.a);
  const seenByA = await list(KEY);
  assert.deepEqual(seenByA.map(e => `${e.authorName} v${e.version}`).sort(), ['Peserta A v1', 'Peserta A v2', 'Peserta B v1']);
  await as(ids.c);
  assert.deepEqual((await list()).map(e => e.authorName), ['Peserta C']);
});
await check('Members can only delete their own entries', async () => {
  await as(ids.a);
  const other = (await list(KEY)).find(e => e.authorName === 'Peserta B');
  await assert.rejects(db.query('select public.prompt_journal_delete($1)', [other.id]), /bukan milik Anda/);
  const own = (await list(KEY)).find(e => e.isMine && e.version === 1);
  await db.query('select public.prompt_journal_delete($1)', [own.id]);
  assert.equal((await list(KEY)).filter(e => e.isMine).length, 1);
});
await check('Strategize-only and anonymous users are denied, table is not directly readable', async () => {
  await as(ids.d);
  await assert.rejects(list(), /belum punya akses/);
  await assert.rejects(save({ t: 'x' }), /belum punya akses/);
  await as('');
  await assert.rejects(list(), /belum punya akses/);
  await as(ids.a);
  await assert.rejects(db.query('select * from public.prompt_journal_entries'), /permission denied/);
});
await check('Admin sees every batch', async () => {
  await as(admin);
  assert.deepEqual([...new Set((await list(KEY)).map(e => e.batch))].sort(), ['Batch Dua', 'Batch Satu']);
});
await db.close();
console.log(`${passed} Prompt Journal checks passed (synthetic data only).`);
