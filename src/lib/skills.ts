export type SkillItem = { id: string; module_id: string; title: string; description: string | null; url: string; created_at: string };

export const isZipSkill = (path: string) => /\.(zip|skill)$/i.test(path);

// A single-file skill must carry name and description in its YAML frontmatter, or Claude, ChatGPT and Gemini reject it.
export function checkSkillMarkdown(text: string): string | null {
  const front = text.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!front) return 'File SKILL.md harus diawali blok --- berisi name dan description.';
  const name = front[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  if (!name) return 'Bagian name belum diisi di SKILL.md.';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) return 'name di SKILL.md harus huruf kecil dengan tanda hubung, misalnya tutor-deep-mastery.';
  if (!front[1].match(/^description:\s*\S/m)) return 'Bagian description belum diisi di SKILL.md.';
  return null;
}

// Upload pages and accepted formats checked in each app on 26 Oct 2026.
export const SKILL_TARGETS = [
  {
    label: 'Claude',
    url: 'https://claude.ai/customize/skills/new/upload',
    steps: 'Buka halaman unggah, lalu tarik file SKILL.md atau ZIP ke kotak yang tersedia. Kalau opsi unggah tidak muncul, aktifkan "Create and edit files" di Settings, Capabilities.',
  },
  {
    label: 'ChatGPT',
    url: 'https://chatgpt.com/skills',
    steps: 'Buka halaman Skills, klik Add, pilih Upload from your computer, lalu pilih file SKILL.md atau ZIP (maksimal 25 MB).',
  },
  {
    label: 'Gemini',
    url: 'https://gemini.google.com/customize/skills',
    steps: 'Buka halaman Skills, klik Create, pilih Upload, lalu pilih file SKILL.md. Gemini tidak menerima ZIP, jadi ekstrak dulu lalu unggah foldernya.',
  },
];
