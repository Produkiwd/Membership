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
  Lightbulb, Brain, Compass, MessageSquare, Zap, AlertTriangle
} from 'lucide-react';
export interface Prompt { id: string; title: string; description: string; content: string; category: string; }

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

// Initial Curated Data (Clean & Realistic - Production)
const INITIAL_JOURNAL_PROMPTS: JournalPrompt[] = [];

const DEPARTMENT_TAGS = ['Semua', 'Finance', 'HR', 'Strategy', 'Operations', 'Marketing', 'Tech'];

// ============================================================================
// COMPREHENSIVE CURRICULUM DATASETS (UNTRUNCATED)
// ============================================================================

// 1. Foundational Prompting Techniques (8 Items with Multi-Step Flow)
const techniquesData = [
  {
    id: "zero-shot",
    title: "Zero-Shot Prompting",
    tag: "Foundational",
    steps: ["Define Query Clearly", "Send Prompt to LLM", "LLM Interprets Prompt", "Generate Response based on Internal Knowledge", "Direct Output Returned"],
    desc: "Zero-shot prompting involves directly asking questions without providing explicit examples, relying purely on the model's pre-trained internal knowledge.",
    example: "Jelaskan perbedaan utama antara CAPEX dan OPEX dalam konteks perencanaan infrastruktur TI, dan berikan contoh konkret dari masing-masing kategori untuk industri perbankan modern."
  },
  {
    id: "one-shot",
    title: "One-Shot Prompting",
    tag: "Foundational",
    steps: ["Prepare Query", "Include 1 Example Demonstrating Expected Output", "Send Prompt to LLM", "LLM Analyzes Provided Example", "Generates Contextually Similar Response", "Final Output Delivered"],
    desc: "One-shot prompting includes exactly one explicit exemplar in the prompt, helping the model immediately grasp the expected output format, tone, and logical density.",
    example: `Berikut adalah contoh ringkasan eksekutif satu kalimat:

Contoh:
[Fakta]: Biaya lisensi database melonjak 40%.
[Dampak]: Margin operasional Q3 tertekan 2.1%.
[Rekomendasi]: Evaluasi migrasi open-source database dalam 6 bulan.

Sekarang buat ringkasan situasi berikut dengan struktur yang sama persis:
[Fakta]: Tingkat turnover staf software engineer mencapai 25% tahun ini.`
  },
  {
    id: "few-shot",
    title: "Few-Shot Prompting",
    tag: "Pattern Locking",
    steps: ["Identify Query & Desired Response Style", "Provide Multiple Relevant Examples (2-5)", "Send Prompt & Examples to LLM", "LLM Recognizes Patterns from Examples", "Generates Response Following Established Pattern", "Final Contextualized Output Delivered"],
    desc: "Few-shot prompting involves providing 2–5 structured examples. This locks in classification rules, nuances, and specific styling without needing complex abstract rules.",
    example: `Klasifikasikan sentimen umpan balik nasabah dan tentukan mitigasinya:

Contoh 1:
Input: 'Aplikasi sering crash saat transaksi tanggal 25.'
Kategori: Kritis (Bug Finansial)
Mitigasi: Eskalasi Tim DevOps P1 & refund biaya admin jika ada gagal bayar.

Contoh 2:
Input: 'Warna tombol konfirmasi kurang kontras di layar malam.'
Kategori: Minor (UI/UX)
Mitigasi: Masukkan ke backlog sprint desain UI bulan depan.

Sekarang klasifikasikan input berikut:
Input: 'Saldo terpotong dua kali pada saat pembayaran QRIS di kasir supermarket.'`
  },
  {
    id: "cot",
    title: "Chain-of-Thought (CoT) Prompting",
    tag: "Logic & Reasoning",
    steps: ["Identify Complex Problem", 'Instruct LLM Explicitly ("Think step-by-step")', "Send Step-by-step Prompt", "LLM Performs Incremental Reasoning", "Provides Detailed Intermediate Steps", "Reaches Logical Conclusion", "Complete Answer Delivered"],
    desc: "Chain-of-thought prompting explicitly instructs the LLM to perform incremental reasoning before answering. This cuts hallucination rates significantly on complex math, logic, or policy trade-offs.",
    example: `Sebelum memberikan rekomendasi investasi pada proyek otomatisasi pergudangan senilai Rp 5 Miliar, uraikan proses berpikir Anda tahap demi tahap:

Langkah 1: Hitung Payback Period dan ROI kasar berdasarkan asumsi efisiensi biaya lembur Rp 1.5 Miliar/tahun.
Langkah 2: Evaluasi risiko teknis integrasi dengan legacy ERP yang sudah berusia 8 tahun.
Langkah 3: Rumuskan 2 alternatif mitigasi kegagalan adopsi di lapangan.
Kesimpulan & Rekomendasi Final:`
  },
  {
    id: "self-consistency",
    title: "Self-Consistency Prompting",
    tag: "Multi-Path Consensus",
    steps: ["Clearly Define Query & Desired Reasoning", "Send Prompt to LLM (Multiple Generations)", "LLM Generates Multiple Reasoning Paths", "Evaluate Multiple Outputs for Consistency", "Select Most Consistent Answer", "Final Verified Answer Provided"],
    desc: "Self-consistency involves generating multiple divergent reasoning paths for the same problem, then selecting the answer supported by consensus. Highly effective for mission-critical decisions.",
    example: `Evaluasi strategi penetapan harga langganan B2B ini melalui 3 sudut pandang penalaran yang independen:
Jalur A: Analisis elastisitas harga dan willingness-to-pay segmen enterprise.
Jalur B: Analisis margin kontribusi per akun (CAC vs LTV 3 tahun).
Jalur C: Analisis respon kompetitif dari incumbent market leader.

Bandingkan kesimpulan ketiganya, temukan titik temu paling kokoh, dan berikan harga akhir yang paling aman bagi cashflow.`
  },
  {
    id: "role-based",
    title: "Role-Based Prompting",
    tag: "Expert Persona",
    steps: ["Choose Desired Role/Persona", "Craft Prompt Clearly Defining the Role", "Send Role-based Prompt to LLM", "LLM Adopts Specified Role", "Generates Response Aligned with Expertise", "Role-Specific Output Delivered"],
    desc: "Role-based prompting instructs the model to embody a world-class specialist persona, anchoring the vocabulary, analytical depth, and perspective to that specific professional domain.",
    example: "Bertindaklah sebagai Chief Risk Officer (CRO) perbankan tier-1 dengan pengalaman 20 tahun dalam audit kepatuhan regulasi OJK dan Basel III. Review ringkasan arsitektur cloud data nasabah ini dan soroti 3 celah kepatuhan paling rentan terhadap sanksi hukum."
  },
  {
    id: "instruction-tuning",
    title: "Instruction Tuning (Task-Specific Constraints)",
    tag: "Precision Control",
    steps: ["Identify Specific Task Requirements", "Prepare Detailed Task-specific Instructions", "Include Instructions Explicitly in Prompt", "Send Clearly Structured Prompt", "LLM Precisely Follows Provided Instructions", "Generates Task-specific Output", "Final Output Delivered"],
    desc: "Instruction tuning explicitly bounds the model with strict formatting, negative constraints (what NOT to do), and structural guardrails for reproducible business automation.",
    example: `Instruksi Khusus & Batasan Ketat:
1. Ekstrak hanya entitas: [Nama Mitra], [Nilai Kontrak], [Masa Berlaku], [Penalti Keterlambatan].
2. Tampilkan dalam tabel Markdown 4 kolom.
3. Jika informasi penalti tidak disebutkan di dokumen, tulis 'TIDAK DICANTUMKAN' (DILARANG MENGARANG/HALUSINASI).
4. Dilarang menambahkan kata pengantar atau salam penutup. Hanya keluarkan tabel Markdown.`
  },
  {
    id: "react",
    title: "ReAct (Reasoning + Action) Prompting",
    tag: "Autonomous Agentic",
    steps: ["Clearly State Query Requiring External Info", "Send Prompt with Action Permissions", "LLM Reasons to Identify Required Actions", "LLM Initiates Appropriate External Action", "Receives & Processes External Data", "Continues Reasoning with Context", "Final, Fully-informed Answer"],
    desc: "ReAct combines verbal reasoning traces ('Thought') with task-specific actions ('Action') and feedback observation ('Observation') to ground LLM outputs in real-time verified facts.",
    example: `Terapkan siklus ReAct (Thought -> Action -> Observation -> Final Answer):

Thought 1: Saya perlu mengecek apakah regulasi batas upah minimum provinsi (UMP) 2025 telah diterbitkan secara resmi.
Action 1: [Search / Query Dokumen Regulasi UMP 2025]
Observation 1: Peraturan Gubernur diterbitkan dengan kenaikan 6.5%.
Thought 2: Sekarang saya harus menghitung dampak kenaikan ini terhadap pos anggaran biaya operasional pabrik.
Final Answer: Ringkasan dampak kenaikan UMP 6.5% beserta 2 strategi rasionalisasi shift kerja.`
  }
];

