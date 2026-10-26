// Each skill lives in public/skills/<id>/SKILL.md; <id> must be kebab-case and match the `name` in its frontmatter.
// Add public/skills/<id>.zip and set zip: true only when the skill has supporting files beyond SKILL.md.
export type SkillItem = { id: string; title: string; desc: string; zip?: boolean };

export const SKILLS: SkillItem[] = [];

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
