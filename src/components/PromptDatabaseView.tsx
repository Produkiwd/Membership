/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Copy, Check, X, ChevronLeft, ChevronRight, Loader2, 
  Sparkles, BookOpen, Library, ArrowRight, Layers, 
  Target, Shield, TrendingUp, Share2, 
  Star, Plus, RefreshCw, Eye, Tag, Award, BookmarkCheck, 
  FileEdit, Menu, Home, CheckCircle2, SlidersHorizontal, Dumbbell,
  Lightbulb, Brain, Compass
} from 'lucide-react';
export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
}

// ==========================================
// 1. DATA TYPES & INTERFACES
// ==========================================
export interface PromptVersion {
  version: number;
  date: string;
  frameworkUsed: string;
  promptText: string;
  notes?: string;
  facilitatorFeedback?: string;
  facilitatorScore?: number;
}

export interface JournalPrompt {
  id: string;
  title: string;
  description: string;
  departmentTag: string; // 'Finance' | 'HR' | 'Strategy' | 'Operations' | 'Marketing' | 'Tech'
  currentVersion: number;
  versions: PromptVersion[];
  isPublic: boolean;
  authorName: string;
  score: number; // 1 to 10 scale
  createdAt: string;
  updatedAt: string;
}

// Initial Curated Data (Clean & Realistic)
const INITIAL_JOURNAL_PROMPTS: JournalPrompt[] = [
  {
    id: 'jp-1',
    title: 'Negosiasi Kontrak Vendor Cloud & IT',
    description: 'Strategi efisiensi biaya tahunan 15% tanpa menurunkan SLA uptime 99.9%.',
    departmentTag: 'Finance',
    currentVersion: 2,
    score: 9.5,
    isPublic: true,
    authorName: 'Juli (Fasilitator)',
    createdAt: '2026-09-10',
    updatedAt: '2026-09-14',
    versions: [
      {
        version: 1,
        date: 'Day 1 (Before)',
        frameworkUsed: 'Draft Awal (Ad-hoc)',
        promptText: 'Tolong buatkan email negosiasi perpanjangan kontrak vendor IT. Minta diskon harga 15% karena anggaran tahun ini dipotong dewan direksi. Nada sopan dan profesional.',
        notes: 'Hasil generik, terkesan meminta-minta tanpa posisi tawar (trade-off) yang jelas.',
      },
      {
        version: 2,
        date: 'Day 4 (After)',
        frameworkUsed: 'A.C.T.I.O.N.S. & Minto SCQA',
        promptText: `[A - Actor & Audience]
Bertindaklah sebagai Senior Procurement & Strategic Sourcing Manager. Audiens adalah Commercial Director Vendor Cloud.

[C - Context & Conditions]
Kemitraan berjalan 2 tahun dengan SLA memuaskan. Ada arahan rasionalisasi budget 15% dari direksi. Kontrak berakhir dalam 45 hari.

[T - Target & Task]
Susun email negosiasi kontrak 2 tahun ke depan dengan penyesuaian tarif 15% atau volume diskon tambahan tanpa menurunkan SLA 99.9%.

[I - Intention & Impact]
Kemitraan win-win jangka panjang tanpa kesan krisis likuiditas, melainkan disiplin efisiensi bersama.

[O - Output & Organization]
Format Minto Pyramid (SCQA). Maksimal 4 paragraf lugas. Berikan 3 opsi skema fleksibilitas penutup.

[N - Negatives & Non-negotiables]
DILARANG mengancam pemutusan kontrak sepihak. Jangan mengutip data biaya rahasia kompetitor lain.

[S - Steps & Sequencing]
1. Apresiasi SLA 2 tahun terakhir.
2. Paparkan konteks pembaruan strategi korporat.
3. Tawarkan perpanjangan multi-year sebagai kompensasi harga.
4. Undang sesi diskusi 20 menit minggu ini.`,
        notes: 'Ditambahkan skema trade-off multi-year, struktur SCQA, dan batasan nada non-konfrontatif.',
        facilitatorScore: 9.5,
        facilitatorFeedback: 'Evolusi luar biasa. Penggunaan trade-off multi-year memberikan leverage nyata bagi kedua belah pihak.'
      }
    ]
  },
  {
    id: 'jp-2',
    title: 'Memo Internal: Restrukturisasi Tim Berbasis AI',
    description: 'Komunikasi perubahan sensitif untuk menjaga rasa aman psikologis dan kestabilan kerja.',
    departmentTag: 'HR',
    currentVersion: 2,
    score: 9.6,
    isPublic: true,
    authorName: 'Mariyah (HR Lead)',
    createdAt: '2026-09-12',
    updatedAt: '2026-09-15',
    versions: [
      {
        version: 1,
        date: 'Day 1 (Before)',
        frameworkUsed: 'Draft Awal',
        promptText: 'Buatkan memo resmi dari HRD untuk semua karyawan tentang restrukturisasi divisi teknologi dan pemindahan beberapa posisi.',
        notes: 'Kaku dan berpotensi memicu rumor liar di kalangan staf.',
      },
      {
        version: 2,
        date: 'Day 3 (After)',
        frameworkUsed: 'A.C.T.I.O.N.S. & Crucial Conversations',
        promptText: `[A - Actor & Audience]
Bertindaklah sebagai Chief People Officer bersama CEO. Audiens adalah seluruh staf dan manajer lintas divisi.

[C - Context & Conditions]
Transformasi ke model cross-functional squad berbasis AI. Sebagian peran bergeser fungsi tanpa adanya PHK.

[T - Target & Task]
Susun memo internal yang mengumumkan restrukturisasi tim ini secara transparan, empatik, dan menenangkan.

[I - Intention & Impact]
Meredam kecemasan (psychological safety) dan menegaskan adanya jalur reskilling yang didampingi penuh manajemen.

[O - Output & Organization]
1. Mengapa kita berubah sekarang.
2. Apa yang berubah vs apa yang TETAP UTUH (stabilitas).
3. Jadwal sesi townhall terbuka per divisi.

[N - Negatives & Non-negotiables]
HINDARI jargon dingin ('downsizing', 'optimalisasi aset manusia'). Dilarang membuat janji palsu.

[S - Steps & Sequencing]
Buka dengan apresiasi dedikasi, jelaskan visi pertumbuhan, lalu berikan transparansi roadmap langkah berikutnya.`,
        notes: 'Fokus pada Psychological Safety, kepastian tidak ada PHK, dan jadwal sesi dialog terbuka.',
        facilitatorScore: 9.6,
        facilitatorFeedback: 'Nuansa empati pemimpin sangat terasa. Menghilangkan kecemasan tanpa kehilangan ketegasan arah.'
      }
    ]
  },
  {
    id: 'jp-3',
    title: 'Sintesis Dokumen Riset Pasar 80 Halaman',
    description: 'Mengekstrak intisari laporan panjang menjadi matriks keputusan 3 skenario untuk direksi.',
    departmentTag: 'Strategy',
    currentVersion: 2,
    score: 9.3,
    isPublic: true,
    authorName: 'Farha (Strategic Planner)',
    createdAt: '2026-09-13',
    updatedAt: '2026-09-16',
    versions: [
      {
        version: 1,
        date: 'Day 2 (Before)',
        frameworkUsed: 'Ringkasan Pasif',
        promptText: 'Ringkas dokumen riset pasar ini dan berikan poin-poin penting apa yang harus dilakukan perusahaan.',
        notes: 'Terlalu umum, tidak siap dijadikan bahan pengambilan keputusan dewan direksi.',
      },
      {
        version: 2,
        date: 'Day 5 (After)',
        frameworkUsed: 'Syntopical Reading & Devil\'s Advocate',
        promptText: `Bertindaklah sebagai Senior Strategic Advisor Dewan Direksi.
Lakukan dekonstruksi analitis terhadap laporan terlampir dengan metodologi Syntopical Reading & First-Principles:

1. CORE THESIS: Premis utama dokumen dan bukti empiris yang paling rentan dibantah.
2. AUDIT RISIKO: Gunakan sudut pandang Devil's Advocate (apa blind-spot terbesar jika rekomendasi ini kita ambil?).
3. MATRIKS KEPUTUSAN: Tabel 3 kolom (Skenario Tindakan, Dampak EBITDA & Modal, Mitigasi Risiko Kunci).
4. VERDICT: 1 paragraf rekomendasi final yang lugas untuk diputuskan pada rapat BOD.`,
        notes: 'Mengubah ringkasan pasif menjadi matriks keputusan 3 skenario siap saji.',
        facilitatorScore: 9.3,
        facilitatorFeedback: 'Sudut pandang Devil\'s Advocate pada poin 2 memaksa AI menguji risiko yang sering diabaikan.'
      }
    ]
  }
];