// 2. The Brutal Method (Honest Feedback & Red Teaming)
const brutalMethodData = {
  problem: {
    title: "THE PROBLEM: THE \"HELPFULNESS\" & POLITENESS BIAS",
    points: [
      {
        title: "AI Dilatih untuk Melindungi Ego Pengguna",
        desc: "Secara default, model AI dioptimasi melalui RLHF (Reinforcement Learning from Human Feedback) untuk bersikap ramah, suportif, dan menyenangkan. Akibatnya, AI cenderung memberikan validasi palsu atau pujian sopan terhadap proposal bisnis yang sebetulnya rapuh."
      },
      {
        title: "Kebutuhan Keputusan High-Stakes",
        desc: "Untuk proposal tender dewan direksi, peluncuran produk baru, penawaran merger, atau mitigasi audit hukum, feedback sopan sangat berbahaya. Anda membutuhkan kritik kejam tanpa ampun sebelum pasar atau kompetitor menghukum Anda."
      }
    ]
  },
  framework: [
    {
      num: "1",
      title: "Begin Fresh: Kill the Memory",
      desc: "Gunakan 'Temporary Chat' (ChatGPT, Gemini) atau 'Incognito/Ghost Mode' (Claude) agar model tidak mengingat riwayat preferensi Anda yang membuat AI berusaha menyenangkan Anda."
    },
    {
      num: "2",
      title: "Right Model Selection",
      desc: "Untuk keputusan bernilai tinggi, uji dokumen Anda ke 2-3 model berbeda. Grok/DeepSeek cenderung lebih lugas dan blak-blakan, sementara ChatGPT/Claude memerlukan dorongan persona kritis."
    },
    {
      num: "3",
      title: "Use a Critic Persona",
      desc: "Tugaskan peran pengkritik tanpa kompromi: Devil's Advocate, Auditor Forensik Skeptis, atau Investor Kejam ala Shark Tank yang bertujuan membantai asumsi proposal Anda."
    },
    {
      num: "4",
      title: "Third-Party Framing",
      desc: "Lepaskan identitas Anda dari materi tersebut. Katakan: 'Ini adalah draf dari kompetitor kita / kolega lain'. Trik psikologis ini membebaskan AI dari rasa enggan menyakiti perasaan Anda."
    },
    {
      num: "5",
      title: "Ask Specific Risk Questions",
      desc: "Ganti pertanyaan 'Bagaimana menurutmu?' dengan pertanyaan berdaya rusak tinggi: 'Lakukan pre-mortem: sebutkan 3 alasan paling fatal mengapa inisiatif ini akan gagal total dalam 90 hari.'"
    },
    {
      num: "6",
      title: "Leverage AI Against Itself (AI Jiu-Jitsu)",
      desc: "Minta AI memberi nilai 1-100 pada kekejaman kritiknya. Lalu perintahkan: 'Kritik di atas masih terlalu sopan. Tingkatkan skor ketajamannya menjadi 95/100 dan bongkar lubang logika terdalam!'"
    }
  ],
  modelSpectrum: [
    {
      name: "Grok & DeepSeek",
      badge: "Honest & Blunt",
      desc: "Cenderung sangat objektif, blak-blakan, tidak segan menolak premis yang salah, dan minim basa-basi kesopanan."
    },
    {
      name: "Gemini",
      badge: "Supportive / Explorative",
      desc: "Sangat unggul dalam sintesis multi-dokumen panjang dan riset, namun membutuhkan perintah eksplisit agar mau mengkritik tajam."
    },
    {
      name: "ChatGPT & Claude",
      badge: "Ego-Protective by Default",
      desc: "Sangat santun dan diplomatis secara default. Sangat membutuhkan framing pihak ketiga atau persona Red Teaming agar tidak memuji-muji draf yang lemah."
    }
  ],
  systemLevelBonus: {
    title: "BONUS: SYSTEM-LEVEL CUSTOM INSTRUCTIONS",
    desc: "Gunakan pengaturan personalisasi profil untuk menetapkan instruksi permanen:",
    prompt: "Prioritize substance over compliments; challenge assumptions relentlessly; never soften criticism to make me feel comfortable; act as an unapologetic Red Team auditor."
  }
};

// 3. Jeff Su's Precision Framework
const jeffSuData = {
  templates: [
    {
      title: "Prompt Optimizer Meta-Prompt",
      desc: "Alternatif gratis untuk tools optimasi prompt berbayar. AI bertindak sebagai prompt engineer elit yang me-rewrite prompt awal Anda.",
      prompt: `You are an expert prompt engineer specializing in creating prompts for AI language models, particularly [model]. Your task is to take my prompt and transform it into a well-crafted and effective prompt that will elicit optimal responses. Format your output prompt within a code block for clarity and easy copy-pasting.

## Here's my initial prompt:
[paste your prompt here]`
    },
    {
      title: "XML Sandwich Template",
      desc: "Meningkatkan presisi model dengan memisahkan komponen instruksi ke dalam tag XML terisolasi.",
      prompt: `<context>
[Berikan latar belakang, siapa Anda, industri bisnis, dan kondisi yang dihadapi]
</context>

<task>
[Jelaskan instruksi spesifik apa yang harus dilakukan AI menggunakan action verbs]
</task>

<rules>
1. Gunakan nada asertif dan profesional.
2. Buat tabel 3 kolom untuk temuan risiko.
3. Jangan membuat asumsi di luar fakta yang disediakan.
</rules>

<example>
[Berikan contoh output target yang ideal]
</example>`
    },
    {
      title: "Universal Perfection Loop",
      desc: "Perintahkan AI untuk membangun rubrik penilaian internal dan mengiterasi drafnya secara mandiri sampai bernilai 10/10 sebelum menjawab.",
      prompt: "Before you respond, create an internal rubric for what defines a 'world-class, 10/10' answer to my request. Then internally iterate on your work until it scores 10/10 against that rubric, and show me only the final, perfect output."
    },
    {
      title: "Router Nudge Phrases",
      desc: "Frasa tambahan di akhir prompt untuk memicu alokasi komputasi reasoning mendalam pada model berpikir tingkat tinggi.",
      prompt: `Tambahkan salah satu frasa ini di baris penutup prompt Anda:
- "Think hard about this."
- "Think deeply and consider edge cases before answering."
- "Evaluate hidden trade-offs carefully."`
    },
    {
      title: "Verbosity Control Phrases",
      desc: "Mengontrol panjang teks keluaran secara presisi agar tidak terlalu dangkal maupun bertele-tele.",
      prompt: `- Low Verbosity: "Give me the bottom line in 100 words or less, use markdown bullets for high scanability."
- Medium Verbosity: "Aim for a concise 3-5 paragraph explanation with clear section headers."
- High Verbosity: "Provide a comprehensive and detailed breakdown (600–800 words) with step-by-step rationales."`
    }
  ],
  buildingBlocks: [
    { title: "1. Task", desc: "Komponen paling krusial. Selalu mulai dengan action verb eksplisit: generate, write, analyze, audit, synthesize." },
    { title: "2. Context", desc: "Jawab 3 hal penting: latar belakang situasi, kriteria sukses ('what success looks like'), dan lingkungan kerja." },
    { title: "3. Exemplars", desc: "Berikan 1–3 contoh konkret dari output yang diinginkan untuk mengunci gaya dan format." },
    { title: "4. Persona", desc: "Definisikan peran spesifik: 'Senior Procurement Director', 'Forensic Auditor', dll." },
    { title: "5. Format", desc: "Visualisasikan bentuk output: tabel Markdown, memo Minto Pyramid, email eksekutif, atau JSON." },
    { title: "6. Tone", desc: "Tentukan nada bicara: objektif, lugas tanpa basa-basi, asertif, atau diplomatik persuasif." }
  ],
  bestPractices: [
    { title: "Router Nudge Phrases", desc: "Gunakan untuk memaksa higher reasoning model berjalan pada model reasoning (o1, o3, Gemini Thinking)." },
    { title: "Verbosity Control", desc: "Kontrol panjang konten karena model dapat kelebihan atau kekurangan kata tanpa arahan spesifik." },
    { title: "Prompt Optimizer Meta-Prompt", desc: "Gunakan AI untuk mengaudit dan me-rewrite instruksi buatan Anda sendiri." },
    { title: "XML Sandwich", desc: "Gunakan tag <task>, <context>, <rules> supaya model lebih presisi membaca instruksi panjang." },
    { title: "Perfection Loop", desc: "Gunakan rubrik internal AI untuk menilai kualitas output dirinya sendiri sampai mencapai skor 10/10." }
  ],
  mistakes: [
    { title: "1. Overly Specific Custom Instructions", desc: "Terlalu detail justru membatasi keluwesan model. Cantumkan intinya saja: preferensi, tone, dan format." },
    { title: "2. Tidak Memanfaatkan untuk Otomasi", desc: "AI bisa membantu menulis kode, formula Excel rumit, atau skrip automasi tanpa Anda harus menguasai pemrograman." },
    { title: "3. The First-try Fallacy", desc: "Jangan harapkan kesempurnaan langsung di percobaan pertama. Minta AI mengajukan pertanyaan klarifikasi terlebih dahulu." },
    { title: "4. The Summary-only Shortfall", desc: "Jangan sekadar meminta rangkuman biasa. Minta actionable insights dan implikasi strategis bisnis." },
    { title: "5. Prompt Overload Paradox", desc: "Fokus menguasai 3–5 formula prinsipil yang bisa diadaptasi daripada menyimpan ribuan prompt yang jarang dipakai." }
  ]
};

