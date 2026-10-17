// Usage: node scripts/gen-everyday-prompts.mjs docs/prompt-sehari-hari.md src/lib/everydayPrompts.ts
import fs from 'fs';
const md = fs.readFileSync(process.argv[2], 'utf8').replace(/\r/g, '');
const body = md.split('\n## Catatan untuk reviewer')[0];
const groups = body.split('\n## ').slice(1).map(sec => {
  const [head, ...rest] = sec.split('\n### ');
  const [, id, title] = head.match(/^([A-F])\. (.+)/);
  const desc = head.split('\n').slice(1).join('\n').replace(/---\s*$/, '').trim().split('\n\n')[0];
  const prompts = rest.map(p => {
    const [, pid, ptitle] = p.match(/^([A-F]\d)\. (.+)/);
    const when = p.match(/\*\*Kapan dipakai:\*\* (.+)/)[1];
    const prompt = p.match(/```\n([\s\S]*?)\n```/)[1];
    return { id: pid, title: ptitle, when, prompt };
  });
  return { id, title, desc, prompts };
});
const n = groups.reduce((a, g) => a + g.prompts.length, 0);
if (n !== 30) throw new Error('expected 30 prompts, got ' + n);
const out = `// Generated from docs/prompt-sehari-hari.md. Edit the Markdown, then run scripts/gen-everyday-prompts.mjs.
export type EverydayPrompt = { id: string; title: string; when: string; prompt: string };
export type EverydayPromptGroup = { id: string; title: string; desc: string; prompts: EverydayPrompt[] };

export const EVERYDAY_PROMPT_GROUPS: EverydayPromptGroup[] = ${JSON.stringify(groups, null, 2)};
`;
fs.writeFileSync(process.argv[3], out);
console.log(groups.map(g => g.id + ' ' + g.prompts.length + ' ' + g.desc.slice(0, 50)).join('\n'));
