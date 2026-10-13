export type FormulaKey = 'a' | 'c' | 't' | 'i' | 'o' | 'n' | 's' | 'b';
export type FormulaFields = Partial<Record<FormulaKey, string>>;
export type Framework = 'ACTIONS' | 'ACT' | 'FREE';

export const FRAMEWORK_LABELS: Record<Framework, string> = { ACTIONS: 'A.C.T.I.O.N.S.', ACT: 'ACT', FREE: 'Bebas' };
export type PromptMaterial = { key: string; title: string };

export type JournalEntry = {
  id: string;
  materialKey: string;
  materialTitle: string;
  version: number;
  framework: Framework;
  fields: FormulaFields;
  promptText: string;
  notes: string | null;
  createdAt: string;
  isMine: boolean;
  authorId: string;
  authorName: string;
  batch: string | null;
};

// `hint` is a guiding question shown under each field: it steers thinking without giving an answer to copy.
// `act` marks the three parts of the quick ACT formula. The free-form box ('b') is used only by the Bebas option.
export const FORMULA_PARTS: { key: FormulaKey; letter: string; label: string; heading: string; hint: string; act: boolean }[] = [
  { key: 'a', letter: 'A', label: 'Peran & Audiens', heading: 'Peran & Audiens', act: true,
    hint: 'Siapa AI saat menjawab, dan untuk siapa hasilnya ditulis?' },
  { key: 'c', letter: 'C', label: 'Situasi & Latar Belakang', heading: 'Situasi & Latar Belakang', act: true,
    hint: 'Apa yang sedang terjadi? Fakta, angka, atau kendala apa yang perlu AI ketahui?' },
  { key: 't', letter: 'T', label: 'Tugas & Target Hasil', heading: 'Tugas & Target', act: true,
    hint: 'Apa persisnya yang harus AI kerjakan? Mulai dengan kata kerja: susun, analisis, ringkas, bandingkan.' },
  { key: 'i', letter: 'I', label: 'Dampak yang Diharapkan', heading: 'Dampak yang Diharapkan', act: false,
    hint: 'Setelah membaca hasilnya, keputusan atau tindakan apa yang Anda harapkan dari pembacanya?' },
  { key: 'o', letter: 'O', label: 'Format Keluaran', heading: 'Format Keluaran', act: false,
    hint: 'Hasilnya berbentuk apa, dan seberapa panjang? Email, tabel, poin-poin, atau memo satu halaman?' },
  { key: 'n', letter: 'N', label: 'Batasan & Pantangan', heading: 'Batasan & Pantangan', act: false,
    hint: 'Apa yang tidak boleh dilakukan AI? Pikirkan nada bicara, asumsi tanpa data, atau batas jumlah kata.' },
  { key: 's', letter: 'S', label: 'Urutan Langkah', heading: 'Urutan Langkah', act: false,
    hint: 'Langkah berpikir apa yang perlu AI ikuti sebelum memberi jawaban akhir?' },
  { key: 'b', letter: '', label: 'Prompt Bebas', heading: '', act: false,
    hint: 'Tulis prompt dalam bentuk apa pun: paragraf, daftar, tag XML, atau template Anda sendiri.' },
];

export const partsFor = (framework: Framework) => FORMULA_PARTS.filter(part =>
  framework === 'FREE' ? part.key === 'b' : part.key !== 'b' && (framework === 'ACTIONS' || part.act));

// Keeps only the fields of the chosen framework that have text.
export function cleanFields(fields: FormulaFields, framework: Framework): FormulaFields {
  const result: FormulaFields = {};
  for (const part of partsFor(framework)) {
    const text = fields[part.key]?.trim();
    if (text) result[part.key] = text;
  }
  return result;
}

export function compilePrompt(fields: FormulaFields, framework: Framework): string {
  const clean = cleanFields(fields, framework);
  if (framework === 'FREE') return clean.b || '';
  return partsFor(framework)
    .filter(part => clean[part.key])
    .map(part => `[${part.heading}]\n${clean[part.key]}`)
    .join('\n\n');
}

export type DiffPart = { text: string; type: 'same' | 'added' | 'removed' };

// Word-level diff (LCS) so participants can see exactly what changed between versions.
export function diffWords(before: string, after: string): DiffPart[] {
  const a = before.split(/(\s+)/).filter(Boolean);
  const b = after.split(/(\s+)/).filter(Boolean);
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const parts: DiffPart[] = [];
  const push = (text: string, type: DiffPart['type']) => {
    const last = parts[parts.length - 1];
    if (last && last.type === type) last.text += text;
    else parts.push({ text, type });
  };
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { push(a[i], 'same'); i++; j++; }
    else if (table[i + 1][j] >= table[i][j + 1]) { push(a[i], 'removed'); i++; }
    else { push(b[j], 'added'); j++; }
  }
  while (i < a.length) push(a[i++], 'removed');
  while (j < b.length) push(b[j++], 'added');
  return parts;
}

// Groups entries into journeys: one per author per material, versions in ascending order.
export function groupJourneys(entries: JournalEntry[]) {
  const map = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const id = `${entry.authorId}|${entry.materialKey}`;
    map.set(id, [...(map.get(id) || []), entry]);
  }
  return [...map.values()].map(versions => versions.sort((x, y) => x.version - y.version));
}
