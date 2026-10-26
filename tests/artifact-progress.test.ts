import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArtifactList } from '../src/lib/artifactProgress.ts';

const builtinLoad = async () => 'repo copy';
const sections = [{ title: 'Materi AI First Day 1', htmls: [
  { title: 'M1: Ngobrol dengan AI', load: builtinLoad },
  { title: 'M2: Grounded Thinking & Learning', load: builtinLoad },
  { title: 'M3: Personal Knowledge Management', load: builtinLoad },
] }, { day: 'Day 2', title: 'Materi Day 2' }];

test('Remote row with a built-in title replaces the file but keeps id and position', async () => {
  const storageLoad = async () => 'storage copy';
  const list = buildArtifactList('02', sections, [{ id: 'r1', title: 'M2: Grounded Thinking & Learning', url: 'https://signed', load: storageLoad }]);
  assert.deepEqual(list.map(item => item.id), ['02:builtin:M1: Ngobrol dengan AI', '02:builtin:M2: Grounded Thinking & Learning', '02:builtin:M3: Personal Knowledge Management']);
  assert.equal(await list[1].load!(), 'storage copy');
  assert.equal(await list[0].load!(), 'repo copy');
});

test('Without a remote row the repo copy is used', async () => {
  const list = buildArtifactList('02', sections, []);
  assert.equal(list.length, 3);
  assert.equal(await list[1].load!(), 'repo copy');
});

test('Placeholder sections without a file are not overridden, other remote rows are appended', () => {
  const list = buildArtifactList('02', sections, [
    { id: 'r2', title: 'Materi Day 2', url: 'https://signed/day2' },
    { id: 'r3', title: 'Materi baru', url: 'https://signed/new' },
  ]);
  assert.deepEqual(list.map(item => item.id).slice(3), ['02:remote:r3']);
});
