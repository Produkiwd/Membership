/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Copy, Check, X, ChevronLeft, ChevronRight, Loader2, 
  Sparkles, BookOpen, Library, ArrowRight, Layers, 
  Target, Shield, TrendingUp, Share2, 
  Plus, RefreshCw, Eye, Award, BookmarkCheck, 
  FileEdit, Menu, Home, CheckCircle2, SlidersHorizontal,
  Lightbulb, Brain, Compass, MessageSquare, Zap, AlertTriangle, Trash2
} from 'lucide-react';
export interface Prompt { id: string; title: string; description: string; content: string; category: string; }
import { EntranceLoading } from './EntranceLoading';

import { compilePrompt, diffWords, FORMULA_PARTS, groupJourneys, partsFor, type FormulaKey, type Framework, type JournalEntry, type PromptMaterial } from '../lib/promptJournal';
import { deleteJournalEntry, listJournal, saveJournalEntry } from '../lib/promptJournalApi';

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

// Exercise: ready-to-use prompts, same content as Prompt Database v2.0.
const exercisePromptsData: { title: string; desc: string; prompt: string }[] = [
  {
    "title": "Image Enhancement Prompt",
    "desc": "Enhance the portrait while strictly preserving the subject's identity.",
    "prompt": "Enhance the portrait while strictly preserving the subject's identity with accurate facial geometry. Do not change their expression or face shape. Only allow subtle feature cleanup without altering who they are. Keep the exact same background from the reference image. No replacements, no changes, no new objects.\n\nThe image must be recreated as if it was shot on a Sony A1, using an 85mm f1.4 lens, at f1.6, ISO 100, 1/200 shutter speed, cinematic shallow depth of field, perfect facial focus, and an editorial-neutral color profile.\n\nLighting must match the exact direction of the reference photo. Upgrade the lighting into a cinematic style: soft directional light, warm highlights, cool shadows. Maintain real skin texture [not plastic], and subtle film grain. Render in 4K resolution."
  },
  {
    "title": "Minimalist Infographic Prompt",
    "desc": "Create a high-end, minimalist corporate infographic layout.",
    "prompt": "Create a high-end, minimalist corporate infographic layout. Visual Style: Premium 3D isometric design, highly detailed, clean, and forward-thinking. \n\nRendered with Unreal Engine 5 and Octane Render aesthetics, cinematic lighting, soft shadows, and a subtle depth of field equivalent to a Sony A1 85mm lens. Color Palette: Clean White and Silver base, with strategic 3D elements highlighted in Yellow Mustard (#FCB528) and Maroon (#660000). Use Forest Green and Navy Blue only for minor secondary data nodes. \n\nLayout: Asymmetrical composition. Leave ample negative space (white space) on the top and left side for text insertion. Position the main 3D visual representation on the bottom right. Design Elements: Include layout placeholders indicating Montserrat for modern bold headings and Satoshi/Inter for body text. Include a sleek footer placeholder at the bottom reading 'Insight Web Academy, 2026'. Overall aesthetic: Maximum clarity, highly professional, and uncluttered."
  },
  {
    "title": "Flow Cinematic Director",
    "desc": "Sutradara Film Pemenang Penghargaan & Art Director Brand Mewah.",
    "prompt": "# SYSTEM INSTRUCTION: FLOW CINEMATIC DIRECTOR & ART DESIGNER\n\n## 1. ACTOR & AUDIENCE\n* **Actor (Peran AI):** Anda adalah duet elit yang terdiri dari **Sutradara Film Pemenang Penghargaan** dan **Art Director / Production Designer Brand Mewah**. Anda memiliki pemahaman mendalam tentang teori warna, psikologi visual, komposisi desain, serta aspek teknis sinematografi (jenis lensa, pencahayaan, gerakan kamera, dan kontinuitas adegan).\n* **Audience (Target Pembaca):** Prompt yang Anda hasilkan akan digunakan langsung oleh kreator konten, produser video, dan tim pemasaran pada generator gambar AI (seperti ImageFX/Nano Banana/Imagen 3) dan generator video AI (seperti Google Flow/Veo 3). Hasil akhir instruksi harus sangat taktis, siap salin-tempel (copy-pasteable), dan profesional.\n\n## 2. CONTEXT & CONDITIONS\n* **Latar Belakang Operasional:** Pengguna ingin membuat video AI berdurasi standar 8 detik menggunakan metode **Image-to-Video** pada **Google Flow**. Alur kerja ini membutuhkan tiga elemen krusial:\n  1. **Frame Awal (Initial Frame):** Gambar berkualitas tinggi sebagai titik awal video.\n  2. **Frame Akhir (End Frame):** Gambar berkualitas tinggi sebagai titik akhir video yang tetap konsisten secara aset, pencahayaan, dan subjek.\n  3. **Prompt Video (Motion Path):** Deskripsi gerakan kamera, pencahayaan, dan aksi fisik untuk menjembatani Frame Awal ke Frame Akhir selama 8 detik.\n* **Kondisi Brand & Gaya Bahasa:** Pengguna mungkin melampirkan berkas panduan merek (brand guidelines), dokumen Tone of Voice, palet warna HEX, atau contoh teks pemasaran. Anda **wajib** menganalisis berkas tersebut terlebih dahulu untuk mengekstrak elemen estetika merek (warna dominan, suasana emosional, batasan gaya visual) sebelum memformulasikan prompt.\n\n## 3. TARGET & TASK\nTugas utama Anda adalah menerjemahkan ide sederhana dari pengguna menjadi **3 buah prompt terpisah** yang sangat detail dan profesional:\n1. **[PROMPT 1] - FRAME AWAL (Initial Image Prompt):** Prompt pembuatan gambar diam untuk frame pembuka video.\n2. **[PROMPT 2] - FRAME AKHIR (End Image Prompt):** Prompt pembuatan gambar diam untuk frame penutup video, mempertahankan kontinuitas objek dan latar, namun menunjukkan perubahan posisi/waktu/kondisi setelah 8 detik.\n3. **[PROMPT 3] - PROMPT VIDEO GOOGLE FLOW (8-Second Motion):** Prompt video yang mendiktekan dinamika pergerakan kamera, pergeseran pencahayaan, kecepatan gerak subjek, dan fisika transisi yang menjembatani kedua frame tersebut.\n\n## 4. INTENTION & IMPACT\n* **Tujuan utama:** Menghilangkan proses tebak-tebakan (trial-and-error) dalam pembuatan video AI, memastikan konsistensi aset yang tinggi, serta menyelaraskan setiap klip video dengan identitas merek pengguna secara presisi.\n* **Dampak Visual:** Hasil video yang dihasilkan harus terasa premium, dramatis, memiliki kedalaman ruang (depth of field) yang indah, dan tampak seolah-olah diproduksi menggunakan kamera bioskop berbiaya tinggi (seperti ARRI Alexa LF atau RED V-Raptor).\n\n## 5. OUTPUT & ORGANIZATION\nSetiap respons dari Anda harus memiliki struktur organisasi dokumen sebagai berikut:\n---\n### 🎬 ANALISIS SENI & VISI SUTRADARA\n(Tuliskan analisis singkat 2-3 kalimat mengenai pendekatan visual yang Anda ambil berdasarkan brief pengguna dan dokumen brand yang terlampir. Jelaskan mengapa palet warna, jenis lensa, dan gaya pencahayaan ini dipilih).\n\n### 🖼️ [PROMPT 1] FRAME AWAL (Initial Frame - Image Generation)\n[Salin dan Tempel Prompt Gambar Awal di Sini]\n(Catatan Teknis untuk Desainer: Jelaskan secara singkat lensa, framing, dan pencahayaan yang digunakan).\n\n### 🖼️ [PROMPT 2] FRAME AKHIR (End Frame - Image Generation)\n[Salin dan Tempel Prompt Gambar Akhir di Sini]\n(Catatan Teknis Kontinuitas: Jelaskan apa yang berubah dari Frame Awal untuk menjaga konsistensi).\n\n### 🎥 [PROMPT 3] PROMPT VIDEO GOOGLE FLOW (8-Second Motion Path)\n[Salin dan Tempel Prompt Gerakan Video 8 Detik di Sini]\n(Catatan Sutradara: Jelaskan jenis pergerakan kamera dan durasi transisi).\n\n## 6. NEGATIVES & NON-NEGO (Pantangan Ketat)\n* **DILARANG Keras Menggunakan Kata Sifat Klise & Subjektif:** Jangan pernah menggunakan kata-kata seperti: beautiful, stunning, photorealistic, hyperrealistic, 4K, 8K, high quality, masterpiece, detailed. Kata-kata ini tidak dipahami dengan baik oleh AI model generasi gambar/video.\n* **Gunakan Istilah Teknis sebagai Gantinya:** Gunakan deskripsi fisik konkret, seperti: \"shot on ARRI Alexa LF, 35mm anamorphic lens, T1.8 aperture, cinematic color grading, natural volumetric dust motes, Rembrandt lighting, photorealistic textures of concrete and brushed steel, highly detailed micro-pores on skin.\"\n* **Jangan Melanggar Aturan Brand:** Jika dokumen merek menetapkan palet warna pastel, jangan pernah menghasilkan prompt dengan warna neon atau kontras tinggi yang gelap.\n* **Hindari Lompatan Gerakan yang Mustahil:** Perubahan dari Frame Awal ke Frame Akhir harus logis untuk diselesaikan dalam durasi 8 detik (misalnya, jika Frame Awal adalah mobil berhenti, Frame Akhir adalah mobil melaju kencang di jalan tol 100 meter di depan; jangan buat mobil tiba-tiba terbang ke luar angkasa).\n\n## 7. STEPS & SEQUENCING (Alur Proses Berpikir Anda)\nSaat pengguna memberikan ide atau melampirkan file, jalankan langkah kognitif berikut secara berurutan sebelum menulis jawaban:\n\n* **Langkah 1 (Analisis Berkas):** Ekstrak kata kunci estetika, warna dominan, batasan gaya visual, dan nilai emosional dari berkas panduan merek yang diunggah pengguna.\n* **Langkah 2 (Konseptualisasi Sutradara):** Tentukan sudut pandang kamera (framing seperti extreme close-up, medium wide, dll.), pilihan lensa (35mm anamorphic untuk sinematik lebar, 85mm untuk potret dramatis), dan jenis pencahayaan (golden hour, low-key lighting, chiaroscuro).\n* **Langkah 3 (Penyusunan Frame Awal):** Susun detail komposisi visual pembuka (subjek, latar belakang, atmosfer).\n* **Langkah 4 (Penyusunan Kontinuitas Frame Akhir):** Evaluasi apa yang terjadi setelah 8 detik. Ubah posisi subjek atau sudut kamera secara logis tanpa mengubah detail inti subjek dan lingkungan.\n* **Langkah 5 (Penyusunan Jembatan Gerak Video):** Deskripsikan gerakan kamera (slow push-in, tracking shot, pan right, crane down) serta interaksi fisik/cahaya selama rentang 8 detik tersebut.\n* **Langkah 6 (Filter Kualitas):** Lakukan sensor mandiri untuk memastikan tidak ada kata-kata terlarang (hyperrealistic, dsb.) yang lolos ke dalam prompt akhir."
  },
  {
    "title": "Cinematic Video Prompt Architect",
    "desc": "Film Director and AI Prompt Engineer specializing in generative AI video models.",
    "prompt": "[ACTOR & AUDIENCE]\nYou are the \"Cinematic Video Prompt Architect,\" a world-class Film Director and AI Prompt Engineer specializing in generative AI video models (e.g., Sora, Kling, Runway Gen-3, Luma). Your primary audience is the creator providing raw concepts and attached brand guideline files. Your ultimate audience is the AI video generation engine that requires hyper-precise, sequential, and technically sound English prompts. Your tone is sharp, analytical, collaborative, and strictly detail-oriented.\n\n[CONTEXT & CONDITIONS]\nAI video generators have strict technical limitations: they generate clips in specific durations (usually 5, 8, 10, or 15 seconds), they hallucinate if instructions are abstract, and they suffer from visual glitches if too much action is crammed into a single short clip. Furthermore, commercial videos must strictly adhere to brand guidelines (colors, typography, mood) provided via attached files.\n\n[TARGET & TASK]\nYour core task is to transform rough user ideas into production-ready, highly detailed English text-to-video prompts. You must act as a production consultant: analyze any attached files for brand compliance, establish the exact duration constraints, and extract missing visual details before assembling the final prompt.\n\n[INTENTION & IMPACT]\nThe goal is to bridge the gap between human imagination, strict brand guidelines, and AI technical limits. The impact is a flawless, brand-compliant, cinematic video prompt that maps realistic physics and actions perfectly to the chosen clip duration, eliminating wasted generations.\n\n[OUTPUT & ORGANIZATION]\nYou must strictly divide your response into two distinct phases:\n\nPhase 1: Assessment & Clarification (The Director's Cut): If the user provides a rough idea or an attached file, DO NOT generate the prompt yet. Ask 3-4 sharp questions focusing on:\n- Duration & Sequencing: \"Is this for a single clip (e.g., 5, 8, 10, or 15 seconds) or part of a larger sequence? How many clips total?\"\n- Missing Visuals: Clarify clothing, lighting, camera movement, or specific subject details.\n- Brand Alignment: Acknowledge the attached file and confirm how the brand elements (colors, logos, vibe) should manifest in the scene.\n\nPhase 2: Prompt Execution: Once the user answers, output the final prompt as a dense, continuous narrative paragraph (no bullet points) organized by the \"5 Structural Pillars\" (see Steps).\n\n[NEGATIVES & NON-NEGO]\n- DO NOT generate a prompt immediately upon receiving a vague idea. You must ask for the intended clip duration first.\n- DO NOT cram 15 seconds of action into a 5-second prompt constraint. Match the action density to the duration.\n- DO NOT ignore attached files. You must extract and apply brand color palettes, moods, and styling rules to the prompt.\n- DO NOT use abstract emotional verbs/adjectives (e.g., \"she feels happy\"). Translate them into physical actions (e.g., \"she smiles warmly with relaxed shoulders\").\n- DO NOT use bullet points or lists in the final Phase 2 prompt output. It must be a cohesive block of text.\n\n[STEPS & SEQUENCING]\nExecute this cognitive sequence for every interaction:\n- Analyze Input & Assets: Read the user's idea and scan any attached files for brand rules.\n- Verify Constraints: Identify if the clip duration and physical actions are defined. If not, trigger Phase 1.\n- Construct the 5 Pillars: Once all data is gathered, assemble the final English prompt using this exact structural flow:\n  - [REFERENCE, SUBJECT & BRAND]: Extreme physical description. If an image is provided, mandate: \"Character features and likeness strictly match the provided reference photo.\" Integrate brand colors/clothing explicitly.\n  - [ENVIRONMENT & ATMOSPHERE]: Spatial layout, weather, time of day, and background elements aligned with the brand mood.\n  - [CHRONOLOGY OF ACTION]: Sequential physical choreography tailored precisely to fit the designated duration (e.g., 8 seconds).\n  - [CAMERA DIRECTION]: Camera movement (e.g., smooth tracking, handheld), lens type (e.g., extreme macro, anamorphic), and depth of field.\n  - [LIGHTING & TECHNICAL AESTHETICS]: Lighting setup, color grading, and render specs (e.g., 4K, ultra-realistic, cinematic, realistic clothing physics, commercial advertisement aesthetic)."
  },
  {
    "title": "Gesture Puzzle HTML Game",
    "desc": "Write a complete HTML game using MediaPipe Hands and Tailwind CSS.",
    "prompt": "Act as an expert Front-end Engineer and Creative Technologist. Write a complete, single-file HTML game that uses Google MediaPipe Hands (via CDN) and Tailwind CSS (via CDN) to create a highly stable, premium, and fully responsive gesture-controlled calibration puzzle game.\nThe branding must be clean, modern, and generic (no specific company names, just generic terms like \"Gesture Calibration\" and \"Start Session\").\nTECHNICAL REQUIREMENTS & STACK\nLibraries & CDN:\nTailwind CSS: https://cdn.tailwindcss.com\nFonts: Google Fonts (Inter, Plus Jakarta Sans, JetBrains Mono)\nMediaPipe Hands & Camera Utils:\nhttps://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js\nhttps://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js\nhttps://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js\nhttps://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js\nDesign System & Aesthetics:\nBackground: Deep modern dark theme (#090D16).\nAccents: Emerald Green (#10B981) for Player 1, Royal Blue (#3B82F6) for Player 2.\nPremium UI/UX: Glassmorphism elements (backdrop-blur, semi-transparent borders), glowing button effects, smooth transitions.\nDynamic feedback: Visual pulses and neon glows for the hands skeleton and selected pieces.\nRobust Architecture & State Machine:\nStates:\n'MENU': Initial screen to select game mode and turn on the camera.\n'CALIBRATING': Calibration phase where players frame their face.\n'PLAYING': The puzzle-solving phase.\n'WIN': Overlay screen showing the solved picture, completion time, and replay button.\nModes:\nSingle Player (Augmented Mode)\nTwo Players (Competitive Sprint) - splits the screen vertically into Left (P1) and Right (P2).\nKey Algorithms & Implementation Details:\na. Hand Coordinate Mapping & Mirroring:\nThe webcam feed must be drawn mirrored (ctx.scale(-1, 1)) so movements feel natural.\nMediaPipe hand coordinates (0 to 1 range) must be mapped to the canvas scale and adjusted for mirroring:\nx = canvasWidth - (landmark.x * videoDrawWidth + videoDrawX)\nThe canvas must auto-resize dynamically with window resize, keeping aspect ratio.\nb. Relative Pinch Detection (Proportional to Hand Size):\nAvoid absolute pixel distance. Calculate the hand scale first: distance between wrist (landmark 0) and middle finger base (landmark 9).\nMeasure pinch distance: distance between thumb tip (landmark 4) and index tip (landmark 8).\nTrigger pinch if (pinchDistance / handScale) < 0.35.\nc. Capture & Grid Segmentation:\nIn 'CALIBRATING' phase, detect 2 hands. The bounding box is formed between Left Thumb tip and Right Index tip.\nWhen both hands perform a pinch simultaneously, capture the bounding box pixels via canvas memory.\nSplit the captured image into a 3x3 grid (9 pieces).\nShuffle the slots using the Fisher-Yates algorithm.\nd. Gameplay (Drag & Drop + Piece Swapping):\nPlayers drag pieces using a pinch gesture. The cursor is represented by a glowing circle between thumb and index tips.\nWhen a pinch starts, grab the piece in the current slot.\nWhen the pinch is released, snap the piece to the closest slot. If another piece is already there, swap their slots.\nWhen all pieces are in their original slots (id === currentSlot), trigger 'WIN'.\nWeb Security & Error Handling:\nModern browsers block webcam access on unsecure origins (file://). Include a user-friendly modal/alert if navigator.mediaDevices.getUserMedia is blocked, explaining that it needs a local server (like Live Server or localhost).\nCamera fallbacks: If ideal 720p constraints fail, fallback to a simple { video: true } constraint.\nProvide the complete code in a single HTML file. Make sure all CSS, JavaScript, and HTML elements are fully implemented without placeholders or truncated code. Keep it highly performant, bug-free, and clean."
  },
  {
    "title": "Exact Video Recreation Prompt",
    "desc": "Create a video that follows the provided frame exactly.",
    "prompt": "Create a video that follows the provided frame exactly, preserving the same visual style, layout, composition, colors, typography, and design details without any modifications. Maintain 100% visual consistency with the original image.\nAnimate the scene by following the natural visual flow from top to bottom. Use clean cinematic camera movements with smooth transitions, professional framing, and natural motion for every element. Ensure all objects, text, graphics, and visual components animate appropriately while remaining faithful to the original design.\nThe video must be clean and polished, with no additional elements, no redesigns, no visual alterations, and no audio. Keep all movements subtle, realistic, and visually cohesive, as if the original image has come to life."
  }
];

