import { CARD_KEYS, effectiveConfig, mapLegacyAccess, MODULE_KEYS, type MemberAccessConfig } from './memberAccessConfig';
export const AI_OS_TIER = 'AI OS';
export const AI_OS_GROUP = 'AI OS';

export const canAccessAifModule = (tier: string, moduleId: string, selection?: MemberAccessConfig): boolean => {
  const c = effectiveConfig(selection || mapLegacyAccess({ tier }));
  if (!c.portals.includes('aif')) return false;
  const key = CARD_KEYS[moduleId];
  return !!key && [...c.aif, ...c.howTo].some(label => MODULE_KEYS[label] === key);
};

export type PromptStudioSelection = {
  tiers: string[];
  aif: string[];
  howTo: string[];
  portals: string[];
};

export const canAccessPromptStudio = (tier: string, selection?: PromptStudioSelection): boolean => {
  if (selection) {
    if (selection.tiers.includes('Internal')) return true;
    if (!selection.portals.includes('aif')) return false;
    const extendedAif = selection.tiers.includes('AIF') && selection.aif.some(module => ['Prompt', 'Create', 'Think', 'Build', 'Act'].includes(module));
    const howTo = selection.tiers.includes('AIF How To') && selection.howTo.some(module => ['Thinking With Claude', 'AI Operating System', 'Selling Idea With AI'].includes(module));
    return extendedAif || howTo;
  }
  // Legacy accounts still use the saved server tier until module permissions are migrated.
  // Community represents AIF with Strategize only. SinaD and unknown tiers deny access.
  return ['professional', 'leaders', 'internal', 'twc', 'ai os'].includes(tier.trim().toLowerCase());
};