// 4. Smart Learning & Research (5 Mode Kognitif Pembelajaran Berbasis Riset)
const readingModesData = [
  {
    id: 1,
    tag: "100 → 1",
    num: "01",
    title: "Get the Gist Instantly",
    subtitle: "Big Picture First (Memahami Intisari Utama)",
    theory: "Cognitive Load Theory",
    theorist: "John Sweller",
    theoryDesc: "Kapasitas memori kerja manusia sangat terbatas. Pembelajaran efektif membutuhkan pengelolaan beban kognitif dengan meminimalisir gangguan (extraneous load) dan memaksimalkan skema pemahaman konseptual (germane load).",
    tactic: "Sebelum membaca teks mentah secara mendetail, gunakan AI untuk membuat Briefing Docs dan Study Guides otomatis. Ini memberikan peta struktural awal yang secara drastis mengurangi beban kognitif dan membebaskan pikiran Anda untuk menganalisis konsep.",
    samplePrompt: "What is the single most important concept that connects all of these materials? Explain in one paragraph.",
    problem: "Terlalu banyak materi dan dokumen tebal, tidak tahu harus mulai dari mana.",
    solution: "Mengubah tumpukan konten menjadi satu pemahaman inti (core understanding) yang mudah dicerna.",
    impact: "Memahami gambaran besar dengan cepat, memberikan arah pembelajaran yang lebih terfokus.",
    workflow: [
      "Upload semua materi — slides, PDFs, artikel, transkrip",
      "Minta AI menemukan satu konsep pemersatu utamanya",
      "Simpan jawaban sebagai Catatan — ini menjadi peta belajar Anda",
      "Gunakan Audio Overview untuk mencerna materi dengan mendengarkan"
    ],
    quickWin: "Dalam 5 menit, dapatkan peta utuh tanpa harus membaca seluruh tumpukan halaman terlebih dahulu."
  },
  {
    id: 2,
    tag: "100 → 10",
    num: "02",
    title: "Create Structured Outlines",
    subtitle: "Organize & Chunk (Mendekonstruksi Dokumen)",
    theory: "Connectivism",
    theorist: "George Siemens",
    theoryDesc: "Di era digital, pembelajaran bukan sekadar konstruksi pengetahuan internal, melainkan tentang mengenali pola dan membangun koneksi antar informasi dari berbagai sumber lintas domain.",
    tactic: "Kumpulkan materi acak lintas sumber. Minta AI bertindak sebagai mesin konektivis — memetakan hubungan antar domain dan merapikannya secara struktural dalam matriks keputusan.",
    samplePrompt: "Act as a strategic advisor. Synthesize these sources to find three unexpected connections between [Concept A] and [Concept B]. Provide citations.",
    problem: "Informasi berhasil diserap namun tersebar berantakan dan tidak terorganisir.",
    solution: "Mengubah materi yang berserakan menjadi poin-poin terstruktur melalui proses chunking (pengelompokan).",
    impact: "Materi menjadi terorganisir rapi, mudah dipelajari, dan siap dipresentasikan ke stakeholder.",
    workflow: [
      "Gunakan materi yang sudah ada di dalam ruang kerja AI",
      "Minta AI menyusunnya menjadi 10 poin utama atau sebuah outline terstruktur",
      "Simpan output yang terstruktur sebagai Catatan",
      "Buat Mind Map untuk memvisualisasikan koneksi antar konsep"
    ],
    quickWin: "Materi yang super berantakan berubah menjadi outline super rapi dalam waktu kurang dari 10 menit."
  },
  {
    id: 3,
    tag: "0 → 1",
    num: "03",
    title: "Spark New Ideas",
    subtitle: "Beat the Blank Page (Menumpas Sindrom Halaman Kosong)",
    theory: "Constructivism",
    theorist: "Piaget & Vygotsky",
    theoryDesc: "Pembelajar secara aktif membangun (mengkonstruksi) pemahaman dengan mengalami berbagai hal dan merefleksikannya, membangun di atas skema kognitif yang telah ada sebelumnya.",
    tactic: "Gunakan Active Reading: tuliskan pemikiran, refleksi, atau hipotesis awal Anda pada kolom chat AI. Lalu minta AI untuk memeriksa interpretasi tersebut berdasarkan teks sumber aslinya.",
    samplePrompt: "Based on the text, is my interpretation here accurate? What evidence supports or contradicts my thought?",
    problem: "Kesulitan atau mengalami 'blank page syndrome' saat harus memulai proses analisis dari layar putih.",
    solution: "Menjadikan AI sebagai partner brainstorming yang pandangannya tertambat kuat pada dokumen referensi.",
    impact: "Mendapatkan banyak inspirasi dan ide segar serta pijakan awal penulisan yang tajam.",
    workflow: [
      "Upload satu dokumen utama sebagai jangkar (silabus, brief, proposal)",
      "Lakukan curah pendapat (brainstorming) sudut pandang kritis dengan AI",
      "Simpan ide-ide menarik sebagai Catatan Baru",
      "Kembangkan catatan tersebut menjadi draf kerja awal melalui format FAQ"
    ],
    quickWin: "Dalam waktu 5 menit sesi brainstorming terarah dengan AI, Anda akan menumpas sindrom halaman kosong."
  },
  {
    id: 4,
    tag: "100 → 100+",
    num: "04",
    title: "Deep Mastery",
    subtitle: "From Learner to Expert (Dari Pemula Menjadi Mahir)",
    theory: "Elaborative Interrogation",
    theorist: "Feynman Technique",
    theoryDesc: "Pembelajaran aktif melalui pertanyaan 'Mengapa?' dan 'Bagaimana?' mengintegrasikan fakta baru dengan pengetahuan dasar. Ini pergeseran dari membaca pasif menjadi menjelaskan secara aktif — pondasi utama menuju keahlian sejati.",
    tactic: "Upload konsep/framework yang Anda miliki, lalu gunakan AI sebagai Socratic sparring partner (rekan debat). Minta AI untuk mengkritisi asumsi Anda, dan paksa diri Anda menjawab tantangan tersebut.",
    samplePrompt: "Review my uploaded framework. Ask me one deep, challenging question about the underlying assumptions of this model, and wait for my answer.",
    problem: "Pemahaman masih terasa berada di permukaan, sering gugup saat menghadapi skenario di luar materi teks.",
    solution: "Memperdalam tingkat pemahaman hingga selevel pakar melalui pola Socratic dialog bertingkat.",
    impact: "Mampu mempertahankan argumen dan menjawab pertanyaan fundamental stakeholder dengan percaya diri.",
    workflow: [
      "Pastikan seluruh materi suatu topik sudah berada di dalam sistem",
      "Minta AI mengajukan pertanyaan fundamental (pertanyaan 'why', 'what if')",
      "Simpan analogi dan jawaban krusial Anda menjadi Catatan pemahaman utuh",
      "Kembangkan menjadi Study Guide beserta kumpulan flashcard pengujiannya"
    ],
    quickWin: "Dalam 3-4 putaran pertanyaan sokratik kritis, temukan blind spot (sisi gelap pemahaman) yang tidak Anda sadari."
  },
  {
    id: 5,
    tag: "10 → 10+",
    num: "05",
    title: "Accelerate Your Research",
    subtitle: "Synthesize & Discover (Sintesis Celah Riset)",
    theory: "Dual Coding Theory",
    theorist: "Allan Paivio",
    theoryDesc: "Manusia jauh lebih mudah memproses dan mengingat informasi jika disampaikan via dua saluran kognitif sekaligus secara berbarengan — visual/tekstual serta auditori.",
    tactic: "Hasilkan sintesis komprehensif bagi dokumen kompleks Anda. Identifikasi di mana titik konsensus para ahli, titik yang masih diperdebatkan, serta temukan research gap yang belum terjawab.",
    samplePrompt: "What is the consensus across all these sources? What is still debated? Where is the research gap I could fill?",
    problem: "Kesulitan menyari atau mensintesis tumpukan sumber riset atau dokumen referensi multi-sumber.",
    solution: "Sintesis mendalam difasilitasi AI guna memetakan konsensus, perdebatan, dan celah kosong (research gap).",
    impact: "Penemuan gagasan inovatif baru yang memandu percepatan riset dan pengambilan keputusan strategis.",
    workflow: [
      "Upload jurnal riset, memo, regulasi, dan berbagai artikel pendukung",
      "Beri instruksi sintesis dan analisis literature gap pada materi rujukan tersebut",
      "Tandai ide hasil sintesis ini dan simpan sebagai referensi terpercaya",
      "Satukan dalam tinjauan komparatif menggunakan format matriks atau timeline"
    ],
    quickWin: "Buat pemetaan lanskap riset dalam waktu 15 menit, tugas yang biasanya memakan waktu berhari-hari."
  }
];

