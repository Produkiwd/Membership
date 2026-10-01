type MemberStatusSource = {
  status?: string | null;
  expiresAt?: { toDate: () => Date } | null;
};
export type MemberCategory = 'all' | 'active' | 'expired';

export function memberExpiryTime(member: MemberStatusSource): number | null {
  if (!member.expiresAt) return null;
  try {
    return member.expiresAt.toDate().getTime();
  } catch {
    return NaN;
  }
}

export function memberState(member: MemberStatusSource, now: number): 'active' | 'expired' | 'other' {
  const expiry = memberExpiryTime(member);
  if (expiry !== null && !Number.isFinite(expiry)) return 'other';
  const status = (member.status || '').trim().toLowerCase();
  if (status === 'expired' || (expiry !== null && expiry <= now)) return 'expired';
  return status === 'active' ? 'active' : 'other';
}

export function memberStatusLabel(member: MemberStatusSource, now: number): string {
  const expiry = memberExpiryTime(member);
  if (expiry !== null && !Number.isFinite(expiry)) return 'Tanggal tidak valid';
  const state = memberState(member, now);
  if (state === 'active') return 'Aktif';
  if (state === 'expired') return 'Kedaluwarsa';
  const status = (member.status || '').trim().toLowerCase();
  if (status === 'pending') return 'Menunggu aktivasi';
  if (['disabled', 'inactive', 'suspended', 'blocked'].includes(status)) return 'Nonaktif';
  return 'Status perlu diperiksa';
}

export function filterMemberCategory<T extends MemberStatusSource>(members: T[], category: MemberCategory, now: number): T[] {
  return category === 'all' ? members : members.filter((member) => memberState(member, now) === category);
}

export function memberCounts(members: MemberStatusSource[], now: number) {
  const counts = { all: members.length, active: 0, expired: 0, other: 0 };
  for (const member of members) counts[memberState(member, now)]++;
  return counts;
}
