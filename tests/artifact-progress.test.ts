import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArtifactList } from '../src/lib/artifactProgress.ts';

test('Rows moved from the old built-in list keep their built-in id', () => {
  const list = buildArtifactList('02', [
    { id: 'r1', title: 'M1: Ngobrol dengan AI', url: 'https://signed/m1', legacy_key: 'M1: Ngobrol dengan AI' },
    { id: 'r2', title: 'Materi baru', url: 'https://signed/new' },
  ]);
  assert.deepEqual(list.map(item => item.id), ['02:builtin:M1: Ngobrol dengan AI', '02:remote:r2']);
});

test('Database order is kept and module 08 uses its own prefix on shared rows', async () => {
  const load = async () => 'storage copy';
  const list = buildArtifactList('08', [
    { id: 'b', title: 'Setup Claude', url: 'https://signed/b', legacy_key: 'Setup Claude' },
    { id: 'a', title: 'Thinking w/ Claude AI', url: 'https://signed/a', load },
  ]);
  assert.deepEqual(list.map(item => item.title), ['Setup Claude', 'Thinking w/ Claude AI']);
  assert.equal(list[0].id, '08:builtin:Setup Claude');
  assert.equal(await list[1].load!(), 'storage copy');
});
