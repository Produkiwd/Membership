import assert from 'node:assert/strict';
import { artifactStats, artifactStorageKey, buildArtifactList, parseOpenedArtifacts } from '../src/lib/artifactProgress';

const sections = [{ title: 'Topik', htmls: [{ title: 'Panduan', content: '<p>Contoh sintetis</p>' }, { title: 'Materi Visual', images: [] }] }, { title: 'Belum tersedia' }];
const remote = [{ id: 'synthetic-file', title: 'Latihan', url: 'https://example.test/latihan' }, { id: 'duplicate', title: 'Panduan', url: 'https://example.test/duplicate' }];
const catalog = buildArtifactList('01', sections, remote);
assert.equal(catalog.length, 2); // Empty placeholders and duplicate built-ins do not count.
const opened = parseOpenedArtifacts(JSON.stringify([catalog[0].id, catalog[0].id, 'invalid', 123]));
assert.equal(opened.length, 1); // Reopening one artifact does not increase progress.
assert.deepEqual(artifactStats(catalog, opened), { opened: 1, total: 2, percent: 50 });
assert.deepEqual(artifactStats(catalog, [...opened, catalog[1].id]), { opened: 2, total: 2, percent: 100 });
assert.deepEqual(artifactStats([], opened), { opened: 0, total: 0, percent: 0 });
assert.deepEqual(parseOpenedArtifacts('broken'), []);
assert.deepEqual(parseOpenedArtifacts('{}'), []);
assert.equal(buildArtifactList('01', sections, [{ ...remote[0], url: 'https://example.test/refreshed-link' }])[1].id, catalog[1].id);
const larger = buildArtifactList('01', sections, [...remote, { id: 'new-file', title: 'Materi Baru', url: 'https://example.test/new' }]);
assert.equal(artifactStats(larger, [catalog[0].id, catalog[1].id]).percent, 67);
assert.equal(artifactStats([catalog[0]], [catalog[0].id, catalog[1].id]).opened, 1); // Removed/locked material never inflates progress.
assert.equal(buildArtifactList('01', sections, [{ id: 'image', title: 'Materi Visual 1', url: 'https://example.test/image' }]).length, 2);
assert.notEqual(artifactStorageKey('synthetic-a'), artifactStorageKey('synthetic-b'));
console.log('PASS: pembukaan unik, katalog dinamis, placeholder, identitas stabil, akun terpisah, dan persentase.');
