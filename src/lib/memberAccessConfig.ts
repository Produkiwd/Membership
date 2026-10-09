export const AIF_MODULES = ['Strategize', 'Prompt', 'Create', 'Think', 'Build', 'Act'];
export const HOW_TO_MODULES = ['Thinking With Claude', 'AI Operating System', 'Selling Idea With AI'];
export type MemberAccessConfig = {
  tiers: string[]; aif: string[]; howTo: string[]; sinadRole: string;
  role: string; expiry: string; portals: string[];
  sinadMateri?: boolean; sinadExercise?: boolean;
};
export type StoredMemberAccess = { version: 2; tiers: string[]; modules: string[]; sinadRole: string };
export const MODULE_KEYS: Record<string, string> = {
  Strategize: 'strategize', Prompt: 'prompt', Create: 'create', Think: 'think', Build: 'build', Act: 'act',
  'Thinking With Claude': 'thinking_with_claude', 'AI Operating System': 'ai_operating_system', 'Selling Idea With AI': 'selling_idea_with_ai',
};
export const CARD_KEYS: Record<string, string> = { '01': 'strategize', '02': 'prompt', '03': 'create', '04': 'think', '05': 'build', '06': 'act', '07': 'ai_operating_system', '08': 'thinking_with_claude', '09': 'selling_idea_with_ai' };
export function mapLegacyAccess(member: { tier?: string | null; role?: string | null; allowedPortals?: string[] | null; sinadMateri?: boolean | null; sinadExercise?: boolean | null }): MemberAccessConfig {
  const tier = (member.tier || '').trim().toLowerCase();
  const config: MemberAccessConfig = { tiers: [], aif: [], howTo: [], sinadRole: 'Student', role: member.role || 'member', expiry: '', portals: [...(member.allowedPortals ?? ['aif'])], sinadMateri: !!member.sinadMateri, sinadExercise: !!member.sinadExercise };
  if (tier === 'internal') config.tiers = ['Internal'];
  else if (['ai os', 'twc'].includes(tier)) { config.tiers = ['AIF How To']; config.howTo = [tier === 'twc' ? HOW_TO_MODULES[0] : HOW_TO_MODULES[1]]; }
  else if (['community', 'professional', 'leaders'].includes(tier)) { config.tiers = ['AIF']; config.aif = tier === 'leaders' ? [...AIF_MODULES] : tier === 'professional' ? AIF_MODULES.slice(0, 3) : ['Strategize']; }
  if (['student', 'teacher', 'student sinad', 'teacher sinad', 'sinad student', 'sinad teacher'].includes(tier) || config.portals.includes('sinad')) {
    config.tiers = [...new Set([...config.tiers, 'SinaD'])]; config.sinadRole = tier.includes('teacher') ? 'Teacher' : 'Student';
  }
  return config;
}
export function effectiveConfig(config: MemberAccessConfig): MemberAccessConfig {
  const internal = config.tiers.includes('Internal');
  const portals = internal ? ['aif', 'idl', 'sinad'] : [...new Set(config.portals)];
  const tiers = internal ? ['Internal'] : config.tiers.filter(t => t === 'SinaD' ? portals.includes('sinad') : ['AIF', 'AIF How To'].includes(t) && portals.includes('aif'));
  const howTo = internal ? [...HOW_TO_MODULES] : tiers.includes('AIF How To') ? config.howTo.filter(m => HOW_TO_MODULES.includes(m)) : [];
  const aif = internal ? [...AIF_MODULES] : tiers.includes('AIF') ? config.aif.filter(m => AIF_MODULES.includes(m)) : [];
  if (howTo.length && !aif.includes('Strategize')) aif.unshift('Strategize');
  return { ...config, tiers, portals, aif: [...new Set(aif)], howTo };
}
export function validateAccessConfig(config: MemberAccessConfig) {
  const c = effectiveConfig(config);
  if (!c.portals.length) throw new Error('Pilih minimal satu akses portal.');
  if (c.portals.some(p => !['aif', 'idl', 'sinad'].includes(p))) throw new Error('Portal tidak dikenal.');
  if (c.portals.includes('aif') && !c.aif.length && !c.howTo.length) throw new Error('Pilih minimal satu kotak untuk portal AIF.');
  if (c.portals.includes('sinad') && !c.tiers.includes('SinaD') && !c.tiers.includes('Internal')) throw new Error('Pilih tier SinaD untuk portal SinaD.');
  if (!['member', 'admin'].includes(c.role)) throw new Error('Role tidak dikenal.');
  if (c.expiry && (!/^\d{4}-\d{2}-\d{2}$/.test(c.expiry) || !Number.isFinite(Date.parse(c.expiry)) || new Date(c.expiry).toISOString().slice(0, 10) !== c.expiry)) throw new Error('Tanggal tidak valid.');
  return c;
}
export function encodeAccessConfig(config: MemberAccessConfig): StoredMemberAccess {
  const c = validateAccessConfig(config);
  const tierKeys: Record<string, string> = { AIF: 'aif', 'AIF How To': 'aif_how_to', Internal: 'internal', SinaD: 'sinad' };
  return { version: 2, tiers: c.tiers.map(t => tierKeys[t]), modules: [...c.aif, ...c.howTo].map(m => MODULE_KEYS[m]), sinadRole: c.sinadRole.toLowerCase() };
}
export function decodeAccessConfig(stored: StoredMemberAccess, base: MemberAccessConfig): MemberAccessConfig {
  const tiers: Record<string, string> = { aif: 'AIF', aif_how_to: 'AIF How To', internal: 'Internal', sinad: 'SinaD' };
  return effectiveConfig({ ...base, tiers: stored.tiers.map(t => tiers[t]).filter(Boolean), aif: AIF_MODULES.filter(m => stored.modules.includes(MODULE_KEYS[m])), howTo: HOW_TO_MODULES.filter(m => stored.modules.includes(MODULE_KEYS[m])), sinadRole: stored.sinadRole === 'teacher' ? 'Teacher' : 'Student' });
}
export function expiryDate(value?: string | null) {
  if (!value) return '';
  return new Date(new Date(value).getTime() + 7 * 3600000 - 1).toISOString().slice(0, 10);
}
