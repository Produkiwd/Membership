export const AI_OS_TIER = 'AI OS';
export const AI_OS_GROUP = 'AI OS';
export const AI_OS_PORTALS = ['aif', 'idl'];

export const portalsForTier = (tier: string, portals: string[]): string[] =>
  tier === AI_OS_TIER ? [...AI_OS_PORTALS] : portals;

export const canAccessAifModule = (tier: string, moduleId: string): boolean => {
  if (tier === AI_OS_TIER) return moduleId === '01' || moduleId === '07';
  if (moduleId === '01') return true;
  if (moduleId === '02') return ['Professional', 'Leaders', 'Internal'].includes(tier);
  if (['03', '05', '06', '07'].includes(moduleId)) return ['Leaders', 'Internal'].includes(tier);
  if (moduleId === '04') return ['Internal', 'TWC'].includes(tier);
  return false;
};