const DEPARTMENT_TAGS = ['Semua', 'Finance', 'HR', 'Strategy', 'Operations', 'Marketing', 'Tech'];

// 5 Reading & Learning Modes
const readingModesData = [
  {
    num: "01",
    tag: "1 → 10",
    title: "Get the Gist Instantly",
    subtitle: "High-Level Executive Summary",
    theory: "Cognitive Load Theory (John Sweller)",
    desc: "Minta AI merangkum materi kompleks dalam 3 lapis pemahaman: untuk anak 10 tahun, praktisi, dan CEO.",
    prompt: "Jelaskan tesis utama dokumen ini dalam 3 lapis: (1) Konsep sederhana, (2) Implikasi bisnis strategis, (3) Satu titik kerentanan kritis terbesar."
  },
  {
    num: "02",
    tag: "10 → 1",
    title: "Create Structured Outlines",
    subtitle: "Deconstruct & Decision Matrix",
    theory: "Schema Theory (Jean Piaget)",
    desc: "Ubah materi panjang menjadi matriks tabel keputusan: Masalah, Akar Penyebab, Intervensi, dan Titik Gagal.",
    prompt: "Dekonstruksi dokumen strategi ini menjadi matriks keputusan: Masalah Utama, Akar Penyebab, Intervensi Solutif, Estimasi Dampak, dan Titik Risiko Kegagalan."
  },
  {
    num: "03",
    tag: "10 ↔ 10",
    title: "Syntopical Reading & Debate",
    subtitle: "Cross-Pollinate Perspectives",
    theory: "Dialectical Inquiry (Mortimer Adler)",
    desc: "Adu argumentasi antara dokumen A dan dokumen B melalui simulasi debat kritis AI.",
    prompt: "Ambil sudut pandang Dokumen A dan lakukan kritik tajam terhadap temuan Dokumen B. Di mana titik ketidaksesuaian logikanya?"
  },
  {
    num: "04",
    tag: "1 → 1",
    title: "Deep Mastery & Socratic Loop",
    subtitle: "Mental Model Stress-Testing",
    theory: "Feynman Technique & Socratic Inquiry",
    desc: "Uji apakah Anda benar-benar paham suatu konsep melalui sesi tanya jawab sokratik yang menantang asumsi Anda.",
    prompt: "Bertindaklah sebagai Socrates. Tanyakan 3 pertanyaan paling sulit mengenai proposal bisnis saya ini hingga ke akar logikanya."
  },
  {
    num: "05",
    tag: "10 → 10+",
    title: "Accelerate Your Research",
    subtitle: "Discover Research Gaps",
    theory: "Dual Coding Theory (Allan Paivio)",
    desc: "Temukan pola tersembunyi dan celah riset di antara tumpukan dokumen referensi multi-sumber.",
    prompt: "Berdasarkan seluruh dokumen terlampir, sebutkan di mana titik konsensus para ahli, apa yang masih diperdebatkan, dan apa research gap yang belum terjawab?"
  }
];

