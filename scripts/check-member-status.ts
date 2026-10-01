import assert from 'node:assert/strict';
import { filterMemberCategory, memberCounts, memberState, memberStatusLabel } from '../src/lib/memberStatus';
import { filterMembers } from '../src/lib/memberSearch';

const now = Date.parse('2026-10-01T12:00:00Z');
const expires = (value: string) => ({ toDate: () => new Date(value) });
const rows = [
  { id: 'synthetic-1', name: 'Dian Contoh', email: 'dian@example.test', group: 'A', status: 'active', expiresAt: expires('2026-10-02T12:00:00Z') },
  { id: 'synthetic-2', name: 'Fajar Contoh', email: 'fajar@example.test', group: 'A', status: 'active', expiresAt: expires('2026-10-01T12:00:00Z') },
  { id: 'synthetic-3', name: 'Ayu Contoh', email: 'ayu@example.test', group: 'B', status: 'disabled', expiresAt: null },
  { id: 'synthetic-4', name: 'Rani Contoh', email: 'rani@example.test', group: 'B', status: 'active', expiresAt: expires('invalid') },
  { id: 'synthetic-5', name: 'Budi Contoh', email: 'budi@example.test', group: 'B', status: ' ACTIVE ', expiresAt: null },
];
assert.deepEqual(memberCounts(rows, now), { all: 5, active: 2, expired: 1, other: 2 });
assert.equal(memberState(rows[1], now), 'expired'); // Exact expiry boundary.
assert.equal(memberState({ status: 'pending', expiresAt: rows[0].expiresAt }, now), 'other');
assert.equal(memberState({ expiresAt: null }, now), 'other'); // No implicit activation.
assert.equal(memberState({ status: 'expired' }, now), 'expired');
assert.equal(memberStatusLabel(rows[2], now), 'Nonaktif');
assert.equal(memberStatusLabel(rows[3], now), 'Tanggal tidak valid');
assert.equal(memberState({ status: 'active', expiresAt: { toDate: () => { throw Error('synthetic'); } } }, now), 'other');
assert.equal(filterMemberCategory(rows, 'all', now), rows);
assert.deepEqual(filterMemberCategory(rows, 'active', now).map(row => row.id), ['synthetic-1', 'synthetic-5']);
assert.deepEqual(filterMembers(filterMemberCategory(rows, 'expired', now), ' FAJAR ', 'A').map(row => row.id), ['synthetic-2']);
assert.equal(filterMembers(filterMemberCategory(rows, 'expired', now), 'fajar', 'B').length, 0);
assert.equal(filterMemberCategory(rows, 'active', now + 86400_000).length, 1); // Expiry advances without editing data.
assert.equal(rows.length, 5);
assert.equal(rows[1].status, 'active'); // Classification never rewrites the stored status.
console.log('PASS: kategori, batas kedaluwarsa, status nonaktif, tanggal rusak, hitungan, pencarian/grup, dan data tetap utuh.');
