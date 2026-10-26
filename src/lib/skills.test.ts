import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSkillMarkdown, isZipSkill } from './skills';

const skill = (front: string) => `---\n${front}\n---\n\n# Isi skill\n`;

test('accepts a valid SKILL.md, including CRLF and BOM', () => {
  assert.equal(checkSkillMarkdown(skill('name: tutor-deep-mastery\ndescription: Tutor yang bertanya.')), null);
  assert.equal(checkSkillMarkdown('﻿' + skill('name: a1\r\ndescription: x').replace(/\n/g, '\r\n')), null);
});

test('rejects missing frontmatter, name, bad name, or description', () => {
  assert.match(checkSkillMarkdown('# Tanpa frontmatter')!, /diawali/);
  assert.match(checkSkillMarkdown(skill('description: x'))!, /name belum/);
  assert.match(checkSkillMarkdown(skill('name: Tutor Deep\ndescription: x'))!, /huruf kecil/);
  assert.match(checkSkillMarkdown(skill('name: tutor\ndescription:'))!, /description belum/);
});

test('detects zip-style skill files', () => {
  assert.equal(isZipSkill('skills/x-tutor.zip'), true);
  assert.equal(isZipSkill('skills/x-tutor.SKILL'), true);
  assert.equal(isZipSkill('skills/x-SKILL.md'), false);
});
