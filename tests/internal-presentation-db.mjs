import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { admin, createMembershipDb } from './fixtures/membership-db.mjs';

const db = await createMembershipDb();
const internal = '00000000-0000-0000-0000-000000000010';
const regular = '00000000-0000-0000-0000-000000000011';
const expired = '00000000-0000-0000-0000-000000000012';
try {
  await db.exec(await readFile(new URL('../supabase/migrations/20261125023256_internal_presentation_materials.sql', import.meta.url), 'utf8'));
  await db.exec(`
    insert into auth.users(id,email) values
      ('${internal}','internal@example.test'), ('${regular}','regular@example.test'),
      ('${expired}','expired@example.test'), ('${admin}','admin@example.test');
    insert into membership.members(user_id,email,role_code,tier_code,expires_at) values
      ('${internal}','internal@example.test','member','internal',null),
      ('${regular}','regular@example.test','member','leaders',null),
      ('${expired}','expired@example.test','member','internal',now() - interval '1 hour'),
      ('${admin}','admin@example.test','admin','leaders',null);
    insert into membership.program_access select id,'aif',true,null from membership.members;
    insert into public.module_materials(module_id,url) values
      ('06','storage:act/existing.html'),
      ('internal-1','storage:internal-1/demo.html'),
      ('internal-2','storage:internal-2/demo.html'),
      ('internal-3','storage:internal-3/demo.html');
    insert into storage.objects(bucket_id,name)
      select 'module-materials',substring(url from 9) from public.module_materials;
  `);
  await assert.rejects(db.query("insert into public.module_materials(module_id,url) values ('internal-2','storage:act/wrong.html')"), /internal_presentation_material_private_path/);
  await assert.rejects(db.query("insert into public.module_materials(module_id,url) values ('internal-2','https://example.test/live.html')"), /internal_presentation_material_private_path/);
  await db.exec('set role authenticated');
  for (const [user, count] of [[internal, 3], [regular, 0], [expired, 0], [admin, 0]]) {
    await db.query("select set_config('test.uid',$1,false)", [user]);
    const rows = await db.query("select module_id from public.module_materials where module_id like 'internal-%'");
    const files = await db.query("select name from storage.objects where name like 'internal-%'");
    assert.equal(rows.rows.length, count);
    assert.equal(files.rows.length, count);
    if (user !== expired) {
      assert.equal((await db.query("select name from storage.objects where name = 'act/existing.html'")).rows.length, 1);
    }
  }
  console.log('PASS: Internal reads three folders. Regular, expired Internal and non-Internal admin cannot read their rows or files. Existing ACT access is preserved.');

  await db.exec(`
    reset role;
    update membership.members set tier_code = 'internal' where user_id = '${admin}';
    create function public.membership_is_admin() returns boolean language sql stable
      as $$ select membership.is_admin() $$;
    grant insert on storage.objects, public.module_materials to authenticated;
    create policy upload_material_file on storage.objects for insert to authenticated
      with check (bucket_id = 'module-materials' and public.membership_is_admin());
    create policy insert_material_row on public.module_materials for insert to authenticated
      with check (public.membership_is_admin());
    set role authenticated;
  `);
  await assert.equal((await db.query("select auth.uid() = $1 as active", [admin])).rows[0].active, true);
  for (const moduleId of ['internal-1', 'internal-2', 'internal-3']) {
    const path = moduleId + '/new-upload.html';
    await db.query("insert into storage.objects(bucket_id,name) values ('module-materials',$1)", [path]);
    const added = await db.query("insert into public.module_materials(module_id,url) values ($1,$2) returning url", [moduleId, 'storage:' + path]);
    assert.equal(added.rows[0].url, 'storage:' + path);
  }
  await db.query("select set_config('test.uid',$1,false)", [internal]);
  assert.equal((await db.query("select name from storage.objects where name like 'internal-%/new-upload.html'")).rows.length, 3);
  await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('module-materials','internal-1/member-upload.html')"), /row-level security/);
  console.log('PASS: Internal admin can upload and register files in every folder. Internal member can read them and cannot upload.');
} finally {
  await db.close();
}