const EMPTY_FIELDS: Record<FormulaKey, string> = { a: '', c: '', t: '', i: '', o: '', n: '', s: '' };

const formatDate = (value: string) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// One prompt journey: every saved version of one person's prompt for one material.
type Topic = { id: string; title: string; desc: string; meta: string };

// Landing grid for a learning menu: pick one topic, then read only that topic.
function TopicGrid({ eyebrow, title, desc, topics, onPick }: { eyebrow: string; title: string; desc: string; topics: Topic[]; onPick: (id: string) => void }) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="px-1">
        <span className="text-xs font-mono font-semibold uppercase text-[#8B7340] tracking-wider">{eyebrow}</span>
        <h2 className="text-xl font-display font-bold text-slate-900 mt-1">{title}</h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">{desc}</p>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${topics.length === 4 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {topics.map((topic, i) => (
          <button
            key={topic.id}
            onClick={() => onPick(topic.id)}
            className="text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#D4A84B] transition-all group flex flex-col justify-between min-h-44"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-semibold text-[#8B7340]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{topic.meta}</span>
              </div>
              <h3 className="font-display font-bold text-base text-slate-900 mb-1.5">{topic.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{topic.desc}</p>
            </div>
            <span className="mt-5 text-sm font-semibold text-slate-800 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              Buka materi <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TopicBackBar({ backLabel, title, desc, onBack }: { backLabel: string; title: string; desc?: string; onBack: () => void }) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ChevronLeft size={16} /> {backLabel}
      </button>
      <div className="px-1">
        <h2 className="text-xl font-display font-bold text-slate-900">{title}</h2>
        {desc && <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">{desc}</p>}
      </div>
    </div>
  );
}

const TECHNIQUE_TOPICS: Topic[] = [
  { id: 'foundational', title: '8 Teknik Dasar', desc: 'Zero-Shot, Few-Shot, Chain-of-Thought, sampai ReAct. Setiap teknik dilengkapi alur dan contoh prompt.', meta: '8 teknik' },
  { id: 'brutal', title: 'The Brutal Method', desc: 'Cara meminta AI memberi kritik yang jujur dan tajam untuk dokumen bernilai tinggi.', meta: '6 langkah' },
  { id: 'jeffsu', title: 'Jeff Su Framework', desc: 'Template siap pakai, enam bagian prompt yang baik, dan kesalahan yang sering terjadi.', meta: '5 template' },
];

const LEARNING_TOPICS: Topic[] = [
  { id: 'smart', title: '5 Mode Kognitif', desc: 'Lima cara membaca dengan AI, dari menangkap inti materi sampai menemukan celah riset.', meta: '5 mode' },
  { id: 'faster', title: '10 Pola Belajar Cepat', desc: 'Prompt untuk memahami topik baru lebih cepat: analogi, kuis, simulasi, dan lainnya.', meta: '10 prompt' },
  { id: 'extract', title: '10 Ekstraksi Buku & Laporan', desc: 'Prompt untuk menarik pelajaran, kerangka, dan rencana aksi dari buku atau laporan tebal.', meta: '10 prompt' },
  { id: 'exercise', title: 'Exercise', desc: 'Prompt siap pakai untuk latihan praktis: foto, infografis, video, dan game HTML.', meta: '6 prompt' },
];

type JourneyCardProps = {
  versions: JournalEntry[];
  showAuthor?: boolean;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onCompare: (before: JournalEntry, after: JournalEntry) => void;
  onDelete?: (entry: JournalEntry) => void;
  onContinue?: (entry: JournalEntry) => void;
};

const JourneyCard: React.FC<JourneyCardProps> = ({ versions, showAuthor, copiedId, onCopy, onCompare, onDelete, onContinue }) => {
  const [expanded, setExpanded] = useState(!showAuthor);
  const latest = versions[versions.length - 1];
  const shown = expanded ? [...versions].reverse() : [latest];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-slate-900 truncate">{showAuthor ? latest.authorName : latest.materialTitle}</h3>
          <p className="text-xs text-slate-500">
            {showAuthor ? `${latest.materialTitle} · ` : ''}{versions.length} versi · terakhir {formatDate(latest.createdAt)}
          </p>
        </div>
        {onContinue && (
          <button
            onClick={() => onContinue(latest)}
            className="px-3 py-1.5 rounded-lg bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw size={11} /> Lanjutkan ke v{latest.version + 1}
          </button>
        )}
      </div>

      <ol className="divide-y divide-slate-100">
        {shown.map(entry => {
          const previous = versions.filter(item => item.version < entry.version).pop();
          return (
            <li key={entry.id} className="px-5 py-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-900 text-white">v{entry.version}</span>
                  <span className="text-xs text-slate-500">{formatDate(entry.createdAt)} · {entry.framework === 'ACTIONS' ? 'A.C.T.I.O.N.S.' : 'ACT'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {previous && (
                    <button
                      onClick={() => onCompare(previous, entry)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1"
                    >
                      <TrendingUp size={11} /> Bandingkan dengan v{previous.version}
                    </button>
                  )}
                  <button
                    onClick={() => onCopy(entry.promptText, entry.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1"
                  >
                    {copiedId === entry.id ? <Check size={11} /> : <Copy size={11} />}
                    {copiedId === entry.id ? 'Tersalin' : 'Salin'}
                  </button>
                  {onDelete && (
                    <button onClick={() => onDelete(entry)} className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title={`Hapus v${entry.version}`}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              {entry.notes && (
                <p className="text-xs text-slate-700 bg-amber-50/60 border-l-2 border-[#C9A23E] px-3 py-1.5 rounded-r-lg">{entry.notes}</p>
              )}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                {entry.promptText}
              </div>
            </li>
          );
        })}
      </ol>

      {versions.length > 1 && (
        <button
          onClick={() => setExpanded(value => !value)}
          className="w-full px-5 py-2 border-t border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {expanded ? 'Tampilkan versi terakhir saja' : `Lihat perjalanan lengkap (${versions.length} versi)`}
        </button>
      )}
    </div>
  );
};

function DiffText({ before, after }: { before: string; after: string }) {
  return (
    <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
      {diffWords(before, after).map((part, i) => (
        <span
          key={i}
          className={part.type === 'added' ? 'bg-emerald-100 text-emerald-900 rounded-sm' : part.type === 'removed' ? 'bg-rose-100 text-rose-800 line-through rounded-sm' : ''}
        >
          {part.text}
        </span>
      ))}
    </p>
  );
}

// Field-by-field comparison of two versions in one journey.
function CompareModal({ before, after, onClose }: { before: JournalEntry; after: JournalEntry; onClose: () => void }) {
  const parts = FORMULA_PARTS.filter(part => before.fields[part.key] || after.fields[part.key]);
  const changed = parts.filter(part => (before.fields[part.key] || '') !== (after.fields[part.key] || '')).length;
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 bg-[#141210] text-white flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-mono text-[#E5C158] uppercase tracking-wider">Perubahan v{before.version} → v{after.version}</span>
            <h3 className="text-sm font-bold truncate">{after.materialTitle}{after.isMine ? '' : ` · ${after.authorName}`}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white" aria-label="Tutup"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span><strong className="text-slate-900">{changed}</strong> dari {parts.length} kolom berubah</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" /> ditambahkan</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-100 border border-rose-300" /> dihapus</span>
          </div>
          {after.notes && (
            <div className="text-xs text-slate-700 bg-amber-50/60 border-l-2 border-[#C9A23E] px-3 py-2 rounded-r-lg">
              <strong>Catatan v{after.version}:</strong> {after.notes}
            </div>
          )}
          {parts.map(part => {
            const oldText = before.fields[part.key] || '';
            const newText = after.fields[part.key] || '';
            return (
              <div key={part.key} className={`rounded-xl border p-3 ${oldText === newText ? 'border-slate-200 bg-slate-50/60' : 'border-amber-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800"><span className="text-[#966A0E]">{part.letter}</span> · {part.label}</span>
                  <span className="text-[11px] font-mono text-slate-400">{oldText === newText ? 'tetap' : !oldText ? 'baru' : !newText ? 'dihapus' : 'diubah'}</span>
                </div>
                <DiffText before={oldText} after={newText} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App({ onBack, initialMenu = 'beranda', materials = [] }: { onBack?: () => void; initialMenu?: string; materials?: PromptMaterial[] }) {
  // Navigation State (WJG Style)
  // 'beranda' | 'my-journal' | 'prompt-studio' | 'batch' | 'techniques' | 'reading-learning' | 'vault'
  const [activeMenu, setActiveMenu] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const menus = ['prompt-studio', 'my-journal', 'batch', 'techniques', 'reading-learning', 'vault'];
      // Old links: Community now lives in Jurnal Batch, Exercise inside Reading & Smart Learning.
      const fromLink = (value: string | null) => value === 'community' ? 'batch' : value === 'exercise' ? 'reading-learning' : value;
      const hash = fromLink(window.location.hash.replace('#', ''));
      if (hash && menus.includes(hash)) return hash;
      const tab = fromLink(new URLSearchParams(window.location.search).get('tab'));
      if (tab && menus.includes(tab)) return tab;
    }
    return initialMenu === 'exercise' ? 'reading-learning' : initialMenu || 'beranda';
  });

  useEffect(() => {
    if (initialMenu === 'exercise') {
      setActiveMenu('reading-learning');
      setActiveLearningSubTab('exercise');
    } else if (initialMenu && initialMenu !== 'beranda') {
      setActiveMenu(initialMenu);
    }
  }, [initialMenu]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Prompt Journal (Supabase): own entries plus batchmates' entries
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [journalStatus, setJournalStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [journalError, setJournalError] = useState('');
  const [selectedMaterialKey, setSelectedMaterialKey] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [compareTarget, setCompareTarget] = useState<{ before: JournalEntry; after: JournalEntry } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadJournal = React.useCallback(async () => {
    setJournalStatus('loading');
    setJournalError('');
    try {
      setEntries(await listJournal());
      setJournalStatus('ready');
    } catch (error) {
      setJournalError(error instanceof Error ? error.message : 'Jurnal belum dapat dimuat.');
      setJournalStatus('error');
    }
  }, []);

  useEffect(() => { loadJournal(); }, [loadJournal]);

  // Sub-Navigation Tabs
  const [activeTechniqueSubTab, setActiveTechniqueSubTab] = useState<string | null>(null);
  const [activeLearningSubTab, setActiveLearningSubTab] = useState<string | null>(() => {
    if (typeof window === 'undefined') return initialMenu === 'exercise' ? 'exercise' : null;
    const fromUrl = window.location.hash.replace('#', '') || new URLSearchParams(window.location.search).get('tab');
    return fromUrl === 'exercise' || initialMenu === 'exercise' ? 'exercise' : null;
  });
  const [activeModeId, setActiveModeId] = useState<number | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (compareTarget) setCompareTarget(null);
        if (entryToDelete && !isDeleting) setEntryToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [compareTarget, entryToDelete, isDeleting]);

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteJournalEntry(entryToDelete.id);
      setEntries(prev => prev.filter(item => item.id !== entryToDelete.id));
      setEntryToDelete(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Entri belum dapat dihapus.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Builder Form State
  const [builderMaterialKey, setBuilderMaterialKey] = useState('');
  const [builderType, setBuilderType] = useState<Framework>('ACTIONS');
  const [builderNotes, setBuilderNotes] = useState('');
  const [actionData, setActionData] = useState<Record<FormulaKey, string>>(EMPTY_FIELDS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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

  // Materials offered in filters: current Prompt materials plus any older title still present in saved entries.
  const materialOptions: PromptMaterial[] = React.useMemo(() => {
    const titles = new Map(materials.map(item => [item.key, item.title]));
    entries.forEach(entry => { if (!titles.has(entry.materialKey)) titles.set(entry.materialKey, entry.materialTitle); });
    return [...titles].map(([key, title]) => ({ key, title }));
  }, [materials, entries]);

  const myEntries = entries.filter(entry => entry.isMine);
  const matchesMaterial = (entry: JournalEntry) => !selectedMaterialKey || entry.materialKey === selectedMaterialKey;
  const myJourneys = groupJourneys(myEntries.filter(matchesMaterial));
  const peerJourneys = groupJourneys(entries.filter(entry => !entry.isMine && matchesMaterial(entry)));
  const myBatch = myEntries.find(entry => entry.batch)?.batch || entries.find(entry => entry.batch)?.batch || null;

  const builderMaterial = materials.find(item => item.key === builderMaterialKey) || null;
  const builderHistory = myEntries.filter(entry => entry.materialKey === builderMaterialKey).sort((a, b) => a.version - b.version);
  const builderLatest = builderHistory[builderHistory.length - 1] || null;
  const compiledPreview = compilePrompt(actionData, builderType);
  const builderIsEmpty = compiledPreview === '';

  const resetBuilder = (materialKey = '') => {
    setBuilderMaterialKey(materialKey);
    setBuilderType('ACTIONS');
    setBuilderNotes('');
    setActionData(EMPTY_FIELDS);
    setSaveError('');
  };

  const loadEntryIntoBuilder = (entry: JournalEntry) => {
    setBuilderType(entry.framework);
    setActionData({ ...EMPTY_FIELDS, ...entry.fields });
    setBuilderNotes('');
    setSaveError('');
  };

  // Continue a journey: open the studio with the latest version, ready to be improved.
  const startNextVersion = (entry: JournalEntry) => {
    setBuilderMaterialKey(entry.materialKey);
    loadEntryIntoBuilder(entry);
    setActiveMenu('prompt-studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNewFormula = () => {
    resetBuilder(selectedMaterialKey && materials.some(item => item.key === selectedMaterialKey) ? selectedMaterialKey : '');
    handleNavigate('prompt-studio');
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderMaterial) { setSaveError('Pilih materi terlebih dahulu.'); return; }
    if (builderIsEmpty) { setSaveError('Isi minimal satu kolom formula.'); return; }
    setIsSaving(true);
    setSaveError('');
    try {
      const saved = await saveJournalEntry({ material: builderMaterial, framework: builderType, fields: actionData, notes: builderNotes });
      setEntries(prev => [...prev, saved]);
      resetBuilder();
      setSelectedMaterialKey(saved.materialKey);
      setActiveMenu('my-journal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Prompt belum dapat disimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Safe navigation that automatically resets modal states so they never get stuck
  const handleNavigate = (menu: string) => {
    setCompareTarget(null);
    setEntryToDelete(null);
    setActiveTechniqueSubTab(null);
    setActiveLearningSubTab(null);
    setActiveModeId(null);
    setActiveMenu(menu);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openExercise = () => {
    handleNavigate('reading-learning');
    setActiveLearningSubTab('exercise');
  };

  const materialFilter = (
    <select
      value={selectedMaterialKey}
      onChange={(e) => setSelectedMaterialKey(e.target.value)}
      className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#C9A23E]"
      aria-label="Filter materi"
    >
      <option value="">Semua materi</option>
      {materialOptions.map(item => <option key={item.key} value={item.key}>{item.title}</option>)}
    </select>
  );

  const journalStatusView = journalStatus === 'loading' ? (
    <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
      <Loader2 size={20} className="animate-spin text-[#C9A23E] mx-auto mb-2" />
      <span className="text-xs text-slate-500">Memuat jurnal...</span>
    </div>
  ) : journalStatus === 'error' ? (
    <div className="p-6 text-center bg-white rounded-2xl border border-rose-200 space-y-3">
      <p className="text-xs text-rose-700">{journalError}</p>
      <button onClick={loadJournal} className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold">Coba lagi</button>
    </div>
  ) : null;

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
    <div className="prompt-studio min-h-screen bg-[#f5f6f9] text-slate-900 flex font-sans antialiased selection:bg-[#E5C158] selection:text-slate-950">
      
      {/* Entrance Loading Motion */}
      {isInitialLoading && (
        <EntranceLoading onComplete={() => setIsInitialLoading(false)} />
      )}
      
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
          <div className="px-3 pb-2 text-[11px] font-mono font-bold tracking-[2px] text-slate-400 uppercase">
            Menu Utama
          </div>

          <button
            onClick={() => handleNavigate('beranda')}
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
            onClick={() => handleNavigate('my-journal')}
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
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${activeMenu === 'my-journal' ? 'bg-black/20 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
              {myEntries.length}
            </span>
          </button>

          <button
            onClick={() => handleNavigate('prompt-studio')}
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
            onClick={() => handleNavigate('batch')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'batch'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Share2 size={15} />
            <span>Jurnal Batch</span>
          </button>

          <button
            onClick={() => handleNavigate('techniques')}
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
            onClick={() => handleNavigate('reading-learning')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMenu === 'reading-learning'
                ? 'bg-[#E5C158] text-slate-950 shadow-md shadow-[#E5C158]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={15} />
            <span>Reading & Smart Learning</span>
          </button>

          <div className="pt-3 border-t border-[#24201C]/60 my-2">
            <button
              onClick={() => handleNavigate('vault')}
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
            <div className="w-7 h-7 rounded-lg bg-[#E5C158]/10 border border-[#E5C158]/30 flex items-center justify-center text-[11px] font-mono font-bold text-[#E5C158]">
              PS
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">Prompt Studio</span>
              <span className="text-[11px] text-slate-400 truncate">Ruang Latihan Mandiri</span>
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
              <span className="text-slate-400 uppercase">PROMPT STUDIO</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-800 uppercase">
                {activeMenu === 'beranda' ? 'Beranda' : 
                 activeMenu === 'my-journal' ? 'My Prompt Journal' : 
                 activeMenu === 'prompt-studio' ? 'Prompt Formula Studio' : 
                 activeMenu === 'batch' ? 'Jurnal Batch' : 
                 activeMenu === 'techniques' ? 'Prompting Techniques' : 
                 activeMenu === 'reading-learning' ? 'Reading & Smart Learning' : 
                 'Basic Prompt Library (1.000+)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openNewFormula}
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
                  <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-[2px] text-[#E5C158] mb-2">
                    Ruang Latihan Prompt Enterprise
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-2.5">
                    Selamat datang di <span className="text-[#E5C158]">Prompt Studio.</span>
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                    Ruang latihan prompt Anda: pelajari teknik, uji di kasus nyata, dan simpan formula terbaik ke jurnal pribadi.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleNavigate('my-journal')}
                      className="px-4 py-2.5 rounded-xl bg-[#E5C158] hover:bg-[#F0CF6B] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      Buka Jurnal Saya <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={openNewFormula}
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
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                      PILIHAN MODUL
                    </span>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Pilih Kebutuhan Pembelajaran</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Box 1: My Prompt Journal */}
                  <div 
                    onClick={() => handleNavigate('my-journal')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          01
                        </span>
                        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          {myEntries.length} Versi
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        My Prompt Journal
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Semua versi prompt Anda per materi. Lihat apa yang berubah dari satu versi ke versi berikutnya.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Buka Jurnal Saya</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Box 2: Prompt Formula Studio */}
                  <div 
                    onClick={() => handleNavigate('prompt-studio')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          02
                        </span>
                        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          Formula Studio
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        Prompt Formula Studio
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Pilih materi, susun prompt dengan 7 kolom A.C.T.I.O.N.S. atau 3 kolom ACT, lalu simpan sebagai versi baru.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Buat Formula Baru</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Box 3: Prompt Community */}
                  <div 
                    onClick={() => handleNavigate('batch')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          03
                        </span>
                        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          {myBatch || 'Satu Batch'}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        Jurnal Batch
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Lihat prompt rekan satu batch untuk materi yang sama, lengkap dengan perjalanan versinya.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-auto group-hover:text-slate-950 group-hover:gap-2 transition-all">
                      <span>Buka Jurnal Batch</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Box 4: Prompting Techniques */}
                  <div 
                    onClick={() => handleNavigate('techniques')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          04
                        </span>
                        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
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
                    onClick={() => handleNavigate('reading-learning')}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          05
                        </span>
                        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
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

                  {/* Box 6: Exercise */}
                  <div 
                    onClick={openExercise}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                          06
                        </span>
                        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                          6 Prompt
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors mb-1.5">
                        Exercise
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Prompt siap pakai untuk latihan praktis: foto, infografis, video, dan game HTML.
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
                onClick={() => handleNavigate('vault')}
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
                    <p className="text-xs text-slate-500">
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
          {/* VIEW: MY PROMPT JOURNAL (JOURNEY PER MATERI) */}
          {/* ===================================================================== */}
          {activeMenu === 'my-journal' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">My Prompt Journal</h2>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                    Setiap kali Anda menyimpan prompt untuk satu materi, prompt itu menjadi versi baru. Bandingkan versinya untuk melihat apa yang berubah.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {materialFilter}
                  <button
                    onClick={openNewFormula}
                    className="px-3.5 py-2 rounded-xl bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus size={13} /> Tulis Prompt
                  </button>
                </div>
              </div>

              {journalStatusView || (myJourneys.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-xl mx-auto my-6 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3.5">
                    <BookmarkCheck size={22} className="text-slate-600" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    {selectedMaterialKey ? 'Belum ada prompt untuk materi ini' : 'Jurnal Anda masih kosong'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-md mx-auto">
                    Pilih materi, tulis prompt pertama Anda, lalu simpan. Setelah latihan berikutnya, perbaiki dan simpan lagi sebagai versi baru.
                  </p>
                  <button
                    onClick={openNewFormula}
                    className="px-4 py-2 rounded-xl bg-[#141210] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={14} className="text-[#E5C158]" />
                    <span>Tulis Prompt Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myJourneys.map(versions => (
                    <JourneyCard
                      key={versions[0].materialKey}
                      versions={versions}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      onCompare={(before, after) => setCompareTarget({ before, after })}
                      onDelete={setEntryToDelete}
                      onContinue={startNextVersion}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: PROMPT STUDIO (FORMULA BUILDER) */}
          {/* ===================================================================== */}
          {activeMenu === 'prompt-studio' && (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 animate-in fade-in duration-300">
              <div className="mb-5 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Prompt Formula Studio</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih materi, susun prompt dengan formula, lalu simpan ke jurnal.
                </p>
              </div>

              <form onSubmit={handleSavePrompt} className="space-y-4">
                <div>
                  <label htmlFor="builder-material" className="block text-xs font-bold text-slate-700 mb-1">Materi *</label>
                  <select
                    id="builder-material"
                    required
                    value={builderMaterialKey}
                    onChange={(e) => { setBuilderMaterialKey(e.target.value); setSaveError(''); }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#C9A23E]"
                  >
                    <option value="">Pilih materi Prompt...</option>
                    {materials.map(item => <option key={item.key} value={item.key}>{item.title}</option>)}
                  </select>
                  {builderMaterial && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                      <span>
                        Akan disimpan sebagai <strong className="text-slate-900">v{(builderLatest?.version || 0) + 1}</strong>
                        {builderLatest ? ` untuk ${builderMaterial.title}.` : `, prompt pertama Anda untuk ${builderMaterial.title}.`}
                      </span>
                      {builderLatest && (
                        <button type="button" onClick={() => loadEntryIntoBuilder(builderLatest)} className="font-bold text-[#966A0E] hover:underline">
                          Mulai dari v{builderLatest.version}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                  {(['ACTIONS', 'ACT'] as Framework[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBuilderType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${builderType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      {type === 'ACTIONS' ? 'A.C.T.I.O.N.S. (Lengkap)' : 'ACT (Cepat)'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 -mt-2">
                  ACT untuk tugas cepat dan sederhana. A.C.T.I.O.N.S. untuk dokumen penting yang hasilnya perlu presisi.
                </p>

                <div className="space-y-3">
                  {partsFor(builderType).map(part => (
                    <div key={part.key}>
                      <label htmlFor={`field-${part.key}`} className="block text-xs font-bold text-slate-800">
                        <span className="text-[#966A0E]">{part.letter} ·</span> {part.label}
                      </label>
                      <p id={`hint-${part.key}`} className="text-xs text-slate-500 mt-0.5 mb-1.5">{part.hint}</p>
                      <textarea
                        id={`field-${part.key}`}
                        aria-describedby={`hint-${part.key}`}
                        rows={2}
                        value={actionData[part.key]}
                        onChange={(e) => setActionData({ ...actionData, [part.key]: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="builder-notes" className="block text-xs font-bold text-slate-700 mb-1">
                    {builderLatest ? `Apa yang Anda ubah dari v${builderLatest.version}, dan mengapa?` : 'Catatan'} <span className="font-normal text-slate-400">(opsional)</span>
                  </label>
                  <textarea
                    id="builder-notes"
                    rows={2}
                    maxLength={2000}
                    value={builderNotes}
                    onChange={(e) => setBuilderNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </div>

                {saveError && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{saveError}</p>}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={builderIsEmpty}
                    onClick={() => handleCopy(compiledPreview, 'preview-builder')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {copiedId === 'preview-builder' ? <Check size={12} /> : <Copy size={12} />}
                    Salin Prompt
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-xl bg-[#141210] hover:bg-slate-800 text-[#E5C158] text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isSaving && <Loader2 size={12} className="animate-spin" />}
                    {builderLatest ? `Simpan sebagai v${builderLatest.version + 1}` : 'Simpan ke Jurnal'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: JURNAL BATCH (PROMPT REKAN SATU BATCH, PER MATERI) */}
          {/* ===================================================================== */}
          {activeMenu === 'batch' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-0.5">
                    {myBatch || 'Batch Anda'}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">Jurnal Batch</h2>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                    Lihat bagaimana rekan satu batch menyusun dan memperbaiki prompt mereka untuk materi yang sama.
                  </p>
                </div>
                {materialFilter}
              </div>

              {journalStatusView || (peerJourneys.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-xl mx-auto my-6 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3.5">
                    <Share2 size={22} className="text-slate-600" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Belum ada prompt dari rekan batch</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                    Prompt rekan satu batch akan muncul di sini setelah mereka menyimpannya.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {materialOptions.filter(item => peerJourneys.some(j => j[0].materialKey === item.key)).map(item => (
                    <section key={item.key} className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">{item.title}</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                        {peerJourneys.filter(j => j[0].materialKey === item.key).map(versions => (
                          <JourneyCard
                            key={`${versions[0].authorId}-${item.key}`}
                            versions={versions}
                            showAuthor
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            onCompare={(before, after) => setCompareTarget({ before, after })}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: PROMPTING TECHNIQUES */}
          {/* ===================================================================== */}
          {activeMenu === 'techniques' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {activeTechniqueSubTab === null ? (
                <TopicGrid
                  eyebrow="Materi & Teknik"
                  title="Prompting Techniques"
                  desc="Pilih satu topik untuk dipelajari."
                  topics={TECHNIQUE_TOPICS}
                  onPick={(id) => { setActiveTechniqueSubTab(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              ) : (
                <TopicBackBar
                  backLabel="Semua topik Prompting Techniques"
                  title={TECHNIQUE_TOPICS.find(t => t.id === activeTechniqueSubTab)?.title || ''}
                  desc={TECHNIQUE_TOPICS.find(t => t.id === activeTechniqueSubTab)?.desc}
                  onBack={() => setActiveTechniqueSubTab(null)}
                />
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 1: 8 FOUNDATIONAL TECHNIQUES */}
              {/* ------------------------------------------------------------- */}
              {activeTechniqueSubTab === 'foundational' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Menampilkan 8 teknik dasar pemrosesan instruksi AI</span>
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Rujukan: Brij Kishore Pandey (@codewithbrij)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {techniquesData.map((tech, idx) => (
                      <div key={tech.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                              {tech.tag}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400">
                              0{idx + 1}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 mb-1">{tech.title}</h3>
                          <p className="text-xs text-slate-600 mb-3 leading-relaxed">{tech.desc}</p>
                          
                          {/* Visual Step Flow */}
                          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 mb-3">
                            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                              Alur Penalaran Model (Reasoning Path):
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {tech.steps.map((s, i) => (
                                <React.Fragment key={i}>
                                  <span className="inline-flex items-center text-[11px] font-medium bg-white text-slate-700 px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
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
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-sans text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
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
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
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
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
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
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center">
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
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
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
                                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
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
                        <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                          Bonus Permanen
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 mt-0.5 mb-1">
                          System-Level Custom Instruction
                        </h3>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                          {brutalMethodData.systemLevelBonus.desc}
                        </p>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-sans text-xs text-slate-700 leading-relaxed italic mb-3">
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
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
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
                              <span className="text-[11px] font-mono text-slate-400 font-bold">Template #{i + 1}</span>
                            </div>
                            <p className="text-xs text-slate-600 mb-3 leading-relaxed">{tpl.desc}</p>
                            
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-sans text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
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
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
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
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                        Bagian 3
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5 mb-3">
                        5 ChatGPT / LLM Best Practices
                      </h3>
                      <div className="space-y-2.5">
                        {jeffSuData.bestPractices.map((bp, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <h4 className="font-bold text-xs text-slate-900 mb-0.5 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-slate-200 font-mono text-[11px] font-bold flex items-center justify-center text-slate-700">
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
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
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
              
              {activeLearningSubTab === null ? (
                <TopicGrid
                  eyebrow="Smart Learning"
                  title="Reading & Smart Learning"
                  desc="Pilih satu topik untuk dipelajari."
                  topics={LEARNING_TOPICS}
                  onPick={(id) => { setActiveLearningSubTab(id); setActiveModeId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              ) : activeLearningSubTab === 'smart' && activeModeId !== null ? (
                <TopicBackBar
                  backLabel="Semua 5 Mode Kognitif"
                  title={readingModesData.find(m => m.id === activeModeId)?.title || ''}
                  desc={readingModesData.find(m => m.id === activeModeId)?.subtitle}
                  onBack={() => setActiveModeId(null)}
                />
              ) : (
                <TopicBackBar
                  backLabel="Semua topik Reading & Smart Learning"
                  title={LEARNING_TOPICS.find(t => t.id === activeLearningSubTab)?.title || ''}
                  desc={LEARNING_TOPICS.find(t => t.id === activeLearningSubTab)?.desc}
                  onBack={() => setActiveLearningSubTab(null)}
                />
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 1: 5 MODE KOGNITIF */}
              {/* ------------------------------------------------------------- */}
              {activeLearningSubTab === 'smart' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {activeModeId === null && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {readingModesData.map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => { setActiveModeId(mode.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#D4A84B] transition-all group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-xs font-semibold text-[#8B7340]">{mode.num}</span>
                            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{mode.tag}</span>
                          </div>
                          <h3 className="font-display font-bold text-base text-slate-900 mb-1">{mode.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{mode.problem}</p>
                          <span className="mt-4 text-sm font-semibold text-slate-800 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                            Buka mode <ArrowRight size={14} />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-5">
                    {readingModesData.filter(mode => mode.id === activeModeId).map(mode => (
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
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
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
                                <span className="text-[11px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                                  Landasan Teori Ilmiah
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-slate-900">{mode.theory}</h4>
                              <span className="text-[11px] font-mono text-slate-500 block mb-2">
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
                                <span className="text-[11px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                                  Matriks Masalah &amp; Solusi
                                </span>
                              </div>
                              <div className="space-y-2 text-xs">
                                <div>
                                  <strong className="text-slate-800 block text-[11px] uppercase font-mono">Masalah:</strong>
                                  <p className="text-slate-600">{mode.problem}</p>
                                </div>
                                <div>
                                  <strong className="text-slate-800 block text-[11px] uppercase font-mono">Solusi:</strong>
                                  <p className="text-slate-600">{mode.solution}</p>
                                </div>
                                <div>
                                  <strong className="text-slate-800 block text-[11px] uppercase font-mono">Dampak Akhir:</strong>
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
                                <span className="text-[11px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                                  Taktik &amp; Workflow 4 Langkah
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 font-medium mb-2.5 leading-relaxed">{mode.tactic}</p>
                              <div className="space-y-1">
                                {mode.workflow.map((step, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1.5 text-xs text-slate-600">
                                    <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
                          <div className="flex-1 w-full bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs font-sans text-slate-700 leading-relaxed">
                            <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider flex items-center gap-1">
                              <MessageSquare size={11} /> Sample Prompt:
                            </span>
                            "{mode.samplePrompt}"
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <div className="hidden xl:flex items-center gap-1 text-xs text-slate-500 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1.5 rounded-lg max-w-xs">
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
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Rujukan: Moritz Kremb (@moritzkremb)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningData.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                              Pola 0{idx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {item.author}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
                          <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.desc}</p>
                          
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs font-sans text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
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
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Book &amp; Long-Form Analysis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractBooksData.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                              Strategi 0{idx + 1}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
                          <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.desc}</p>
                          
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs font-sans text-slate-700 mb-3 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
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

              {/* ------------------------------------------------------------- */}
              {/* SUBTAB 4: EXERCISE (PROMPT SIAP PAKAI) */}
              {/* ------------------------------------------------------------- */}
              {activeLearningSubTab === 'exercise' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-300">
                  {exercisePromptsData.map((item, idx) => (
                    <div key={item.title} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-[#8B7340]">{String(idx + 1).padStart(2, '0')}</span>
                        <h3 className="font-bold text-sm text-slate-900 mt-1 mb-1">{item.title}</h3>
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.desc}</p>
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700 mb-3 whitespace-pre-wrap break-words leading-relaxed max-h-64 overflow-y-auto">
                          {item.prompt}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(item.prompt, `exercise-${idx}`)}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedId === `exercise-${idx}` ? <Check size={12} className="text-slate-900" /> : <Copy size={12} />}
                        {copiedId === `exercise-${idx}` ? 'Prompt Tersalin!' : 'Salin Prompt'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase mb-1.5 inline-block">
                            {p.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">{p.title}</h4>
                          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{p.description}</p>
                          <div className="bg-slate-50 rounded-lg p-2.5 text-xs font-sans text-slate-700 leading-relaxed line-clamp-3 mb-2.5">
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
      {/* MODAL: PERBANDINGAN VERSI */}
      {/* ========================================================================= */}
      {compareTarget && (
        <CompareModal before={compareTarget.before} after={compareTarget.after} onClose={() => setCompareTarget(null)} />
      )}

      {/* ========================================================================= */}
      {/* MODAL: KONFIRMASI HAPUS VERSI */}
      {/* ========================================================================= */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-slate-900 leading-snug">Hapus versi ini?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Versi ini hilang permanen dari jurnal Anda dan dari Jurnal Batch. Versi lain tetap ada.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div className="font-bold text-slate-800">{entryToDelete.materialTitle} · v{entryToDelete.version}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEntryToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteEntry}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-60"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
