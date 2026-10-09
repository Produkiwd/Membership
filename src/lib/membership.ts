import { decodeAccessConfig, effectiveConfig, encodeAccessConfig, expiryDate, mapLegacyAccess, validateAccessConfig, type MemberAccessConfig, type StoredMemberAccess } from './memberAccessConfig';
import { markDailySession } from './dailySession';
import type { AuthChangeEvent, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type RpcMember = {
  id: string;
  userId?: string | null;
  email: string;
  name?: string | null;
  role?: string | null;
  status?: string | null;
  tier?: string | null;
  group?: string | null;
  allowedPortals?: string[] | null;
  expiresAt?: string | null;
  sinadMateri?: boolean | null;
  sinadExercise?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  accessV2?: StoredMemberAccess | null;
  expiryDate?: string | null;
};

export type MemberRecord = Omit<RpcMember, 'expiresAt'> & {
  expiresAt: { toDate: () => Date } | null;
  accessConfig?: MemberAccessConfig;
};

const toFirebaseLikeDate = (value?: string | null) => {
  if (!value) return null;
  return { toDate: () => new Date(value) };
};

export const normalizeMember = (member: RpcMember): MemberRecord => ({
  ...member,
  accessConfig: member.accessV2 ? decodeAccessConfig(member.accessV2, { ...mapLegacyAccess(member), expiry: member.expiryDate ?? expiryDate(member.expiresAt) }) : { ...mapLegacyAccess(member), expiry: member.expiryDate ?? (member.expiresAt ? new Date(member.expiresAt).toISOString().slice(0, 10) : '') },
  role: member.role === 'employee' || member.role === 'manager' ? 'member' : (member.role || 'member'),
  tier: member.tier || 'Professional',
  group: member.group || '',
  allowedPortals: member.allowedPortals ?? ['aif'],
  sinadMateri: Boolean(member.sinadMateri),
  sinadExercise: Boolean(member.sinadExercise),
  expiresAt: toFirebaseLikeDate(member.expiresAt),
});

const requireRpcData = async <T>(request: PromiseLike<{ data: T | null; error: any }>) => {
  const { data, error } = await request;
  if (error) throw error;
  return data as T;
};

export const signInMember = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (data.user) markDailySession(data.user.id);

  await requireRpcData(supabase.rpc('membership_claim_account'));
  const profile = await getMyMemberProfile();

  if (profile.expiresAt && profile.expiresAt.toDate() < new Date()) {
    await supabase.auth.signOut();
    const expiredError = new Error('EXPIRED');
    expiredError.name = 'ExpiredError';
    throw expiredError;
  }

  return { user: data.user, profile };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user || null;
};

export const onAuthUserChange = (callback: (user: User | null, event: AuthChangeEvent) => void) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event);
  });
  return () => data.subscription.unsubscribe();
};

export const signOutMember = async (scope: 'global' | 'local' = 'global') => {
  localStorage.removeItem('temp_password');
  localStorage.removeItem('member_last_activity_at');
  const { error } = await supabase.auth.signOut({ scope });
  if (error) throw error;
};

export const updateMemberPassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};

export const sendMemberPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
};

