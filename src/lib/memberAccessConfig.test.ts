import assert from 'node:assert/strict';
import test from 'node:test';
import { AIF_MODULES, CARD_KEYS, decodeAccessConfig, effectiveConfig, encodeAccessConfig, mapLegacyAccess, MODULE_KEYS, validateAccessConfig, type MemberAccessConfig } from './memberAccessConfig';
import { canAccessAifModule, canAccessPromptStudio } from './access';
const config = (changes: Partial<MemberAccessConfig> = {}): MemberAccessConfig => ({ tiers: ['AIF How To'], aif: [], howTo: ['Thinking With Claude'], sinadRole: 'Student', role: 'member', expiry: '', portals: ['aif'], ...changes });
const mappings: [string,string[]][] = [
  ['Community',['01']],['Professional',['01','02','03']],['Leaders',['01','02','03','04','05','06']],
  ['TWC',['01','08']],['AI OS',['01','07']],['Internal',Object.keys(CARD_KEYS)],['SinaD Teacher',[]],['SinaD Student',[]],['Unknown',[]],
];
for (const [tier, expected] of mappings) test(`Legacy mapping ${tier} follows agreed access`, () => {
  assert.deepEqual(Object.keys(CARD_KEYS).filter(id => canAccessAifModule(tier,id)),expected);
});
test('Stable identifiers round-trip and automatic Strategize is saved', () => {
  const saved = encodeAccessConfig(config());
  assert.deepEqual(saved.modules,['strategize','thinking_with_claude']);
  const decoded = decodeAccessConfig(saved,config());
  assert.deepEqual(decoded.howTo,['Thinking With Claude']); assert.equal(canAccessAifModule('', '04',decoded),false); assert.equal(canAccessAifModule('','08',decoded),true);
});
test('Removing How To removes automatically added Strategize', () => {
  const selected = config();
  assert.deepEqual(effectiveConfig(selected).aif,['Strategize']);
  assert.deepEqual(effectiveConfig({ ...selected, howTo: [] }).aif,[]);
});
test('Internal grants all modules and keeps account role separate', () => {
  const c = effectiveConfig(config({tiers:['Internal'],role:'member',portals:[]}));
  assert.equal(c.role,'member'); assert.equal(encodeAccessConfig(c).modules.length,9); assert.equal(canAccessPromptStudio('',c),true);
});
test('Disabled portal removes latent choices from the saved payload', () => {
  const c = config({portals:['idl']});
  assert.deepEqual(encodeAccessConfig(c).modules,[]); assert.deepEqual(encodeAccessConfig(c).tiers,[]);
});
test('SinaD role and learning flags survive', () => {
  const c = config({tiers:['SinaD'],portals:['sinad'],howTo:[],sinadRole:'Teacher',sinadMateri:true});
  const decoded = decodeAccessConfig(encodeAccessConfig(c),c);
  assert.equal(decoded.sinadRole,'Teacher'); assert.equal(decoded.sinadMateri,true); assert.equal(canAccessPromptStudio('',decoded),false);
});
test('Empty AIF modules, invalid date and invalid role are rejected', () => {
  assert.throws(()=>validateAccessConfig(config({howTo:[]})));
  assert.throws(()=>validateAccessConfig(config({expiry:'2026-02-30'})));
  assert.throws(()=>validateAccessConfig(config({role:'root'})));
});
