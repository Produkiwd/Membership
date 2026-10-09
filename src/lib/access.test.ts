import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessPromptStudio, type PromptStudioSelection } from './access';

for (const tier of ['Community', 'AIF - Strategize', 'SinaD', 'Student', 'Teacher', 'Student SinaD', 'Teacher SinaD', 'Unknown', '']) {
  test(`Prompt Studio denies restricted or unmapped tier: ${tier || '(empty)'}`, () => assert.equal(canAccessPromptStudio(tier), false));
}
for (const tier of ['Professional', 'Leaders', 'Internal', 'TWC', 'AI OS']) {
  test(`Prompt Studio permits existing tier: ${tier}`, () => assert.equal(canAccessPromptStudio(tier), true));
}
const selection = (overrides: Partial<PromptStudioSelection>): PromptStudioSelection => ({ tiers: ['AIF'], aif: ['Strategize'], howTo: [], portals: ['aif'], ...overrides });
const cases: [string, PromptStudioSelection, boolean][] = [
  ['Strategize alone', selection({}), false],
  ['SinaD alone', selection({ tiers: ['SinaD'], aif: [], portals: ['sinad'] }), false],
  ['Strategize plus SinaD', selection({ tiers: ['AIF', 'SinaD'], portals: ['aif', 'sinad'] }), false],
  ['Strategize plus Prompt', selection({ aif: ['Strategize', 'Prompt'] }), true],
  ['TWC with automatic Strategize', selection({ tiers: ['AIF How To'], aif: [], howTo: ['Thinking With Claude'] }), true],
  ['AI Operating System', selection({ tiers: ['AIF How To'], howTo: ['AI Operating System'] }), true],
  ['Strategize plus How To', selection({ tiers: ['AIF', 'AIF How To'], howTo: ['Thinking With Claude'] }), true],
  ['SinaD plus extended AIF', selection({ tiers: ['AIF', 'SinaD'], aif: ['Strategize', 'Create'], portals: ['aif', 'sinad'] }), true],
  ['How To category without a module', selection({ tiers: ['AIF How To'], aif: [] }), false],
  ['Module selections while AI First portal is disabled', selection({ aif: ['Prompt'], portals: ['sinad'] }), false],
  ['Internal all access', selection({ tiers: ['Internal'], aif: [], portals: [] }), true],
];
for (const [name, config, expected] of cases) test(name, () => assert.equal(canAccessPromptStudio('', config), expected));
