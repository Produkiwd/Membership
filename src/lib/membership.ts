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
};

export type MemberRecord = Omit<RpcMember, 'expiresAt'> & {
  expiresAt: { toDate: () => Date } | null;
};

const toFirebaseLikeDate = (value?: string | null) => {
  if (!value) return null;
  return { toDate: () => new Date(value) };
};

export const normalizeMember = (member: RpcMember): MemberRecord => ({
  ...member,
  role: member.role === 'employee' || member.role === 'manager' ? 'member' : (member.role || 'member'),
  tier: member.tier || 'Professional',
  group: member.group || '',
  allowedPortals: member.allowedPortals?.length ? member.allowedPortals : ['aif'],
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

  await requireRpcData(supabase.rpc('membership_claim_account'));
  const profile = normalizeMember(await requireRpcData<RpcMember>(supabase.rpc('membership_get_my_profile')));

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

export const signOutMember = async () => {
  const { error } = await supabase.auth.signOut();
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

export const getMyMemberProfile = async () => {
  return normalizeMember(await requireRpcData<RpcMember>(supabase.rpc('membership_get_my_profile')));
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

export const createPendingMember = async (email: string, password: string) => {
  const { data, error } = await supabase.functions.invoke<{ member: RpcMember }>('admin-create-member-user', {
    body: {
      email,
      password,
      name: email.split('@')[0],
      role: 'member',
      tier: 'Professional',
      groupName: null,
      allowedPortals: ['aif'],
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