// Prompting Techniques Data
const promptingTechniquesData = [
  {
    id: "zero-shot",
    title: "Zero-Shot & Few-Shot Prompting",
    tag: "Foundational",
    desc: "Mengunci gaya keluaran dan format AI dengan memberikan contoh konkret (2-3 contoh) daripada instruksi abstrak.",
    steps: ["Definisikan format target", "Berikan 2 contoh input -> output yang ideal", "Minta AI melanjutkan pola yang sama"],
    example: "Contoh 1:\nInput: 'Vendor minta naik harga 10%'\nOutput: [Apresiasi] + [Tanya Justifikasi Data] + [Tawarkan Kontrak 2 Tahun]\n\nSekarang proses kasus berikut dengan pola yang sama: [Input Anda]"
  },
  {
    id: "cot",
    title: "Chain-of-Thought (CoT) Reasoning",
    tag: "Logic & Problem Solving",
    desc: "Memaksa AI melakukan penalaran langkah demi langkah sebelum memberikan kesimpulan akhir untuk memangkas halusinasi.",
    steps: ["Identifikasi kompleksitas masalah", "Gunakan perintah eksplisit: 'Pikirkan tahap demi tahap'", "Verifikasi kesimpulan bertahap"],
    example: "Sebelum memberikan jawaban akhir, uraikan langkah berpikir Anda dalam format:\nLangkah 1: Identifikasi fakta utama\nLangkah 2: Hitung dampak finansial\nLangkah 3: Rumuskan 2 alternatif mitigasi\nKesimpulan Akhir:"
  },
  {
    id: "jeff-su",
    title: "Jeff Su's Precision Framework",
    tag: "High Precision",
    desc: "Gunakan XML Sandwich (<context>, <task>, <rules>) dan Universal Perfection Loop untuk kontrol ambiguitas maksimal.",
    steps: ["Bungkus konteks dalam tag XML", "Tentukan tone dan panjang teks eksplisit", "Instruksikan AI menilai mandiri skor 10/10"],
    example: "<context>\nAnda adalah Senior Risk Consultant untuk industri logistik.\n</context>\n\n<task>\nAudit dokumen SOP pergudangan terlampir.\n</task>\n\n<rules>\nGunakan nada asertif dan profesional. Buat tabel 3 kolom untuk temuan risiko.\n</rules>"
  },
  {
    id: "brutal",
    title: "The Brutal Method (Red Teaming)",
    tag: "Executive Audit",
    desc: "Bypass kecenderungan AI bersikap sopan (politeness bias). Paksa AI menjadi pengkritik paling tajam terhadap proposal Anda.",
    steps: ["Pilih persona Devil's Advocate", "Gunakan framing pihak ketiga", "Perintahkan mencari titik gagal terburuk"],
    example: "Abaikan rasa sopan santun. Bertindaklah sebagai investor paling skeptis yang sedang menguji proposal ini. Sebutkan 3 alasan paling fatal mengapa proyek ini akan gagal total."
  }
];

// Interactive Exercises Data
const exercisesData = [
  {
    id: "ex-1",
    title: "Studi Kasus 1: Negosiasi Kontrak Vendor",
    department: "Finance",
    scenario: "Vendor perangkat lunak menaikkan biaya lisensi tahunan sebesar 12%. Dewan direksi meminta Anda menegosiasikan agar kenaikan maksimal 3% atau ditukar dengan SLA tambahan.",
    poorPrompt: "Tolong buatkan email ke vendor agar jangan naikkan harga 12%, kami minta 3% saja ya.",
    hints: ["Gunakan A.C.T.I.O.N.S.", "Masukkan trade-off durasi kontrak", "Terapkan format Minto SCQA"],
    benchmarkSolution: `[A - Actor] Senior Procurement Manager ke Account Director Vendor\n[C - Context] Kemitraan 3 tahun sukses, ada pembatasan budget korporat 3%\n[T - Task] Negosiasi batas kenaikan 3% dengan opsi perpanjangan komitmen 3 tahun (multi-year)\n[I - Impact] Kemitraan win-win tanpa memutus hubungan kerja sama\n[O - Output] Format Minto SCQA, maksimal 3 paragraf, 2 opsi solusi`
  },
  {
    id: "ex-2",
    title: "Studi Kasus 2: Memo Restrukturisasi Internal",
    department: "HR",
    scenario: "Divisi operasional akan digabungkan dengan tim digital. Anda harus mengumumkan perubahan peran tanpa memicu kecemasan PHK di kalangan karyawan.",
    poorPrompt: "Buatkan memo pengumuman restrukturisasi divisi untuk karyawan kantor.",
    hints: ["Terapkan prinsip Psychological Safety", "Jelaskan apa yang berubah vs apa yang TETAP STABIL", "Sediakan jadwal dialog terbuka"],
    benchmarkSolution: `[A - Actor] Chief People Officer & Direktur Operasional ke Seluruh Karyawan\n[C - Context] Transisi organisasi menuju squad lincah tanpa pemutusan hubungan kerja\n[T - Task] Pengumuman perubahan struktur tim dan jalur reskilling\n[I - Impact] Menjaga ketenangan emosional dan stabilitas kinerja tim\n[O - Output] Struktur empati kepemimpinan, FAQ terlampir, jadwal sesi townhall`
  },
  {
    id: "ex-3",
    title: "Studi Kasus 3: Sintesis Risiko Laporan Bisnis",
    department: "Strategy",
    scenario: "Anda menerima laporan 70 halaman tentang rencana ekspansi pasar baru. Direksi ingin mengetahui titik blind-spot yang sengaja dipercantik oleh tim penyusun.",
    poorPrompt: "Ringkas laporan ekspansi pasar ini dan apa kesimpulannya.",
    hints: ["Gunakan pendekatan Devil's Advocate", "Dekonstruksi premis paling rapuh", "Buat matriks keputusan 3 skenario"],
    benchmarkSolution: `Bertindaklah sebagai Senior Strategic Risk Auditor. Dekonstruksi laporan terlampir dengan First-Principles: (1) Uji 3 asumsi pertumbuhan paling rapuh, (2) Sebutkan skenario terburuk (Worst Case), (3) Buat Decision Matrix Opsi Konservatif vs Agresif.`
  }
];