const missingRpc = (error: { code?: string }) => error.code === 'PGRST202' || error.code === '42883';
export const getMyMemberProfile = async () => {
  const result = await supabase.rpc('membership_get_my_profile_v2');
  if (!result.error) return normalizeMember(result.data);
  if (!missingRpc(result.error)) throw result.error;
  return normalizeMember(await requireRpcData<RpcMember>(supabase.rpc('membership_get_my_profile')));
};
export const listMemberCatalog = async () => {
  const result = await supabase.rpc('membership_admin_catalog_v2');
  if (!result.error) {
    if (result.data?.version !== 2 || !Array.isArray(result.data.members) || !Array.isArray(result.data.groups)) throw new Error('Format daftar member tidak sesuai.');
    return { ready: true, members: result.data.members.map(normalizeMember) as MemberRecord[], groups: result.data.groups as string[] };
  }
  if (!missingRpc(result.error)) throw result.error;
  const members = await listMembers();
  return { ready: false, members, groups: [...new Set(members.map(m => m.group || '').filter(Boolean))] };
};
export const accessSavePayload = (config: MemberAccessConfig, group: string) => {
  const c = validateAccessConfig(config);
  return { access: encodeAccessConfig(c), role: c.role, expiry: c.expiry, portals: c.portals, groupName: group.trim(), sinadMateri: !!c.sinadMateri, sinadExercise: !!c.sinadExercise };
};
export const saveMemberAccess = async (member: MemberRecord, config: MemberAccessConfig, group: string) => {
  if (!member.updatedAt) throw new Error('Versi data tidak tersedia. Muat ulang daftar.');
  const row = await requireRpcData<RpcMember>(supabase.rpc('membership_admin_save_member_v2', {
    p_member_id: member.id, p_input: accessSavePayload(config, group), p_expected_updated_at: member.updatedAt,
  }));
  return normalizeMember(row);
};
export const addMemberGroup = async (name: string) => {
  return requireRpcData<{ id: string; name: string }>(supabase.rpc('membership_admin_add_group_v2', { p_name: name }));
};
export const createMemberWithAccess = async (email: string, password: string, config: MemberAccessConfig, group: string) => {
  const input = accessSavePayload(config, group);
  const { data, error } = await supabase.functions.invoke<{ member?: RpcMember; error?: string; authUserCreated?: boolean }>('admin-create-member-user-v2', {
    body: { email: email.trim().toLowerCase(), password, input },
  });
  if (error) {
    // Function errors can include useful retry instructions, never print credentials or request bodies.
    if ('context' in error && error.context instanceof Response) {
      const body = await error.context.json().catch(() => null);
      if (body?.error) throw new Error(body.error);
    }
    throw new Error('Akun belum dapat dibuat. Pastikan layanan tambah member sudah aktif.');
  }
  if (data?.error) throw new Error(data.error);
  if (!data?.member?.accessV2) throw new Error('Penyimpanan akses member belum terkonfirmasi. Muat ulang daftar.');
  return { member: normalizeMember(data.member), authUserCreated: !!data.authUserCreated };
};

export const listMembers = async () => {
  const members = await requireRpcData<RpcMember[]>(supabase.rpc('membership_admin_list_members'));
  return members.map(normalizeMember);
};

export const updateMember = async (
  memberId: string,
  role: string,
  tier: string,
  expiresAt: string,
  allowedPortals: string[],
  sinadMateri: boolean,
  sinadExercise: boolean,
  group: string,
) => {
  await requireRpcData(supabase.rpc('membership_admin_update_member', {
    p_member_id: memberId,
    p_role: role,
    p_tier: tier,
    p_expires_at: expiresAt || null,
    p_allowed_portals: allowedPortals,
    p_sinad_materi: sinadMateri,
    p_sinad_exercise: sinadExercise,
    p_group_name: group || null,
  }));
};

export const createPendingMember = async (email: string, password: string, tier = 'Professional', group = '', allowedPortals = ['aif']) => {
  const { data, error } = await supabase.functions.invoke<{ member: RpcMember }>('admin-create-member-user', {
    body: {
      email,
      password,
      name: email.split('@')[0],
      role: 'member',
      tier,
      groupName: group || null,
      allowedPortals,
      expiresAt: null,
    },
  });

  if (error) throw error;
  if (!data?.member) throw new Error('Akun berhasil diproses, tapi data member tidak ditemukan.');

  return normalizeMember(data.member);
};

export const createMemberAccessOnly = async (email: string) => {
  const member = await requireRpcData<RpcMember>(supabase.rpc('membership_admin_create_member', {
    p_email: email,
    p_name: email.split('@')[0],
    p_role: 'member',
    p_tier: 'Professional',
    p_group_name: null,
    p_allowed_portals: ['aif'],
    p_expires_at: null,
  }));
  return normalizeMember(member);
};

export type { User };
