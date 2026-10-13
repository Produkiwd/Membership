import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanFields, compilePrompt, diffWords, groupJourneys, type JournalEntry } from './promptJournal';

test('compilePrompt keeps only filled fields of the chosen framework, without placeholder text', () => {
  const fields = { a: ' Analis ', t: 'Ringkas', i: 'Dampak', c: '   ' };
  assert.equal(compilePrompt(fields, 'ACT'), '[Peran & Audiens]\nAnalis\n\n[Tugas & Target]\nRingkas');
  assert.deepEqual(cleanFields(fields, 'ACTIONS'), { a: 'Analis', t: 'Ringkas', i: 'Dampak' });
  assert.equal(compilePrompt({}, 'ACTIONS'), '');
});

test('free-form prompts keep the text as written and ignore formula fields', () => {
  const prompt = '<task>\nRingkas laporan\n</task>';
  const fields = { a: 'Analis', b: `  ${prompt}  ` };
  assert.equal(compilePrompt(fields, 'FREE'), prompt);
  assert.deepEqual(cleanFields(fields, 'FREE'), { b: prompt });
  assert.deepEqual(cleanFields(fields, 'ACTIONS'), { a: 'Analis' });
});

test('diffWords marks removed and added words and rebuilds both texts', () => {
  const parts = diffWords('Ringkas laporan ini', 'Ringkas laporan jadi 5 poin');
  const rebuild = (skip: string) => parts.filter(p => p.type !== skip).map(p => p.text).join('');
  assert.equal(rebuild('added'), 'Ringkas laporan ini');
  assert.equal(rebuild('removed'), 'Ringkas laporan jadi 5 poin');
  assert.deepEqual(parts[0], { text: 'Ringkas laporan ', type: 'same' });
});

test('groupJourneys splits by author and material and sorts versions', () => {
  const entry = (authorId: string, materialKey: string, version: number) => ({ authorId, materialKey, version } as JournalEntry);
  const journeys = groupJourneys([entry('a', 'm1', 2), entry('b', 'm1', 1), entry('a', 'm1', 1), entry('a', 'm2', 1)]);
  assert.deepEqual(journeys.map(j => j.map(e => `${e.authorId}${e.materialKey}v${e.version}`)), [['am1v1', 'am1v2'], ['bm1v1'], ['am2v1']]);
});