// 5. Use AI To Learn Anything Faster (10 Pola Percepatan Belajar - Moritz Kremb)
const learningData = [
  {
    title: "Explain Like I'm 5 (ELIF)",
    author: "Moritz Kremb",
    desc: "Sederhanakan konsep rumit menjadi penjelasan bahasa awam yang bahkan anak kecil pun bisa paham. Sangat cocok saat Anda baru pertama kali mempelajari domain baru yang asing.",
    prompt: "Explain [insert concept or topic] as if you were talking to a 5-year-old child. Use simple language, everyday analogies, and avoid technical jargon."
  },
  {
    title: "Examples & Analogies",
    author: "Moritz Kremb",
    desc: "Minta contoh konkret di dunia nyata yang membuat ide abstrak langsung 'klik' di kepala.",
    prompt: "Explain [insert concept or topic] using three different real-world examples or analogies that would be easy for a beginner to understand."
  },
  {
    title: "Motivation & Habit Consistency",
    author: "Moritz Kremb",
    desc: "Dapatkan strategi praktis dan tips menjaga motivasi belajar serta disiplin konsistensi saat materi terasa berat.",
    prompt: "I'm struggling to stay motivated while learning [insert subject or skill]. Provide me with 5 practical strategies to boost my motivation and maintain consistency in my studies."
  },
  {
    title: "Role-Play & Simulation",
    author: "Moritz Kremb",
    desc: "Simulasikan interaksi nyata untuk mempraktikkan keterampilan negosiasi, presentasi, atau penanganan konflik.",
    prompt: "Let's role-play a scenario where I'm [insert your role] and you're [insert counterpart role]. We'll practice [insert skill or situation]. Begin the scenario, and I'll respond accordingly."
  },
  {
    title: "Structured Study Plan",
    author: "Moritz Kremb",
    desc: "Petakan kurikulum belajar dari awal hingga akhir dengan target mingguan terukur agar tidak kewalahan.",
    prompt: "Create a detailed study plan for learning [insert subject or skill] over the course of [insert time frame]. Include specific goals, free resources, weekly milestones, and assessment checkpoints."
  },
  {
    title: "Active Recall Quiz",
    author: "Moritz Kremb",
    desc: "Uji pemahaman Anda dengan serangkaian soal latihan variatif untuk menguji apakah Anda benar-benar paham.",
    prompt: "Generate a 10-question quiz on [insert topic], including a mix of multiple-choice, true/false, and short-answer questions. Provide answers and brief explanations for each question."
  },
  {
    title: "Mindmap & Conceptual Hierarchy",
    author: "Moritz Kremb",
    desc: "Petakan hubungan sebab-akibat dan hierarki konsep utama beserta sub-cabangnya untuk melihat gambaran besar.",
    prompt: "Create a detailed mind map for the topic [insert topic]. Include main branches, sub-branches, and key concepts or ideas for each in a clean indented markdown list."
  },
  {
    title: "Expert Roundtable Discussion",
    author: "Moritz Kremb",
    desc: "Simulasikan diskusi meja bundar antara para pakar terkemuka di bidang tertentu untuk mendapatkan multi-perspektif.",
    prompt: "Simulate a roundtable discussion with me and three experts in [insert field] discussing [insert topic or question]. Present their different viewpoints and any potential areas of agreement or disagreement."
  },
  {
    title: "Mental Associations & Mnemonics",
    author: "Moritz Kremb",
    desc: "Buat jembatan keledai dan teknik asosiasi memori agar rumus, istilah asing, atau urutan langkah menempel erat di ingatan.",
    prompt: "Help me create mental associations or mnemonic devices to remember key information about [insert topic or concept]."
  },
  {
    title: "Improve What You Have (Iterative Polish)",
    author: "Moritz Kremb",
    desc: "Dapatkan kritik konstruktif dan rekomendasi revisi spesifik untuk menyempurnakan dokumen draf yang telah Anda buat.",
    prompt: "Here's something I've [written/created/produced]: [insert your work]. Please provide specific suggestions to improve it, focusing on [aspect you want to improve, e.g., clarity, structure, persuasiveness]. Explain why each change would make it better."
  }
];