export default function PromptDatabaseView({ onBack }: { onBack?: () => void }) {
  // Navigation State (WJG Style)
  // 'beranda' | 'my-journal' | 'prompt-studio' | 'community' | 'techniques' | 'reading-learning' | 'exercise' | 'vault'
  const [activeMenu, setActiveMenu] = useState<string>('beranda');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Journal Prompts (LocalStorage Persisted)
  const [journalPrompts, setJournalPrompts] = useState<JournalPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('aif_clean_journal_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse journal', e);
    }
    return INITIAL_JOURNAL_PROMPTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('aif_clean_journal_v2', JSON.stringify(journalPrompts));
    } catch (e) {
      console.error('Failed to save journal', e);
    }
  }, [journalPrompts]);

  // Filters & State
  const [selectedTag, setSelectedTag] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modals
  const [comparingPrompt, setComparingPrompt] = useState<JournalPrompt | null>(null);
  const [activeExercise, setActiveExercise] = useState<typeof exercisesData[0] | null>(null);
  const [showExerciseSolution, setShowExerciseSolution] = useState(false);

  // Builder Form State
  const [iteratingPromptId, setIteratingPromptId] = useState<string | null>(null);
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderTag, setBuilderTag] = useState('Finance');
  const [builderType, setBuilderType] = useState<'ACTIONS' | 'ACT'>('ACTIONS');
  const [builderNotes, setBuilderNotes] = useState('');
  const [actionData, setActionData] = useState({
    a: '', c: '', t: '', i: '', o: '', n: '', s: ''
  });

  // 1000+ Raw Prompts State
  const [rawPrompts, setRawPrompts] = useState<Prompt[]>([]);
  const [rawCategories, setRawCategories] = useState<string[]>(['All']);
  const [selectedRawCategory, setSelectedRawCategory] = useState<string>('All');
  const [rawSearchQuery, setRawSearchQuery] = useState<string>('');
  const [isLoadingRaw, setIsLoadingRaw] = useState(false);
  const [rawPage, setRawPage] = useState(1);
  const RAW_ITEMS_PER_PAGE = 12;

  useEffect(() => {
    if (activeMenu === 'vault' && rawPrompts.length === 0) {
      setIsLoadingRaw(true);
      fetch('https://script.google.com/macros/s/AKfycbxZlGXkUirzRvMjFYUs5zYE-AZwfsOYDysWD-rwIgOMcraQPUZYkl6351KFwAVHwUbXsQ/exec')
        .then(res => res.json())
        .then(data => {
          const mapped = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            category: item.new_category || item.category || 'Other'
          }));
          setRawPrompts(mapped);
          const catSet = new Set<string>();
          catSet.add('All');
          mapped.forEach((p: Prompt) => {
            if (p.category) catSet.add(p.category);
          });
          setRawCategories(Array.from(catSet));
        })
        .catch(err => console.error('Failed to load raw prompts:', err))
        .finally(() => setIsLoadingRaw(false));
    }
  }, [activeMenu, rawPrompts.length]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCompiledPrompt = () => {
    if (builderType === 'ACT') {
      const parts = [];
      if (actionData.a) parts.push(`[A - Actor & Audience]\n${actionData.a}`);
      if (actionData.c) parts.push(`[C - Context & Conditions]\n${actionData.c}`);
      if (actionData.t) parts.push(`[T - Target & Task]\n${actionData.t}`);
      if (parts.length === 0) {
        return `[A - Actor]\nBertindaklah sebagai Senior Specialist.\n\n[C - Context]\nKonteks situasi saat ini memerlukan solusi terukur.\n\n[T - Task]\nTugas Anda adalah menyusun rencana tindakan.`;
      }
      return parts.join('\n\n');
    }
    const parts = [];
    if (actionData.a) parts.push(`[A - Actor & Audience]\n${actionData.a}`);
    if (actionData.c) parts.push(`[C - Context & Conditions]\n${actionData.c}`);
    if (actionData.t) parts.push(`[T - Target & Task]\n${actionData.t}`);
    if (actionData.i) parts.push(`[I - Intention & Impact]\n${actionData.i}`);
    if (actionData.o) parts.push(`[O - Output & Organization]\n${actionData.o}`);
    if (actionData.n) parts.push(`[N - Negatives & Non-negotiables]\n${actionData.n}`);
    if (actionData.s) parts.push(`[S - Steps & Sequencing]\n${actionData.s}`);
    if (parts.length === 0) {
      return `[A - Actor & Audience]\nBertindaklah sebagai [Peran/Keahlian Anda]. Audiens: [Target Pemangku Kepentingan].\n\n[C - Context & Conditions]\nLatar belakang situasi bisnis: [Jelaskan fakta dan kondisi saat ini].\n\n[T - Target & Task]\nTugas spesifik Anda: [Jelaskan dokumen/output yang harus dibuat].\n\n[I - Intention & Impact]\nDampak yang ingin dicapai: [Tujuan perubahan perilaku/keputusan].\n\n[O - Output & Organization]\nFormat keluaran: [Gunakan Minto Pyramid / SCQA / Tabel 3 Kolom].\n\n[N - Negatives & Non-negotiables]\nDILARANG [Sebutkan pantangan nada, asumsi salah, atau kata terlarang].\n\n[S - Steps & Sequencing]\nIkuti urutan pemikiran ini:\n1. [Langkah 1]\n2. [Langkah 2]\n3. [Langkah 3]`;
    }
    return parts.join('\n\n');
  };

  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const compiled = getCompiledPrompt();
    const today = new Date().toISOString().split('T')[0];

    if (iteratingPromptId) {
      setJournalPrompts(prev => prev.map(item => {
        if (item.id === iteratingPromptId) {
          const nextV = item.currentVersion + 1;
          const newVersion: PromptVersion = {
            version: nextV,
            date: `${today} (v${nextV})`,
            frameworkUsed: builderType === 'ACTIONS' ? 'A.C.T.I.O.N.S.' : 'ACT',
            promptText: compiled,
            notes: builderNotes || `Iterasi ke versi ${nextV} dengan penajaman parameter kerja.`,
            facilitatorScore: Math.min(9.8, item.score + 0.1)
          };
          return {
            ...item,
            title: builderTitle || item.title,
            departmentTag: builderTag || item.departmentTag,
            currentVersion: nextV,
            score: Math.min(9.8, item.score + 0.1),
            updatedAt: today,
            versions: [...item.versions, newVersion]
          };
        }
        return item;
      }));
    } else {
      const newPrompt: JournalPrompt = {
        id: `jp-${Date.now()}`,
        title: builderTitle || 'Prompt Kerja Baru',
        description: builderNotes || 'Prompt terstruktur hasil formula A.C.T.I.O.N.S.',
        departmentTag: builderTag,
        currentVersion: 1,
        score: 9.0,
        isPublic: true,
        authorName: 'Saya (Personal)',
        createdAt: today,
        updatedAt: today,
        versions: [
          {
            version: 1,
            date: `${today} (v1)`,
            frameworkUsed: builderType === 'ACTIONS' ? 'A.C.T.I.O.N.S.' : 'ACT',
            promptText: compiled,
            notes: builderNotes || 'Draft awal (Versi 1).'
          }
        ]
      };
      setJournalPrompts(prev => [newPrompt, ...prev]);
    }

    setIteratingPromptId(null);
    setBuilderTitle('');
    setBuilderNotes('');
    setActionData({ a: '', c: '', t: '', i: '', o: '', n: '', s: '' });
    setActiveMenu('my-journal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIteration = (prompt: JournalPrompt) => {
    setIteratingPromptId(prompt.id);
    setBuilderTitle(prompt.title);
    setBuilderTag(prompt.departmentTag);
    setBuilderType('ACTIONS');
    setBuilderNotes(`Catatan Perbaikan v${prompt.currentVersion + 1}: `);
    
    const latest = prompt.versions[prompt.versions.length - 1];
    setActionData({
      a: `[Lanjutkan peran dari v${prompt.currentVersion}]`,
      c: '',
      t: latest.promptText.slice(0, 150) + '...',
      i: '',
      o: 'Format Minto Pyramid / Eksekutif',
      n: 'Hindari asumsi tanpa data pendukung',
      s: '1. Analisis masalah inti\n2. Rekomendasi solusi\n3. Mitigasi risiko'
    });

    setActiveMenu('prompt-studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const adoptToMyJournal = (item: JournalPrompt) => {
    const latest = item.versions[item.versions.length - 1];
    const adopted: JournalPrompt = {
      ...item,
      id: `jp-adp-${Date.now()}`,
      title: `${item.title} (Adaptasi Saya)`,
      authorName: `Saya (Adaptasi dari ${item.authorName})`,
      currentVersion: 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      versions: [
        {
          version: 1,
          date: 'Day 1 (Adopsi)',
          frameworkUsed: latest.frameworkUsed,
          promptText: latest.promptText,
          notes: `Diadaptasi dari karya ${item.authorName}. Siap diiterasi.`
        }
      ]
    };
    setJournalPrompts(prev => [adopted, ...prev]);
    setActiveMenu('my-journal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered lists
  const filteredJournal = journalPrompts.filter(item => {
    const matchTag = selectedTag === 'Semua' || item.departmentTag === selectedTag;
    const matchQ = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchQ;
  });

  const filteredRaw = rawPrompts.filter(p => {
    const matchCat = selectedRawCategory === 'All' || p.category === selectedRawCategory;
    const matchQ = (p.title || '').toLowerCase().includes(rawSearchQuery.toLowerCase()) ||
                   (p.content || '').toLowerCase().includes(rawSearchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const totalRawPages = Math.ceil(filteredRaw.length / RAW_ITEMS_PER_PAGE);
  const displayedRaw = filteredRaw.slice(
    (rawPage - 1) * RAW_ITEMS_PER_PAGE,
    rawPage * RAW_ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-slate-900 flex font-sans antialiased selection:bg-[#E5C158] selection:text-slate-950">
      
      {/* ========================================================================= */}
      {/* 1. SIDEBAR NAVIGATION (WJG PATTERN & OFFICIAL LOGOS) */}
      {/* ========================================================================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#141210] border-r border-[#24201C] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>        {/* Brand Header with Official Cobrand Logos in Crisp Card */}
        <div className="p-3.5 border-b border-[#24201C] flex items-center justify-between">
          <div className="bg-white rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-sm border border-slate-200/50 w-full max-w-[210px]">
            <img 
              src="/assets/logo-tjitra.png" 
              alt="Tjitra & Associates" 
              className="h-6 w-auto object-contain max-w-[95px]"
            />
            <div className="h-4 w-px bg-slate-300 shrink-0" />
            <img 
              src="/assets/logo-iwdemy-cobrand.png" 
              alt="IWDemy" 
              className="h-6 w-auto object-contain max-w-[95px]"
            />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-2 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Back to Hub Link (if inside Membership) */}
        {onBack && (
          <div className="px-3 pt-3">
            <button 
              onClick={onBack}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#E5C158] transition-colors"
            >
              <ChevronLeft size={14} /> Kembali ke Hub Member
            </button>
          </div>
        )}

        {/* Main Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-[2px] text-slate-400 uppercase">
            Menu Utama
          </div>

          <button
            onClick={() => { setActiveMenu('beranda'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'beranda'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home size={15} />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => { setActiveMenu('my-journal'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'my-journal'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookmarkCheck size={15} />
              <span>My Prompt Journal</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeMenu === 'my-journal' ? 'bg-black/20 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
              {journalPrompts.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveMenu('prompt-studio'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'prompt-studio'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileEdit size={15} />
            <span>Prompt Formula Studio</span>
          </button>

          <button
            onClick={() => { setActiveMenu('community'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'community'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Share2 size={15} />
            <span>Prompt Community</span>
          </button>

          <button
            onClick={() => { setActiveMenu('techniques'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'techniques'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={15} />
            <span>Prompting Techniques</span>
          </button>

          <button
            onClick={() => { setActiveMenu('reading-learning'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'reading-learning'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={15} />
            <span>Reading & Smart Learning</span>
          </button>

          <button
            onClick={() => { setActiveMenu('exercise'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'exercise'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Dumbbell size={15} />
            <span>Exercise & Practice Lab</span>
          </button>

          <div className="pt-3 border-t border-[#24201C]/60 my-2">
            <button
              onClick={() => { setActiveMenu('vault'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'vault'
                  ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Library size={15} />
              <span>Basic Prompt Library (1.000+)</span>
            </button>
          </div>
        </nav>

        {/* User Card (Bottom of Sidebar) */}
        <div className="p-3.5 border-t border-[#24201C] bg-[#110F0D]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E5C158]/10 border border-[#E5C158]/30 flex items-center justify-center text-[10px] font-mono font-bold text-[#E5C158]">
              PW
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">Personal Workspace</span>
              <span className="text-[10px] text-slate-400 truncate">Prompt Journal Active</span>
            </div>
          </div>
        </div>

      </aside>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT (RIGHT OF SIDEBAR) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 uppercase">PROMPT DATABASE</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-800 uppercase">
                {activeMenu === 'beranda' ? 'Beranda' : 
                 activeMenu === 'my-journal' ? 'My Prompt Journal' : 
                 activeMenu === 'prompt-studio' ? 'Prompt Formula Studio' : 
                 activeMenu === 'community' ? 'Prompt Community' : 
                 activeMenu === 'techniques' ? 'Prompting Techniques' : 
                 activeMenu === 'reading-learning' ? 'Reading & Smart Learning' : 
                 activeMenu === 'exercise' ? 'Exercise & Practice Lab' : 'Basic Prompt Library (1.000+)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIteratingPromptId(null);
                setBuilderTitle('');
                setBuilderNotes('');
                setActiveMenu('prompt-studio');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={13} /> Buat Formula Baru
            </button>
          </div>
        </header>

        {/* Body View Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
          
          {/* ===================================================================== */}
          {/* VIEW: BERANDA (6 MODULAR BOXES - CLEAN WJG STYLE) */}
          {/* ===================================================================== */}
          {activeMenu === 'beranda' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Clean Welcome Hero */}
              <section className="bg-gradient-to-br from-[#141210] to-[#24201C] rounded-3xl text-white p-7 sm:p-10 shadow-sm border border-[#2E2823]">
                <div className="max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-2">
                    Selamat datang di <span className="text-[#E5C158]">Prompt Database.</span>
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                    Buka jurnal saya atau buat formula baru. Ruang terintegrasi untuk menyusun instruksi AI terstruktur, melacak evolusi Sebelum &amp; Sesudah (Before &amp; After), serta mengeksplorasi teknik dan studi kasus interaktif.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveMenu('my-journal')}
                      className="px-4 py-2.5 rounded-xl bg-[#E5C158] hover:bg-[#F0CF6B] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    >
                      Buka Jurnal Saya <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setIteratingPromptId(null);
                        setBuilderTitle('');
                        setActiveMenu('prompt-studio');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/10"
                    >
                      Buat Formula Baru
                    </button>
                  </div>
                </div>
              </section>

              {/* 6 Modular Boxes (Grid 3x2) */}
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Pilihan Modul
                    </span>
                    <h2 className="text-base font-bold text-slate-900">Pilih Kebutuhan Pembelajaran</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Box 1: My Prompt Journal */}
                  <div 
                    onClick={() => setActiveMenu('my-journal')}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E5C158] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#C9A23E] flex items-center justify-center font-black font-mono text-xs">
                          01
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {journalPrompts.length} Tersimpan
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#9A7920] transition-colors mb-1">
                        My Prompt Journal
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Repositori personal Anda untuk melacak riwayat evolusi Before &amp; After, catatan revisi, dan kematangan prompt dari waktu ke waktu.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-[#C9A23E] flex items-center gap-1 mt-auto">
                      Buka Jurnal Saya <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Box 2: Prompt Formula Studio */}
                  <div 
                    onClick={() => setActiveMenu('prompt-studio')}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E5C158] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-black font-mono text-xs">
                          02
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Formula Studio
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                        Prompt Formula Studio
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Susun instruksi berbobot tinggi dengan panduan 7 parameter A.C.T.I.O.N.S. atau 3 parameter ACT cepat.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-auto">
                      Buat Formula Baru <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Box 3: Prompt Community */}
                  <div 
                    onClick={() => setActiveMenu('community')}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E5C158] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-black font-mono text-xs">
                          03
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          Community Feedback
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                        Prompt Community
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Jelajahi dan adaptasi formula teruji dari rekan komunitas lintas divisi lengkap dengan feedback dan skor kurasi fasilitator.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-blue-700 flex items-center gap-1 mt-auto">
                      Jelajahi Komunitas <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Box 4: Prompting Techniques */}
                  <div 
                    onClick={() => setActiveMenu('techniques')}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E5C158] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-black font-mono text-xs">
                          04
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Materi &amp; Teknik
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors mb-1">
                        Prompting Techniques
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Pola instruksi presisi: Zero-Shot, Few-Shot, Chain-of-Thought (CoT), The Brutal Method, hingga Jeff Su XML Sandwich.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-indigo-700 flex items-center gap-1 mt-auto">
                      Pelajari Teknik <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Box 5: Reading & Smart Learning */}
                  <div 
                    onClick={() => setActiveMenu('reading-learning')}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E5C158] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-black font-mono text-xs">
                          05
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          Smart Learning
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors mb-1">
                        Reading &amp; Smart Learning
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        5 Mode Baca berbasis teori kognitif (Syntopical Reading, Dual Coding, Schema Theory) untuk sintesis laporan dan pembelajaran cepat.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-purple-700 flex items-center gap-1 mt-auto">
                      Buka Materi Baca <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Box 6: Exercise & Practice Lab */}
                  <div 
                    onClick={() => setActiveMenu('exercise')}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E5C158] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-black font-mono text-xs">
                          06
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                          Exercise Lab
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors mb-1">
                        Exercise &amp; Practice Lab
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Latihan mandiri &amp; studi kasus interaktif untuk menguji ketajaman prompt Anda dengan benchmark solution dari fasilitator.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-rose-700 flex items-center gap-1 mt-auto">
                      Mulai Latihan <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </section>

              {/* Bottom Card for 1,000+ Basic Prompt Vault */}
              <div 
                onClick={() => setActiveMenu('vault')}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-[#E5C158] transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Library size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#9A7920] transition-colors">
                      Basic Prompt Library (1.000+ Vault)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Koleksi 1.000+ prompt dasar dan referensi teknis lintas profesi siap pakai untuk berbagai kebutuhan operasional.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
                  Buka Basic Library <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: MY PROMPT JOURNAL (CLEAN CARDS, SIMPLE STAR RATING) */}
          {/* ===================================================================== */}
          {activeMenu === 'my-journal' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Filter Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
                    <Tag size={11} /> Divisi:
                  </span>
                  {DEPARTMENT_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedTag === tag
                          ? 'bg-[#141210] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-60">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari prompt saya..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                  />
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJournal.map(item => {
                  const latest = item.versions[item.versions.length - 1];
                  const hasBeforeAfter = item.versions.length > 1;

                  return (
                    <div 
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-[#E5C158] transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Meta Header with Simple Star (⭐ 9.5) */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                              #{item.departmentTag}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700">
                              v{item.currentVersion}
                            </span>
                          </div>

                          {/* Minimalist Star Rating */}
                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                            <Star size={11} className="text-amber-600 fill-amber-500" />
                            <span>{item.score.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Clean Short Excerpt */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 text-xs font-mono text-slate-700 line-clamp-3">
                          {latest.promptText}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {hasBeforeAfter && (
                            <button
                              onClick={() => setComparingPrompt(item)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors"
                            >
                              <TrendingUp size={11} className="text-amber-700" />
                              Before vs After
                            </button>
                          )}
                          <button
                            onClick={() => startIteration(item)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <RefreshCw size={10} className="text-slate-600" />
                            v{item.currentVersion + 1}
                          </button>
                        </div>

                        <button
                          onClick={() => handleCopy(latest.promptText, item.id)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                            copiedId === item.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#141210] hover:bg-slate-800 text-white'
                          }`}
                        >
                          {copiedId === item.id ? <Check size={11} /> : <Copy size={11} />}
                          {copiedId === item.id ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: PROMPT STUDIO (FORMULA BUILDER) */}
          {/* ===================================================================== */}
          {activeMenu === 'prompt-studio' && (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 animate-in fade-in duration-300">
              
              {iteratingPromptId ? (
                <div className="bg-amber-50 border-l-4 border-[#C9A23E] p-3 rounded-r-xl mb-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-800">Mode Iterasi</span>
                    <h3 className="text-xs font-bold text-slate-900">Meningkatkan: "{builderTitle}"</h3>
                  </div>
                  <button
                    onClick={() => { setIteratingPromptId(null); setBuilderTitle(''); }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Batal (Buat Baru)
                  </button>
                </div>
              ) : (
                <div className="mb-5 pb-3 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Prompt Studio</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Susun parameter bisnis Anda secara terstruktur menggunakan panduan konsultan.
                  </p>
                </div>
              )}

              <form onSubmit={handleSavePrompt} className="space-y-3.5">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Judul Prompt *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Evaluasi Kinerja Vendor IT"
                      value={builderTitle}
                      onChange={(e) => setBuilderTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Divisi</label>
                    <select
                      value={builderTag}
                      onChange={(e) => setBuilderTag(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                    >
                      {DEPARTMENT_TAGS.filter(t => t !== 'Semua').map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setBuilderType('ACTIONS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      builderType === 'ACTIONS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    A.C.T.I.O.N.S. (Strategis)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderType('ACT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      builderType === 'ACT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    ACT (Cepat)
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1"><span className="text-[#C9A23E]">A -</span> Actor & Audience (Peran & Sasaran)</label>
                    <textarea
                      rows={2}
                      placeholder="Bertindaklah sebagai Senior Procurement Manager. Audiens adalah Direktur Vendor..."
                      value={actionData.a}
                      onChange={(e) => setActionData({ ...actionData, a: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1"><span className="text-[#C9A23E]">C -</span> Context & Conditions (Situasi Bisnis)</label>
                    <textarea
                      rows={2}
                      placeholder="Kemitraan berjalan 2 tahun. Ada pemotongan budget 15% dari direksi..."
                      value={actionData.c}
                      onChange={(e) => setActionData({ ...actionData, c: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1"><span className="text-[#C9A23E]">T -</span> Target & Task (Tugas yang Dihasilkan)</label>
                    <textarea
                      rows={2}
                      placeholder="Susun email negosiasi perpanjangan kontrak dengan opsi trade-off..."
                      value={actionData.t}
                      onChange={(e) => setActionData({ ...actionData, t: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                    />
                  </div>

                  {builderType === 'ACTIONS' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1"><span className="text-[#C9A23E]">I -</span> Intention & Impact (Dampak Psikologis / Bisnis)</label>
                        <textarea
                          rows={2}
                          placeholder="Membangun kemitraan jangka panjang win-win..."
                          value={actionData.i}
                          onChange={(e) => setActionData({ ...actionData, i: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1"><span className="text-[#C9A23E]">O -</span> Output & Organization (Format Minto / Struktur)</label>
                        <textarea
                          rows={2}
                          placeholder="Format Minto Pyramid (SCQA). Maksimal 4 paragraf lugas..."
                          value={actionData.o}
                          onChange={(e) => setActionData({ ...actionData, o: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1"><span className="text-[#C9A23E]">N -</span> Negatives (Pantangan & Batasan Halusinasi)</label>
                        <textarea
                          rows={2}
                          placeholder="DILARANG mengancam pemutusan kontrak sepihak..."
                          value={actionData.n}
                          onChange={(e) => setActionData({ ...actionData, n: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1"><span className="text-[#C9A23E]">S -</span> Steps (Urutan Logika AI)</label>
                        <textarea
                          rows={2}
                          placeholder="1. Beri apresiasi SLA, 2. Paparkan konteks, 3. Tawarkan opsi multi-year..."
                          value={actionData.s}
                          onChange={(e) => setActionData({ ...actionData, s: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const compiled = getCompiledPrompt();
                      handleCopy(compiled, 'preview-builder');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5"
                  >
                    {copiedId === 'preview-builder' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    Salin Formula
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold shadow-sm"
                  >
                    {iteratingPromptId ? 'Simpan Versi Baru' : 'Simpan ke Jurnal'}
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: PROMPT COMMUNITY */}
          {/* ===================================================================== */}
          {activeMenu === 'community' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Prompt Community</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jelajahi dan adaptasi formula teruji dari rekan kerja ke dalam jurnal pribadi Anda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journalPrompts.filter(p => p.isPublic).map(item => {
                  const latest = item.versions[item.versions.length - 1];
                  return (
                    <div 
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-[#E5C158] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                              #{item.departmentTag}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              oleh: <strong className="text-slate-800">{item.authorName}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                            <Star size={11} className="text-amber-600 fill-amber-500" />
                            <span>{item.score.toFixed(1)}</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 text-xs font-mono text-slate-700 line-clamp-3">
                          {latest.promptText}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => adoptToMyJournal(item)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <BookmarkCheck size={12} className="text-amber-700" />
                          Adaptasi ke Jurnal
                        </button>

                        <button
                          onClick={() => handleCopy(latest.promptText, `comm-${item.id}`)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                            copiedId === `comm-${item.id}`
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#141210] hover:bg-slate-800 text-white'
                          }`}
                        >
                          {copiedId === `comm-${item.id}` ? <Check size={11} /> : <Copy size={11} />}
                          {copiedId === `comm-${item.id}` ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: PROMPTING TECHNIQUES */}
          {/* ===================================================================== */}
          {activeMenu === 'techniques' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C9A23E] tracking-wider">
                  Framework & Pola Instruksi
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Prompting Techniques</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kuasai pola instruksi dari zero-shot hingga teknik presisi Jeff Su dan The Brutal Method.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promptingTechniquesData.map(tech => (
                  <div key={tech.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {tech.tag}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mb-1">{tech.title}</h3>
                      <p className="text-xs text-slate-600 mb-3">{tech.desc}</p>
                      
                      <div className="space-y-1 mb-3">
                        {tech.steps.map((s, i) => (
                          <div key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-100 flex items-center justify-center font-mono text-[9px] font-bold text-slate-700">{i + 1}</span>
                            {s}
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-700 mb-3 whitespace-pre-line leading-relaxed">
                        {tech.example}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(tech.example, tech.id)}
                      className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      {copiedId === tech.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      Salin Formula Template
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: READING & LEARNING */}
          {/* ===================================================================== */}
          {activeMenu === 'reading-learning' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C9A23E] tracking-wider">
                  Materi Day 1 & Day 2
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Reading & Learning Tactics</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  5 Mode Pembelajaran Kognitif untuk mendekonstruksi dokumen tebal menjadi model mental terapan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {readingModesData.map(mode => (
                  <div key={mode.num} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-black font-mono text-[#C9A23E]">{mode.num}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {mode.tag}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5">{mode.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400 block mb-2">{mode.theory}</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{mode.desc}</p>
                    </div>

                    <button
                      onClick={() => handleCopy(mode.prompt, `mode-${mode.num}`)}
                      className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      {copiedId === `mode-${mode.num}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      Salin Formula
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: EXERCISE & PRACTICE LAB */}
          {/* ===================================================================== */}
          {activeMenu === 'exercise' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-700 tracking-wider">
                    Interactive Practice
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Exercise & Practice Lab</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latihan mandiri membedah kasus bisnis nyata dan menguji ketajaman formulasi prompt Anda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exercisesData.map(ex => (
                  <div key={ex.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                          #{ex.department}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mb-2">{ex.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{ex.scenario}</p>
                      
                      <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-2.5 text-xs text-rose-950 mb-3">
                        <strong className="block text-[10px] font-mono uppercase text-rose-800 mb-1">Contoh Prompt Buruk (Before):</strong>
                        "{ex.poorPrompt}"
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveExercise(ex);
                        setShowExerciseSolution(false);
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold transition-all"
                    >
                      Buka Lembar Latihan
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: 1.000+ BASIC VAULT */}
          {/* ===================================================================== */}
          {activeMenu === 'vault' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">1.000+ Basic Prompt Vault</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Arsip lengkap dari Google Sheet untuk inspirasi tugas teknis & peran spesifik.
                  </p>
                </div>

                <div className="relative w-full md:w-60">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari di 1.000+ prompt..."
                    value={rawSearchQuery}
                    onChange={(e) => { setRawSearchQuery(e.target.value); setRawPage(1); }}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A23E]"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {rawCategories.slice(0, 15).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedRawCategory(cat); setRawPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedRawCategory === cat
                        ? 'bg-[#141210] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Listing */}
              {isLoadingRaw ? (
                <div className="p-10 text-center">
                  <Loader2 size={20} className="animate-spin text-[#C9A23E] mx-auto mb-2" />
                  <span className="text-xs text-slate-500 font-mono">Memuat database Google Sheet...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {displayedRaw.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase mb-1.5 inline-block">
                            {p.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">{p.title}</h4>
                          <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">{p.description}</p>
                          <div className="bg-slate-50 rounded-lg p-2 text-[11px] font-mono text-slate-700 line-clamp-3 mb-2.5">
                            {p.content}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(p.content, `raw-${p.id}`)}
                          className="w-full py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1"
                        >
                          {copiedId === `raw-${p.id}` ? <Check size={11} /> : <Copy size={11} />}
                          {copiedId === `raw-${p.id}` ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {totalRawPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-3">
                      <button
                        disabled={rawPage === 1}
                        onClick={() => setRawPage(p => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold disabled:opacity-40"
                      >
                        Sebelumnya
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-600">
                        {rawPage} / {totalRawPages}
                      </span>
                      <button
                        disabled={rawPage === totalRawPages}
                        onClick={() => setRawPage(p => Math.min(totalRawPages, p + 1))}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold disabled:opacity-40"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: BEFORE VS AFTER */}
      {/* ========================================================================= */}
      {comparingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-[#141210] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#E5C158] uppercase tracking-wider">
                  Evolusi Kompetensi: Before vs After
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{comparingPrompt.title}</h3>
              </div>
              <button onClick={() => setComparingPrompt(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8F6F1]">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-mono font-bold text-slate-600">
                    🔴 VERSI 1 (BEFORE)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{comparingPrompt.versions[0].date}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-500 mb-2">
                  Pola: {comparingPrompt.versions[0].frameworkUsed}
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed flex-1">
                  {comparingPrompt.versions[0].promptText}
                </div>
                {comparingPrompt.versions[0].notes && (
                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    <strong>Catatan:</strong> {comparingPrompt.versions[0].notes}
                  </p>
                )}
              </div>

              {(() => {
                const latest = comparingPrompt.versions[comparingPrompt.versions.length - 1];
                return (
                  <div className="bg-white rounded-2xl border-2 border-[#E5C158] p-4 flex flex-col">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-100">
                      <span className="text-xs font-mono font-bold text-[#8F6F1A]">
                        🟢 VERSI {latest.version} (AFTER)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{latest.date}</span>
                    </div>
                    <div className="text-[11px] font-bold text-[#8F6F1A] mb-2">
                      Pola: {latest.frameworkUsed}
                    </div>
                    <div className="bg-amber-50/40 rounded-xl p-3 text-xs font-mono text-slate-900 whitespace-pre-line leading-relaxed flex-1">
                      {latest.promptText}
                    </div>
                    {latest.notes && (
                      <p className="text-[11px] text-emerald-800 mt-2 font-medium">
                        <strong>Perubahan Kunci:</strong> {latest.notes}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setComparingPrompt(null)}
                className="px-4 py-1.5 rounded-xl bg-[#141210] text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXERCISE LAB WORKBENCH */}
      {/* ========================================================================= */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-[#141210] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#E5C158] uppercase tracking-wider">
                  Exercise Lab #{activeExercise.department}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{activeExercise.title}</h3>
              </div>
              <button onClick={() => setActiveExercise(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Skenario Masalah:</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {activeExercise.scenario}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-rose-800 mb-1">Prompt Awal yang Buruk (Ad-hoc):</h4>
                <p className="text-xs font-mono text-rose-900 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                  "{activeExercise.poorPrompt}"
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5">Panduan Kunci:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeExercise.hints.map((h, i) => (
                    <span key={i} className="text-[11px] font-medium bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/60">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              {showExerciseSolution ? (
                <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Solusi Benchmark Fasilitator AIF:
                  </h4>
                  <pre className="text-xs font-mono text-slate-800 bg-emerald-50/40 p-3 rounded-xl border border-emerald-200 whitespace-pre-line leading-relaxed">
                    {activeExercise.benchmarkSolution}
                  </pre>
                  <button
                    onClick={() => handleCopy(activeExercise.benchmarkSolution, 'ex-sol')}
                    className="px-3 py-1.5 rounded-lg bg-[#141210] text-[#E5C158] text-xs font-bold flex items-center gap-1"
                  >
                    {copiedId === 'ex-sol' ? <Check size={12} /> : <Copy size={12} />}
                    Salin Solusi ke Clipboard
                  </button>
                </div>
              ) : (
                <div className="pt-3 text-center">
                  <button
                    onClick={() => setShowExerciseSolution(true)}
                    className="px-4 py-2 rounded-xl bg-[#E5C158] hover:bg-[#F0CF6B] text-slate-950 text-xs font-bold shadow-sm transition-all"
                  >
                    Buka Solusi Benchmark Fasilitator
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveExercise(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                Tutup Latihan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