// 6. How to Use AI to Extract Everything from a Book / Long Report (10 Strategi Sintesis)
const extractBooksData = [
  {
    title: "Key Takeaways & Core Lessons",
    desc: "Buku bisnis sering kali memuat banyak cerita pendukung. AI membantu menyaring intisari esensial dan menerjemahkannya ke tindakan nyata.",
    prompt: "Identify the top 5 actionable takeaways from [book title] and explain how each could be applied in a real-world business scenario."
  },
  {
    title: "Case Studies Deep-Dive",
    desc: "Studi kasus nyata menjembatani jurang antara teori abstrak dan praktik lapangan. Ekstrak pelajaran dari kasus yang dibahas.",
    prompt: "Identify any case studies presented in [book title]. Summarize their key points and explain how they support the book's overall message."
  },
  {
    title: "Book Comparison & Dialectic",
    desc: "Membandingkan dua buku memperlihatkan titik temu dan perdebatan pemikiran para penulis ternama.",
    prompt: "Compare and contrast the key principles in [book title] with those in [another relevant book]. What are the similarities and differences? How do they complement or contradict each other?"
  },
  {
    title: "Explain to Different Audiences",
    desc: "Jelaskan ide pokok buku pada 3 tingkat kesulitan berbeda untuk menguji kedalaman pemahaman.",
    prompt: `In [book title], the author discusses [concept]. Explain this concept as if you were teaching:
a) A high school student
b) A seasoned CEO
c) A student considering a career in this field
How does the explanation differ for each audience?`
  },
  {
    title: "Apply to Different Business Models",
    desc: "Uji fleksibilitas teori buku jika diterapkan pada konteks industri atau skala bisnis yang berbeda drastis.",
    prompt: `Imagine you're implementing the strategies from [book title] in:
a) A tech startup
b) A family-owned retail business
c) A large multinational manufacturing corporation
What would be the specific challenges and opportunities in each scenario?`
  },
  {
    title: "Extract & Apply Frameworks",
    desc: "Ekstrak model atau matriks yang diperkenalkan penulis, lalu uji pada kasus sukses dan kegagalan bisnis terkini.",
    prompt: `In [book title], the author presents [specific framework or model]. Apply this framework to analyze:
a) A recent business success story
b) A notable business failure
What insights does this analysis provide?`
  },
  {
    title: "30-Day Action Implementation Plan",
    desc: "Ubah teori buku menjadi roadmap eksekusi terukur 30 hari bagi seorang pemimpin bisnis.",
    prompt: "Based on the principles outlined in [book title], create a practical 30-day action plan for a business leader looking to implement these ideas with weekly milestones and KPIs."
  },
  {
    title: "Identify Potential Weaknesses & Blind Spots",
    desc: "Memahami suatu konsep secara matang berarti mampu mengenali batas keberlakuan dan potensi titik gagalnya.",
    prompt: "What are the potential criticisms or limitations of the ideas presented in [book title]? Under what market conditions would this strategy fail?"
  },
  {
    title: "Main Thesis Synthesis",
    desc: "Rangkum tesis utama buku dalam satu kalimat tajam, kemudian petakan bagaimana bab-bab berikutnya membangun fondasi tesis tersebut.",
    prompt: "Summarize the main thesis of [book title] in one sentence, then expand on how this central idea is systematically developed throughout the book."
  },
  {
    title: "Analyze Memorable Quotes",
    desc: "Bedah kutipan paling berpengaruh dari buku untuk memahami konteks filosofis di balik pemikiran sang penulis.",
    prompt: "Extract 3-5 memorable quotes from [book title]. For each quote, explain its context, deeper significance, and how it encapsulates a key strategic lesson from the book."
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

export default function App({ onBack }: { onBack?: () => void }) {
  // Navigation State (WJG Style)
  // 'beranda' | 'my-journal' | 'prompt-studio' | 'community' | 'techniques' | 'reading-learning' | 'exercise' | 'vault'
  const [activeMenu, setActiveMenu] = useState<string>('beranda');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Journal Prompts (LocalStorage Persisted)
  const [journalPrompts, setJournalPrompts] = useState<JournalPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('aif_prod_journal_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: any) => !['jp-1', 'jp-2', 'jp-3'].includes(p.id));
        }
      }
    } catch (e) {
      console.error('Failed to parse journal', e);
    }
    return INITIAL_JOURNAL_PROMPTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('aif_prod_journal_v1', JSON.stringify(journalPrompts));
    } catch (e) {
      console.error('Failed to save journal', e);
    }
  }, [journalPrompts]);

  // Filters & State
  const [selectedTag, setSelectedTag] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Sub-Navigation Tabs
  const [activeTechniqueSubTab, setActiveTechniqueSubTab] = useState<'foundational' | 'brutal' | 'jeffsu'>('foundational');
  const [activeLearningSubTab, setActiveLearningSubTab] = useState<'smart' | 'faster' | 'extract'>('smart');
  
  // Modals
  const [comparingPrompt, setComparingPrompt] = useState<JournalPrompt | null>(null);
  const [activeExercise, setActiveExercise] = useState<typeof exercisesData[0] | null>(null);
  const [showExerciseSolution, setShowExerciseSolution] = useState(false);
  const [reviewingPrompt, setReviewingPrompt] = useState<JournalPrompt | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(9.5);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');

  const handleOpenReview = (item: JournalPrompt) => {
    const latest = item.versions[item.versions.length - 1];
    setReviewingPrompt(item);
    setReviewScore(latest.facilitatorScore || item.score || 9.0);
    setReviewFeedback(latest.facilitatorFeedback || '');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingPrompt) return;

    setJournalPrompts(prev => prev.map(item => {
      if (item.id === reviewingPrompt.id) {
        const updatedVersions = item.versions.map((v, i) => {
          if (i === item.versions.length - 1) {
            return {
              ...v,
              facilitatorScore: reviewScore,
              facilitatorFeedback: reviewFeedback
            };
          }
          return v;
        });

        return {
          ...item,
          score: reviewScore,
          versions: updatedVersions
        };
      }
      return item;
    }));

    if (comparingPrompt && comparingPrompt.id === reviewingPrompt.id) {
      setComparingPrompt(prev => {
        if (!prev) return null;
        const updatedVersions = prev.versions.map((v, i) => {
          if (i === prev.versions.length - 1) {
            return {
              ...v,
              facilitatorScore: reviewScore,
              facilitatorFeedback: reviewFeedback
            };
          }
          return v;
        });
        return { ...prev, score: reviewScore, versions: updatedVersions };
      });
    }

    setReviewingPrompt(null);
  };

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
    <div className="min-h-screen bg-[#f5f6f9] text-slate-900 flex font-sans antialiased selection:bg-[#E5C158] selection:text-slate-950">
      
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
              <section className="bg-gradient-to-br from-[#141210] to-[#1e1a17] rounded-2xl text-white p-7 sm:p-9 shadow-sm border border-[#2a2420]">
                <div className="max-w-2xl">
                  <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[2px] text-[#E5C158] mb-2">
                    Enterprise Prompt System
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-2.5">
                    Selamat datang di <span className="text-[#E5C158]">Prompt Database.</span>
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                    Buka jurnal saya atau buat formula baru. Ruang kerja terstruktur untuk mengoptimalkan prompt AI, melacak komparasi Sebelum &amp; Sesudah (Before &amp; After), serta mendalami teknik prompting berstandar eksekutif.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveMenu('my-journal')}
                      className="px-4 py-2.5 rounded-xl bg-[#E5C158] hover:bg-[#F0CF6B] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
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

              {/* 6 Modular Boxes (Grid 3x2) - Harmonious Wijigila Style */}
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                      PILIHAN MODUL
                    </span>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Pilih Kebutuhan Pembelajaran</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Box 1: My Prompt Journal */}
                  <div 
                    onClick={() => setActiveMenu('my-journal')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          01
                        </span>
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          {journalPrompts.length} Tersimpan
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        My Prompt Journal
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Repositori personal Anda untuk melacak riwayat evolusi Before &amp; After, catatan revisi, dan kematangan prompt dari waktu ke waktu.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Buka Jurnal Saya</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Box 2: Prompt Formula Studio */}
                  <div 
                    onClick={() => setActiveMenu('prompt-studio')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          02
                        </span>
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          Formula Studio
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        Prompt Formula Studio
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Susun instruksi berbobot tinggi dengan panduan 7 parameter A.C.T.I.O.N.S. atau 3 parameter ACT cepat.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Buat Formula Baru</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Box 3: Prompt Community */}
                  <div 
                    onClick={() => setActiveMenu('community')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          03
                        </span>
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          Community Hub
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        Prompt Community
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Jelajahi dan adaptasi formula teruji dari rekan komunitas lintas divisi lengkap dengan feedback dan skor kurasi fasilitator.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Jelajahi Komunitas</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Box 4: Prompting Techniques */}
                  <div 
                    onClick={() => setActiveMenu('techniques')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          04
                        </span>
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          Materi &amp; Teknik
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        Prompting Techniques
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Pola instruksi presisi: Zero-Shot, Few-Shot, Chain-of-Thought (CoT), The Brutal Method, hingga Jeff Su XML Sandwich.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Pelajari Teknik</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Box 5: Reading & Smart Learning */}
                  <div 
                    onClick={() => setActiveMenu('reading-learning')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          05
                        </span>
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          Smart Learning
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        Reading &amp; Smart Learning
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        5 Mode Baca berbasis teori kognitif (Syntopical Reading, Dual Coding, Schema Theory) untuk sintesis laporan dan pembelajaran cepat.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Buka Materi Baca</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Box 6: Exercise & Practice Lab */}
                  <div 
                    onClick={() => setActiveMenu('exercise')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          06
                        </span>
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          Practice Lab
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        Exercise &amp; Practice Lab
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Latihan mandiri &amp; studi kasus interaktif untuk menguji ketajaman prompt Anda dengan benchmark solution dari fasilitator.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Mulai Latihan</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                </div>
              </section>

              {/* Bottom Card for 1,000+ Basic Prompt Vault */}
              <div 
                onClick={() => setActiveMenu('vault')}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Library size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                      Basic Prompt Library (1.000+ Vault)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Koleksi 1.000+ prompt dasar dan referensi teknis lintas profesi siap pakai untuk berbagai kebutuhan operasional.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 shrink-0 group-hover:text-slate-950 group-hover:gap-2 transition-all">
                  <span>Buka Basic Library</span>
                  <ArrowRight size={13} />
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

              {/* Cards Grid / Empty State */}
              {filteredJournal.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-xl mx-auto my-6 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3.5">
                    <BookmarkCheck size={22} className="text-slate-600" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Belum Ada Prompt di Jurnal Pribadi</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-md mx-auto">
                    Mulai simpan formula instruksi kerja Anda di Prompt Formula Studio, atau pelajari teknik-teknik prompting dari pustaka materi.
                  </p>
                  <button
                    onClick={() => {
                      setIteratingPromptId(null);
                      setBuilderTitle('');
                      setActiveMenu('prompt-studio');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#141210] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Plus size={14} className="text-[#E5C158]" />
                    <span>Buat Formula Baru</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredJournal.map(item => {
                    const latest = item.versions[item.versions.length - 1];
                    const hasBeforeAfter = item.versions.length > 1;

                    return (
                      <div 
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-400 transition-all flex flex-col justify-between shadow-sm"
                      >
                        <div>
                          {/* Meta Header with Simple Star */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60">
                                #{item.departmentTag}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                                v{item.currentVersion}
                              </span>
                            </div>

                            {/* Minimalist Star Rating */}
                            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                              <Star size={11} className="text-[#C9A23E] fill-[#C9A23E]" />
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
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 text-xs font-mono text-slate-700 line-clamp-3">
                            {latest.promptText}
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {hasBeforeAfter && (
                              <button
                                onClick={() => setComparingPrompt(item)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                              >
                                <TrendingUp size={11} className="text-slate-600" />
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
                            <button
                              onClick={() => handleOpenReview(item)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs flex items-center gap-1 transition-colors"
                              title="Beri Nilai & Evaluasi Fasilitator"
                            >
                              <Award size={11} className="text-[#C9A23E]" />
                              Review Fasilitator
                            </button>
                          </div>

                          <button
                            onClick={() => handleCopy(latest.promptText, item.id)}
                            className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                              copiedId === item.id
                                ? 'bg-slate-800 text-[#E5C158]'
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
              )}

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
                    <label className="block text-xs font-bold text-slate-700 mb-1"><span className="font-mono font-bold text-slate-800">A -</span> Actor & Audience (Peran & Sasaran)</label>
                    <textarea
                      rows={2}
                      placeholder="Bertindaklah sebagai Senior Procurement Manager. Audiens adalah Direktur Vendor..."
                      value={actionData.a}
                      onChange={(e) => setActionData({ ...actionData, a: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1"><span className="font-mono font-bold text-slate-800">C -</span> Context & Conditions (Situasi Bisnis)</label>
                    <textarea
                      rows={2}
                      placeholder="Kemitraan berjalan 2 tahun. Ada pemotongan budget 15% dari direksi..."
                      value={actionData.c}
                      onChange={(e) => setActionData({ ...actionData, c: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1"><span className="font-mono font-bold text-slate-800">T -</span> Target & Task (Tugas yang Dihasilkan)</label>
                    <textarea
                      rows={2}
                      placeholder="Susun email negosiasi perpanjangan kontrak dengan opsi trade-off..."
                      value={actionData.t}
                      onChange={(e) => setActionData({ ...actionData, t: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  {builderType === 'ACTIONS' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1"><span className="font-mono font-bold text-slate-800">I -</span> Intention & Impact (Dampak Psikologis / Bisnis)</label>
                        <textarea
                          rows={2}
                          placeholder="Membangun kemitraan jangka panjang win-win..."
                          value={actionData.i}
                          onChange={(e) => setActionData({ ...actionData, i: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1"><span className="font-mono font-bold text-slate-800">O -</span> Output & Organization (Format Minto / Struktur)</label>
                        <textarea
                          rows={2}
                          placeholder="Format Minto Pyramid (SCQA). Maksimal 4 paragraf lugas..."
                          value={actionData.o}
                          onChange={(e) => setActionData({ ...actionData, o: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1"><span className="font-mono font-bold text-slate-800">N -</span> Negatives (Pantangan & Batasan Halusinasi)</label>
                        <textarea
                          rows={2}
                          placeholder="DILARANG mengancam pemutusan kontrak sepihak..."
                          value={actionData.n}
                          onChange={(e) => setActionData({ ...actionData, n: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1"><span className="font-mono font-bold text-slate-800">S -</span> Steps (Urutan Logika AI)</label>
                        <textarea
                          rows={2}
                          placeholder="1. Beri apresiasi SLA, 2. Paparkan konteks, 3. Tawarkan opsi multi-year..."
                          value={actionData.s}
                          onChange={(e) => setActionData({ ...actionData, s: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
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
                    {copiedId === 'preview-builder' ? <Check size={12} className="text-slate-900" /> : <Copy size={12} />}
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
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-0.5">
                    Peer Learning
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">Prompt Community</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jelajahi dan adaptasi formula teruji dari rekan kerja ke dalam jurnal pribadi Anda.
                  </p>
                </div>
              </div>

              {/* Cards Grid / Empty State */}
              {journalPrompts.filter(p => p.isPublic).length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-xl mx-auto my-6 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3.5">
                    <Share2 size={22} className="text-slate-600" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Prompt Community Masih Kosong</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-md mx-auto">
                    Setiap prompt yang disimpan dan diatur publik akan muncul di sini agar dapat dipelajari, diadaptasi, serta direview oleh fasilitator.
                  </p>
                  <button
                    onClick={() => {
                      setIteratingPromptId(null);
                      setBuilderTitle('');
                      setActiveMenu('prompt-studio');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#141210] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Plus size={14} className="text-[#E5C158]" />
                    <span>Buat Prompt Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {journalPrompts.filter(p => p.isPublic).map(item => {
                    const latest = item.versions[item.versions.length - 1];
                    return (
                      <div 
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-400 transition-all flex flex-col justify-between shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60">
                                #{item.departmentTag}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                oleh: <strong className="text-slate-800">{item.authorName}</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                              <Star size={11} className="text-[#C9A23E] fill-[#C9A23E]" />
                              <span>{item.score.toFixed(1)}</span>
                            </div>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 text-xs font-mono text-slate-700 line-clamp-3">
                            {latest.promptText}
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => adoptToMyJournal(item)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                            >
                              <BookmarkCheck size={12} className="text-slate-600" />
                              Adaptasi ke Jurnal
                            </button>
                            <button
                              onClick={() => handleOpenReview(item)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs flex items-center gap-1 transition-colors"
                              title="Beri Nilai & Evaluasi Fasilitator"
                            >
                              <Award size={11} className="text-[#C9A23E]" />
                              Review Fasilitator
                            </button>
                          </div>

                          <button
                            onClick={() => handleCopy(latest.promptText, `comm-${item.id}`)}
                            className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                              copiedId === `comm-${item.id}`
                                ? 'bg-slate-800 text-[#E5C158]'
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
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: PROMPTING TECHNIQUES */}
          {/* ===================================================================== */}
          {activeMenu === 'techniques' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header & Sub-Navigation */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Framework &amp; Kurikulum Prompting
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Prompting Techniques</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kuasai 8 teknik fundamental, metode audit kritis The Brutal Method, dan Jeff Su Precision Framework.
                  </p>
                </div>

                {/* Sub-Tabs Pills */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start md:self-auto">
                  <button
                    onClick={() => setActiveTechniqueSubTab('foundational')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeTechniqueSubTab === 'foundational'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    8 Foundational Techniques
                  </button>
                  <button
                    onClick={() => setActiveTechniqueSubTab('brutal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeTechniqueSubTab === 'brutal'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    The Brutal Method
                  </button>
                  <button
                    onClick={() => setActiveTechniqueSubTab('jeffsu')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeTechniqueSubTab === 'jeffsu'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Jeff Su Framework
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 1: 8 FOUNDATIONAL TECHNIQUES */}
              {/* ------------------------------------------------------------- */}
              {activeTechniqueSubTab === 'foundational' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Menampilkan 8 teknik dasar pemrosesan instruksi AI</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Rujukan: Brij Kishore Pandey (@codewithbrij)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {techniquesData.map((tech, idx) => (
                      <div key={tech.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                              {tech.tag}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              0{idx + 1}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 mb-1">{tech.title}</h3>
                          <p className="text-xs text-slate-600 mb-3 leading-relaxed">{tech.desc}</p>
                          
                          {/* Visual Step Flow */}
                          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 mb-3">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                              Alur Penalaran Model (Reasoning Path):
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {tech.steps.map((s, i) => (
                                <React.Fragment key={i}>
                                  <span className="inline-flex items-center text-[10px] font-medium bg-white text-slate-700 px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
                                    {s}
                                  </span>
                                  {i < tech.steps.length - 1 && (
                                    <ArrowRight size={10} className="text-slate-400 shrink-0" />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>

                          {/* Example Prompt Box */}
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-mono text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {tech.example}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(tech.example, tech.id)}
                          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {copiedId === tech.id ? <Check size={12} className="text-slate-900" /> : <Copy size={12} />}
                          {copiedId === tech.id ? 'Formula Tersalin!' : 'Salin Contoh Formula'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 2: THE BRUTAL METHOD */}
              {/* ------------------------------------------------------------- */}
              {activeTechniqueSubTab === 'brutal' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* The Problem Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                      Latar Belakang
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1 mb-4">
                      {brutalMethodData.problem.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {brutalMethodData.problem.points.map((pt, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                          <h4 className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                            {i === 0 ? <Brain size={14} className="text-slate-600" /> : <AlertTriangle size={14} className="text-amber-600" />}
                            {pt.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{pt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* The 6-Step Brutal Framework */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="mb-4">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                        Metodologi Eksekusi
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-0.5">
                        The 6-Step Brutal Framework (Red Teaming AI)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        6 langkah praktis untuk mematikan keramahan artifisial dan memaksa AI menjadi penguji paling kejam terhadap dokumen kerja Anda.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {brutalMethodData.framework.map((step) => (
                        <div key={step.num} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                                {step.num}
                              </span>
                              <h4 className="font-bold text-xs text-slate-900">{step.title}</h4>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model Spectrum & Custom Instructions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Model Spectrum */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                        Karakteristik Model
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-0.5 mb-3">
                        The Model Spectrum: Tingkat Kesopanan Bawaan
                      </h3>

                      <div className="space-y-3">
                        {brutalMethodData.modelSpectrum.map((spec, i) => (
                          <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-xs text-slate-900">{spec.name}</h4>
                                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                  {spec.badge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{spec.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Instruction Box */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                          Bonus Permanen
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 mt-0.5 mb-1">
                          System-Level Custom Instruction
                        </h3>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                          {brutalMethodData.systemLevelBonus.desc}
                        </p>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-700 leading-relaxed italic mb-3">
                          "{brutalMethodData.systemLevelBonus.prompt}"
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(brutalMethodData.systemLevelBonus.prompt, 'sys-prompt')}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedId === 'sys-prompt' ? <Check size={12} className="text-slate-900" /> : <Copy size={12} />}
                        {copiedId === 'sys-prompt' ? 'Tersalin!' : 'Salin Instruksi Sistem'}
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 3: JEFF SU PRECISION FRAMEWORK */}
              {/* ------------------------------------------------------------- */}
              {activeTechniqueSubTab === 'jeffsu' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Templates */}
                  <div className="space-y-3">
                    <div className="px-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                        Bagian 1
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-0.5">
                        5 Precision Prompt Templates (Jeff Su)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Formula baku untuk optimasi instruksi, pembungkusan XML, pemicu deep reasoning, dan kontrol panjang keluaran.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jeffSuData.templates.map((tpl, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900">{tpl.title}</h4>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">Template #{i + 1}</span>
                            </div>
                            <p className="text-xs text-slate-600 mb-3 leading-relaxed">{tpl.desc}</p>
                            
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-mono text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                              {tpl.prompt}
                            </div>
                          </div>

                          <button
                            onClick={() => handleCopy(tpl.prompt, `jeff-tpl-${i}`)}
                            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {copiedId === `jeff-tpl-${i}` ? <Check size={12} className="text-slate-900" /> : <Copy size={12} />}
                            {copiedId === `jeff-tpl-${i}` ? 'Template Tersalin!' : 'Salin Template'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6 Building Blocks */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="mb-4">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                        Bagian 2
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-0.5">
                        6 Building Blocks of a Perfect Prompt
                      </h3>
                      <p className="text-xs text-slate-500">
                        Anatomi lengkap sebuah prompt kelas dunia menurut Jeff Su.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {jeffSuData.buildingBlocks.map((bb, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                          <h4 className="font-bold text-xs text-slate-900 mb-1">{bb.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{bb.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Practices & Common Mistakes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Best Practices */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                        Bagian 3
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5 mb-3">
                        5 ChatGPT / LLM Best Practices
                      </h3>
                      <div className="space-y-2.5">
                        {jeffSuData.bestPractices.map((bp, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <h4 className="font-bold text-xs text-slate-900 mb-0.5 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-slate-200 font-mono text-[9px] font-bold flex items-center justify-center text-slate-700">
                                {i + 1}
                              </span>
                              {bp.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed pl-5.5">{bp.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mistakes */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                        Bagian 4
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5 mb-3">
                        5 Kesalahan Umum Prompting
                      </h3>
                      <div className="space-y-2.5">
                        {jeffSuData.mistakes.map((mis, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <h4 className="font-bold text-xs text-slate-900 mb-0.5 flex items-center gap-1.5">
                              <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                              {mis.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed pl-4.5">{mis.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: READING & LEARNING */}
          {/* ===================================================================== */}
          {activeMenu === 'reading-learning' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header & Sub-Navigation */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Materi Day 1 &amp; Day 2
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Reading &amp; Smart Learning</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mode pembelajaran kognitif, strategi percepatan penyerapan konsep, dan ekstraksi intisari buku tebal.
                  </p>
                </div>

                {/* Sub-Tabs Pills */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start md:self-auto">
                  <button
                    onClick={() => setActiveLearningSubTab('smart')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeLearningSubTab === 'smart'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    5 Mode Kognitif
                  </button>
                  <button
                    onClick={() => setActiveLearningSubTab('faster')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeLearningSubTab === 'faster'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    10 Pola Belajar Cepat
                  </button>
                  <button
                    onClick={() => setActiveLearningSubTab('extract')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeLearningSubTab === 'extract'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    10 Ekstraksi Buku/Laporan
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 1: 5 MODE KOGNITIF */}
              {/* ------------------------------------------------------------- */}
              {activeLearningSubTab === 'smart' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="px-1 text-xs text-slate-500">
                    5 mode pembelajaran berbasis riset kognitif. Setiap mode memetakan teori pembelajaran ke dalam matriks kasus dan workflow nyata.
                  </div>

                  <div className="space-y-5">
                    {readingModesData.map(mode => (
                      <div key={mode.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 hover:border-slate-300 transition-all">
                        
                        {/* Mode Title & Tag */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center">
                              {mode.num}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base text-slate-900">{mode.title}</h3>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {mode.tag}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{mode.subtitle}</p>
                            </div>
                          </div>
                        </div>

                        {/* 3-Column Structured Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          
                          {/* Col 1: Teori Ilmiah */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Brain size={14} className="text-slate-700" />
                                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                                  Landasan Teori Ilmiah
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-slate-900">{mode.theory}</h4>
                              <span className="text-[10px] font-mono text-slate-500 block mb-2">
                                Penggagas: {mode.theorist}
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed">{mode.theoryDesc}</p>
                            </div>
                          </div>

                          {/* Col 2: Matriks Kasus & Dampak */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Target size={14} className="text-slate-700" />
                                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                                  Matriks Masalah &amp; Solusi
                                </span>
                              </div>
                              <div className="space-y-2 text-xs">
                                <div>
                                  <strong className="text-slate-800 block text-[10px] uppercase font-mono">Masalah:</strong>
                                  <p className="text-slate-600">{mode.problem}</p>
                                </div>
                                <div>
                                  <strong className="text-slate-800 block text-[10px] uppercase font-mono">Solusi:</strong>
                                  <p className="text-slate-600">{mode.solution}</p>
                                </div>
                                <div>
                                  <strong className="text-slate-800 block text-[10px] uppercase font-mono">Dampak Akhir:</strong>
                                  <p className="text-slate-700 font-medium">{mode.impact}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Taktik & Workflow */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Layers size={14} className="text-slate-700" />
                                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                                  Taktik &amp; Workflow 4 Langkah
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 font-medium mb-2.5 leading-relaxed">{mode.tactic}</p>
                              <div className="space-y-1">
                                {mode.workflow.map((step, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                                    <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Bottom: Prompt Box & Quick Win */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1 w-full bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs font-mono text-slate-700">
                            <span className="text-[10px] font-bold font-mono text-slate-400 block mb-1 uppercase tracking-wider flex items-center gap-1">
                              <MessageSquare size={11} /> Sample Prompt:
                            </span>
                            "{mode.samplePrompt}"
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1.5 rounded-lg max-w-xs">
                              <Zap size={12} className="text-amber-600 shrink-0" />
                              <span className="truncate"><strong>Quick Win:</strong> {mode.quickWin}</span>
                            </div>

                            <button
                              onClick={() => handleCopy(mode.samplePrompt, `mode-${mode.num}`)}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                            >
                              {copiedId === `mode-${mode.num}` ? <Check size={12} className="text-slate-900" /> : <Copy size={12} />}
                              {copiedId === `mode-${mode.num}` ? 'Prompt Tersalin!' : 'Salin Prompt Mode'}
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 2: 10 POLA BELAJAR CEPAT (MORITZ KREMB) */}
              {/* ------------------------------------------------------------- */}
              {activeLearningSubTab === 'faster' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>10 Prompt Templates untuk akselerasi penguasaan materi baru</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Rujukan: Moritz Kremb (@moritzkremb)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningData.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                              Pola 0{idx + 1}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.author}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
                          <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.desc}</p>
                          
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-mono text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                            {item.prompt}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(item.prompt, `learn-${idx}`)}
                          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {copiedId === `learn-${idx}` ? <Check size={12} className="text-slate-900" /> : <Copy size={12} />}
                          {copiedId === `learn-${idx}` ? 'Formula Tersalin!' : 'Salin Template'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 3: 10 EKSTRAKSI BUKU / LAPORAN */}
              {/* ------------------------------------------------------------- */}
              {activeLearningSubTab === 'extract' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>10 Strategi membedah intisari buku bisnis tebal, laporan tahunan, dan studi kasus</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Book &amp; Long-Form Analysis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractBooksData.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                              Strategi 0{idx + 1}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
                          <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.desc}</p>
                          
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-mono text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                            {item.prompt}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(item.prompt, `book-${idx}`)}
                          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {copiedId === `book-${idx}` ? <Check size={12} className="text-slate-900" /> : <Copy size={12} />}
                          {copiedId === `book-${idx}` ? 'Formula Tersalin!' : 'Salin Template'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: EXERCISE & PRACTICE LAB */}
          {/* ===================================================================== */}
          {activeMenu === 'exercise' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Interactive Practice
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Exercise &amp; Practice Lab</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latihan mandiri membedah kasus bisnis nyata dan menguji ketajaman formulasi prompt Anda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exercisesData.map(ex => (
                  <div key={ex.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                          #{ex.department}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mb-2">{ex.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{ex.scenario}</p>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 mb-3">
                        <span className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                          Contoh Prompt Awal (Ad-hoc):
                        </span>
                        <span className="italic font-mono text-slate-600">"{ex.poorPrompt}"</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveExercise(ex);
                        setShowExerciseSolution(false);
                      }}
                      className="w-full py-2 rounded-xl bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold transition-all"
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
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

            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f5f6f9]">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Versi 1 (Before)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{comparingPrompt.versions[0].date}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-500 mb-2">
                  Pola: {comparingPrompt.versions[0].frameworkUsed}
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed flex-1 border border-slate-200/60">
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
                  <div className="bg-white rounded-2xl border-2 border-slate-900 p-4 flex flex-col shadow-sm">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                        Versi {latest.version} (After)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{latest.date}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 mb-2">
                      Pola: {latest.frameworkUsed}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-900 whitespace-pre-line leading-relaxed flex-1 border border-slate-200/60">
                      {latest.promptText}
                    </div>
                    {latest.notes && (
                      <p className="text-[11px] text-slate-700 mt-2 font-medium bg-slate-100 p-2.5 rounded-xl border border-slate-200/60">
                        <strong>Perubahan Kunci:</strong> {latest.notes}
                      </p>
                    )}

                    {(latest.facilitatorScore || latest.facilitatorFeedback) && (
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                            <Award size={13} className="text-[#C9A23E]" /> Evaluasi Fasilitator AIF:
                          </span>
                          {latest.facilitatorScore && (
                            <span className="font-mono font-bold text-[#C9A23E] bg-white px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                              {latest.facilitatorScore.toFixed(1)} ★
                            </span>
                          )}
                        </div>
                        {latest.facilitatorFeedback && (
                          <p className="text-slate-700 text-[11px] leading-relaxed italic">
                            "{latest.facilitatorFeedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleOpenReview(comparingPrompt)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Award size={12} className="text-[#C9A23E]" />
                Beri / Edit Nilai Fasilitator
              </button>
              <button
                onClick={() => setComparingPrompt(null)}
                className="px-4 py-1.5 rounded-xl bg-[#141210] hover:bg-slate-800 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRAINER / FACILITATOR EVALUATION WORKBENCH */}
      {/* ========================================================================= */}
      {reviewingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-4 bg-[#141210] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#E5C158] uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={12} className="text-[#E5C158]" /> Mode Fasilitator / Trainer
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Evaluasi &amp; Penilaian Prompt Peserta
                </h3>
              </div>
              <button onClick={() => setReviewingPrompt(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveReview} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Target Prompt Info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{reviewingPrompt.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                    #{reviewingPrompt.departmentTag} • v{reviewingPrompt.currentVersion}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mb-2">
                  Penulis: <strong className="text-slate-800">{reviewingPrompt.authorName}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs font-mono text-slate-700 max-h-24 overflow-y-auto">
                  {reviewingPrompt.versions[reviewingPrompt.versions.length - 1].promptText}
                </div>
              </div>

              {/* Score Input (1.0 to 10.0) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Star size={13} className="text-[#C9A23E] fill-[#C9A23E]" /> Skor Fasilitator (Skala 1.0 - 10.0)
                  </label>
                  <span className="font-mono text-base font-black text-slate-900 px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[#C9A23E]">
                    {reviewScore.toFixed(1)} ★
                  </span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="10.0"
                  step="0.1"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(parseFloat(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>5.0 (Dasar)</span>
                  <span>7.5 (Kompeten)</span>
                  <span>9.0 (Mahir)</span>
                  <span>10.0 (Mastery)</span>
                </div>
              </div>

              {/* Quick Score Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { val: 8.5, label: "8.5 - Perlu Penajaman Output" },
                  { val: 9.0, label: "9.0 - Terstruktur Baik" },
                  { val: 9.5, label: "9.5 - Sangat Tajam & Leverage Jelas" },
                  { val: 9.8, label: "9.8 - Kualitas Benchmark" }
                ].map((chip) => (
                  <button
                    type="button"
                    key={chip.val}
                    onClick={() => setReviewScore(chip.val)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                      reviewScore === chip.val
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Qualitative Written Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Catatan Evaluasi Formatif Fasilitator:
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Berikan apresiasi dan catatan konstruktif (misal: 'Evolusi luar biasa. Penggunaan trade-off multi-year memberikan leverage nyata...')"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#C9A23E] leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Feedback ini akan otomatis tertera di kartu jurnal peserta dan pada modal Before vs After.
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingPrompt(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Check size={13} />
                  Simpan Nilai &amp; Feedback
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXERCISE LAB WORKBENCH */}
      {/* ========================================================================= */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
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
                <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Prompt Awal (Ad-hoc):
                </h4>
                <p className="text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  "{activeExercise.poorPrompt}"
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5">Panduan Kunci:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeExercise.hints.map((h, i) => (
                    <span key={i} className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              {showExerciseSolution ? (
                <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-slate-700" />
                    Solusi Benchmark Fasilitator AIF:
                  </h4>
                  <pre className="text-xs font-mono text-slate-100 bg-slate-900 p-3.5 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
                    {activeExercise.benchmarkSolution}
                  </pre>
                  <button
                    onClick={() => handleCopy(activeExercise.benchmarkSolution, 'ex-sol')}
                    className="px-3 py-1.5 rounded-lg bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold flex items-center gap-1"
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
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
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
