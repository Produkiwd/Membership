/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { Search, Copy, Check, X, ChevronLeft, ChevronRight, Lock, Loader2, Sparkles, Upload, FileText, MessageSquare, BookOpen, Lightbulb, PenTool, Rocket, Library, ArrowRight, Layers, Zap, Target, Brain, Shield, User, ListOrdered } from 'lucide-react';
export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
}
import { motion } from 'motion/react';

const techniquesData = [
  {
    title: "Zero-Shot Prompting",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Define Query Clearly", "Send Prompt to LLM", "LLM Interprets Prompt", "Generate Response based on Internal Knowledge", "Direct Output Returned"],
    desc: "Zero-shot prompting involves directly asking questions without providing explicit examples, relying purely on the model's learned knowledge."
  },
  {
    title: "One-Shot Prompting",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Prepare Query", "Include 1 Example Demonstrating Expected Output", "Send Prompt to LLM", "LLM Analyzes Provided Example", "Generates Contextually Similar Response", "Final Output Delivered"],
    desc: "One-shot prompting includes exactly one explicit example in the prompt, helping the model infer the desired response format or style."
  },
  {
    title: "Few-Shot Prompting",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Identify Query & Desired Response Style", "Provide Multiple Relevant Examples (2-5)", "Send Prompt & Examples to LLM", "LLM Recognizes Patterns from Examples", "Generates Response Following Established Pattern", "Final Contextualized Output Delivered"],
    desc: "Few-shot prompting involves providing a small set of examples to clearly demonstrate the desired response style or content type, improving accuracy and consistency."
  },
  {
    title: "Chain-of-Thought (CoT) Prompting",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Identify Complex Problem", 'Instruct LLM Explicitly ("Think step-by-step")', "Send Step-by-step Prompt", "LLM Performs Incremental Reasoning", "Provides Detailed Intermediate Steps", "Reaches Logical Conclusion", "Complete Answer Delivered"],
    desc: "Chain-of-thought prompting explicitly instructs the LLM to perform reasoning incrementally, greatly improving responses to complex queries."
  },
  {
    title: "Self-Consistency Prompting",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Clearly Define Query & Desired Reasoning", "Send Prompt to LLM (Multiple Generations)", "LLM Generates Multiple Reasoning Paths", "Evaluate Multiple Outputs for Consistency", "Select Most Consistent Answer", "Final Verified Answer Provided"],
    desc: "Self-consistency prompting involves generating multiple reasoning pathways, ensuring the output chosen is robust and accurate based on consensus."
  },
  {
    title: "Role-Based Prompting",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Choose Desired Role/Persona", "Craft Prompt Clearly Defining the Role", "Send Role-based Prompt to LLM", "LLM Adopts Specified Role", "Generates Response Aligned with Expertise", "Role-Specific Output Delivered"],
    desc: "Role-based prompting guides the model to adopt a specific persona, making the responses aligned closely with desired expertise or context."
  },
  {
    title: "Instruction Tuning (Task-specific)",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Identify Specific Task Requirements", "Prepare Detailed Task-specific Instructions", "Include Instructions Explicitly in Prompt", "Send Clearly Structured Prompt", "LLM Precisely Follows Provided Instructions", "Generates Task-specific Output", "Final Output Delivered"],
    desc: "Instruction tuning explicitly guides the model with structured instructions, ensuring precise outputs tailored to highly specific tasks."
  },
  {
    title: "ReAct (Reasoning + Action) Prompting",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Clearly State Query Requiring External Info", "Send Prompt with Action Permissions", "LLM Reasons to Identify Required Actions", "LLM Initiates Appropriate External Action", "Receives & Processes External Data", "Continues Reasoning with Context", "Final, Fully-informed Answer"],
    desc: "ReAct prompting integrates the LLM's reasoning with real-world external actions (e.g., database queries or API interactions), ensuring complete and accurate responses leveraging real-time external information."
  }
];

const advancedTechniquesData = [
  {
    title: "The Brutal Method (Honest Feedback)",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["Kill Memory (Incognito/Temp Chat)", "Select Honest Model / Critic Persona", "Use Third-Party Framing", "Ask Specific Risk Questions", "AI Jiu-Jitsu (Grade & Rewrite)"],
    desc: "Bypass kecenderungan AI melindungi ego Anda (politeness bias). Gunakan framing pihak ketiga, persona pengkritik (Red Team), atau paksa AI menilai dan mempertajam kritiknya sendiri hingga menjadi feedback yang kejam namun sangat solutif."
  },
  {
    title: "Jeff Su's Precision Framework",
    colorClass: "border-brand-gold",
    headerBgClass: "bg-brand-dark",
    steps: ["6 Building Blocks (Task, Context, Tone, dll)", "XML Sandwich (<task>, <context>)", "Universal Perfection Loop (10/10)", "Router Nudge ('Think hard')", "Verbosity Control"],
    desc: "Kumpulan teknik presisi tinggi: Pangkas ambiguitas dengan tag XML, perintah AI untuk iterasi mandiri ke skor 10/10 sebelum menjawab, kontrol panjang teks eksplisit, serta pancing deep reasoning dengan meta-prompt Optimizer."
  }
];

const jeffSuData = {
  templates: [
    {
      title: "Prompt Optimizer Meta-Prompt",
      desc: "Free alternative untuk Prompt Optimizer tool. Me-rewrite prompt awal menjadi lebih efektif.",
      prompt: "You are an expert prompt engineer specializing in creating prompts for AI language models, particularly [model]. Your task is to take my prompt and transform it into a well-crafted and effective prompt that will elicit optimal responses. Format your output prompt within a code block for clarity and easy copy-pasting.\n\n## Here's my initial prompt:\n[paste your prompt here]"
    },
    {
      title: "XML Sandwich Template",
      desc: "Meningkatkan presisi model dengan memisahkan komponen instruksi ke dalam tag XML.",
      prompt: "<context>\n[Berikan latar belakang, siapa kamu, situasi apa]\n</context>\n\n<task>\n[Jelaskan apa yang harus dilakukan AI]\n</task>\n\n<example>\n[Berikan contoh output yang diinginkan]\n</example>\n\n<tone>\nBe clear, precise, and use simple words.\nUse a friendly and conversational tone of voice.\n</tone>"
    },
    {
      title: "Universal Perfection Loop",
      desc: "Perintahkan AI untuk menilai pekerjaannya secara internal dan mengulanginya sampai sempurna.",
      prompt: "Before you respond, create an internal rubric for what defines a 'world-class' answer to my request. Then internally iterate on your work until it scores 10/10 against that rubric, and show me only the final, perfect output."
    },
    {
      title: "Router Nudge Phrases",
      desc: "Frasa tambahan di akhir prompt untuk memicu 'deep thinking indicator' pada LLM yang memiliki reasoning model (seperti GPT-5).",
      prompt: "Tambahkan salah satu:\n- Think hard about this.\n- Think deeply about this.\n- Think carefully."
    },
    {
      title: "Verbosity Control Phrases",
      desc: "Mengkontrol panjang output yang diinginkan dari model secara eksplisit.",
      prompt: "- Low Verbosity: Give me the bottom line in 100 words or less, use markdown for clarity and structure.\n- Medium Verbosity: Aim for a concise 3-5 paragraph explanation.\n- High Verbosity: Provide a comprehensive and detailed breakdown (600–800 words)."
    }
  ],
  buildingBlocks: [
    { title: "Task", desc: "Komponen paling krusial. Selalu mulai dengan action verb: generate, write, analyze, dll." },
    { title: "Context", desc: "Jawab 3 pertanyaan: background user, rupa success, dan environment." },
    { title: "Exemplars", desc: "Berikan contoh spesifik dari output yang diinginkan." },
    { title: "Persona", desc: "Definisikan siapa yang AI tiru (expert nyata / fiktif)." },
    { title: "Format", desc: "Visualisasikan bentuk output: tabel, email, markdown." },
    { title: "Tone", desc: "Tentukan nada suara: formal, casual, witting." }
  ],
  bestPractices: [
    { title: "Router Nudge Phrases", desc: "Gunakan untuk memaksa higher reasoning model berjalan." },
    { title: "Verbosity Control", desc: "Kontrol panjang konten karena model dapat kelebihan/kekurangan kata." },
    { title: "Prompt Optimizer Meta-Prompt", desc: "Gunakan AI untuk me-rewrite instruksi buatanmu." },
    { title: "XML Sandwich", desc: "Gunakan tag <TASK>, <CONTEXT> supaya model lebih presisi membaca instruksi." },
    { title: "Perfection Loop", desc: "Gunakan rubrik internal AI untuk menilai kualitas dirinya sampai 10/10." }
  ],
  mistakes: [
    { title: "1. Overly Specific Custom Instructions", desc: "Terlalu detail justru membatasi. Cantumkan intinya saja, preferensi, dan tone." },
    { title: "2. Tidak Memanfaatkan untuk Automasi", desc: "AI bisa membantu menulis kode atau automasi script tanpa kamu harus mengerti coding." },
    { title: "3. The First-try Fallacy", desc: "Jangan harapkan kesempurnaan langsung. Minta AI tanya clarifying question dulu." },
    { title: "4. The Summary-only Shortfall", desc: "Jangan sekadar merangkum. Minta actionable insights." },
    { title: "5. Prompt Overload Paradox", desc: "Fokus maksimalkan sedikit prompt terbaik daripada menyimpan ribuan prompt." }
  ]
};

const extractBooksData = [
  {
    title: "KEY TAKEAWAYS",
    colorClass: "bg-brand-dark",
    desc: "Business books often contain a lot of fluff. AI can help you filter out the noise and quickly extract the most important insights.",
    prompt: "\"Identify the top 5 actionable takeaways from [book title] and explain how each could be applied in a real-world business scenario.\""
  },
  {
    title: "CASE STUDIES",
    colorClass: "bg-brand-dark",
    desc: "Real-world case studies help bridge the gap between theory and practice. AI can help extract the most valuable lessons.",
    prompt: "\"Identify any case studies presented in [book title]. Summarize their key points and explain how they support the book's overall message.\""
  },
  {
    title: "BOOK COMPARISON",
    colorClass: "bg-brand-dark",
    desc: "Comparing books can reveal new insights. AI can help draw meaningful connections faster than you could on your own.",
    prompt: "\"Compare and contrast the key principles in [book title] with those in [another relevant book]. What are the similarities and differences? How do they complement or contradict each other?\""
  },
  {
    title: "EXPLAIN TO DIFFERENT AUDIENCES",
    colorClass: "bg-brand-dark",
    desc: "Explaining complex ideas at different levels of difficulty improves understanding.",
    prompt: "\"In [book title], the author discusses [concept]. Explain this concept as if you were teaching:\\na) A high school student\\nb) A seasoned CEO\\nc) A student considering a career in this field\\nHow does the explanation differ for each audience?\""
  },
  {
    title: "APPLY TO DIFFERENT BUSINESSES",
    colorClass: "bg-brand-dark",
    desc: "AI can help you reimagine how ideas might work in different business contexts.",
    prompt: "\"Imagine you're implementing the strategies from [book title] in:\\na) A tech startup\\nb) A family-owned restaurant\\nc) A large multinational corporation\\nWhat would be the specific challenges and opportunities in each scenario?\""
  },
  {
    title: "USE FRAMEWORKS",
    colorClass: "bg-brand-dark",
    desc: "Extract the frameworks discussed in a book and apply them to your own situation.",
    prompt: "\"In [book title], the author presents [specific framework or model]. Apply this framework to analyze:\\na) A recent business success story\\nb) A notable business failure\\nWhat insights does this analysis provide?\""
  },
  {
    title: "CREATE ACTION PLAN",
    colorClass: "bg-brand-dark",
    desc: "Turning theory into practice can be tough. AI can help break ideas into actionable steps, making implementation easier.",
    prompt: "\"Based on the principles outlined in [book title], create a hypothetical 30-day action plan for a business leader looking to implement these ideas.\""
  },
  {
    title: "POTENTIAL WEAKNESSES",
    colorClass: "bg-brand-dark",
    desc: "Truly understanding a concept means recognizing where it might fall or have limitations.",
    prompt: "\"What are the potential criticisms or limitations of the ideas presented in [book title]? How might these be addressed?\""
  },
  {
    title: "MAIN IDEA",
    colorClass: "bg-brand-dark",
    desc: "AI is great at summarizing a book's core message, helping you focus on the big picture.",
    prompt: "\"Summarize the main thesis of [book title] in one sentence, then expand on how this central idea is developed throughout the book.\""
  },
  {
    title: "ANALYZE QUOTES",
    colorClass: "bg-brand-dark",
    desc: "Memorable quotes help reinforce a book's key messages. AI can identify and analyze them.",
    prompt: "\"Extract 3-5 memorable quotes from [book title]. For each quote, explain its context, significance, and how it encapsulates a key lesson from the book.\""
  }
];

const learningData = [
  {
    title: "EXPLAIN LIKE I'M 5",
    colorClass: "bg-brand-dark",
    desc: "Break down tough ideas so even a kid could get it. Perfect for when you're totally lost on a topic.",
    prompt: "\"Explain [insert concept or topic] as if you were talking to a 5-year-old child. Use simple language and everyday examples.\""
  },
  {
    title: "EXAMPLES AND ANALOGIES",
    colorClass: "bg-brand-dark",
    desc: "Get real-world examples that make abstract ideas click.",
    prompt: "\"Explain [insert concept or topic] using three different real-world examples or analogies that would be easy for a beginner to understand.\""
  },
  {
    title: "MOTIVATION",
    colorClass: "bg-brand-dark",
    desc: "Get tips to keep yourself motivated about learning, even when it gets tough.",
    prompt: "\"I'm struggling to stay motivated while learning [insert subject or skill]. Provide me with 5 practical strategies to boost my motivation and maintain consistency in my studies.\""
  },
  {
    title: "ROLE-PLAY",
    colorClass: "bg-brand-dark",
    desc: "Act out scenarios to practice what you've learned.",
    prompt: "\"Let's role-play a scenario where I'm [insert role] and you're [insert another role]. We'll practice [insert skill or situation]. Begin the scenario, and I'll respond accordingly.\""
  },
  {
    title: "STUDY PLAN",
    colorClass: "bg-brand-dark",
    desc: "Map out your learning journey from start to finish. Great for tackling big subjects without getting overwhelmed.",
    prompt: "\"Create a detailed study plan for learning [insert subject or skill] over the course of [insert time frame]. Include specific goals, resources, and milestones.\""
  },
  {
    title: "QUIZ",
    colorClass: "bg-brand-dark",
    desc: "Create some practice questions to see if you've really got the hang of things.",
    prompt: "\"Generate a 10-question quiz on [insert topic], including a mix of multiple-choice, true/false, and short-answer questions. Provide answers and brief explanations for each question.\""
  },
  {
    title: "MINDMAP",
    colorClass: "bg-brand-dark",
    desc: "Sketch out your thoughts to see how everything connects. Really helpful when you're trying to wrap your head around a big topic.",
    prompt: "\"Create a detailed mind map for the topic [insert topic]. Include main branches, sub-branches, and key concepts or ideas for each.\""
  },
  {
    title: "EXPERT ROUNDTABLE",
    colorClass: "bg-brand-dark",
    desc: "Simulate a discussion between people who really know their stuff. Great for getting different views on tricky topics.",
    prompt: "\"Simulate a roundtable discussion with me and three experts in [insert field] discussing [insert topic or question]. Present their different viewpoints and any potential areas of agreement or disagreement.\""
  },
  {
    title: "MENTAL ASSOCIATIONS",
    colorClass: "bg-brand-dark",
    desc: "Come up with clever memory tricks to help stuff stick in your brain. Useful for remembering lists, facts, or tricky concepts.",
    prompt: "\"Help me create mental associations or mnemonic devices to remember key information about [insert topic or concept].\""
  },
  {
    title: "IMPROVE WHAT YOU HAVE",
    colorClass: "bg-brand-dark",
    desc: "Get feedback and suggestions to make your work even better. Great for polishing up something you've already created.",
    prompt: "\"Here's something I've [written/created/produced]: [insert your work]. Please provide specific suggestions to improve it, focusing on [aspect you want to improve, e.g., clarity, structure, persuasiveness]. Explain why each change would make it better.\""
  }
];

const readingModesData = [
  {
    id: 1,
    tag: "100 → 1",
    num: "01",
    title: "Get the Gist Instantly",
    subtitle: "Big Picture First",
    theory: "Cognitive Load Theory",
    theorist: "John Sweller",
    theoryDesc: "Kapasitas memori kerja manusia sangat terbatas. Pembelajaran efektif membutuhkan pengelolaan beban kognitif dengan meminimalisir gangguan (extraneous load) dan memaksimalkan skema pemahaman (germane load).",
    tactic: "Sebelum membaca teks mentah secara mendetail, gunakan AI untuk membuat Briefing Docs dan Study Guides otomatis. Ini memberikan peta struktural awal yang secara drastis mengurangi beban kognitif dan membebaskan pikiran Anda untuk menganalisis konsep.",
    samplePrompt: "What is the single most important concept that connects all of these materials? Explain in one paragraph.",
    problem: "Terlalu banyak materi, tidak tahu harus mulai dari mana.",
    solution: "Mengubah tumpukan konten menjadi satu pemahaman inti (core understanding) yang mudah dicerna.",
    impact: "Memahami gambaran besar dengan cepat, memberikan arah pembelajaran yang lebih terfokus.",
    workflow: [
      "Upload semua materi — slides, PDFs, artikel, transkrip",
      "Minta AI menemukan satu konsep pemersatu utamanya",
      "Simpan jawaban sebagai Catatan — ini menjadi peta belajar Anda",
      "Gunakan Audio Overview untuk mencerna materi dengan mendengarkan"
    ],
    quickWin: "Dalam 5 menit, dapatkan peta utuh tanpa harus membaca semuanya terlebih dahulu."
  },
  {
    id: 2,
    tag: "100 → 10",
    num: "02",
    title: "Create Structured Outlines",
    subtitle: "Organize & Chunk",
    theory: "Connectivism",
    theorist: "George Siemens",
    theoryDesc: "Di era digital, pembelajaran bukan sekadar konstruksi pengetahuan internal, melainkan tentang mengenali pola dan membangun koneksi antar informasi dari berbagai sumber lintas domain.",
    tactic: "Buat ruang belajar dengan berbagai materi acak. Minta AI bertindak sebagai mesin konektivis — memetakan hubungan antar domain dan merapikannya secara struktural dalam waktu singkat.",
    samplePrompt: "Act as a strategic advisor. Synthesize these sources to find three unexpected connections between [Concept A] and [Concept B]. Provide citations.",
    problem: "Informasi berhasil diserap namun tersebar dan tidak terorganisir.",
    solution: "Mengubah materi yang berserakan menjadi poin-poin terstruktur melalui proses chunking (pengelompokan).",
    impact: "Materi menjadi terorganisir rapi, mudah dipelajari, dan siap untuk dipresentasikan.",
    workflow: [
      "Gunakan materi yang sudah ada di dalam ruang kerja AI",
      "Minta AI menyusunnya menjadi 10 poin utama atau sebuah outline",
      "Simpan output yang terstruktur sebagai Catatan",
      "Buat Mind Map untuk memvisualisasikan koneksi antar konsep"
    ],
    quickWin: "Materi yang super berantakan menjadi outline super rapi dalam waktu kurang dari 10 menit."
  },
  {
    id: 3,
    tag: "0 → 1",
    num: "03",
    title: "Spark New Ideas",
    subtitle: "Beat the Blank Page",
    theory: "Constructivism",
    theorist: "Piaget & Vygotsky",
    theoryDesc: "Pembelajar secara aktif membangun (mengkonstruksi) pemahaman dengan mengalami berbagai hal dan merefleksikannya, membangun di atas skema kognitif yang telah ada.",
    tactic: "Gunakan Active Reading: tuliskan pemikiran, refleksi, atau hipotesis awal Anda pada kolom chat AI. Lalu minta AI untuk memeriksa interpretasi tersebut berdasarkan teks sumber aslinya.",
    samplePrompt: "Based on the text, is my interpretation here accurate? What evidence supports or contradicts my thought?",
    problem: "Kesulitan atau nge-blank (stuck) saat harus memulai proses kreatif dari layah putih.",
    solution: "Menjadikan AI sebagai partner brainstorming yang pandangannya tertambat pada dokumen yang kita tuju.",
    impact: "Mendapatkan banyak inspirasi dan ide segar serta pijakan awal yang tajam.",
    workflow: [
      "Upload satu dokumen utama sebagai jangkar (silabus, brief, artikel)",
      "Lakukan curah pendapat (brainstorming) ide/sudut pandang dengan AI",
      "Simpan ide-ide menarik sebagai Catatan Baru",
      "Kembangkan catatan tersebut menjadi outline melalui format FAQ"
    ],
    quickWin: "Dalam waktu 5 menit sesi brainstorming dengan AI, Anda akan menumpas 'blank page syndrome'."
  },
  {
    id: 4,
    tag: "100 → 100+",
    num: "04",
    title: "Deep Mastery",
    subtitle: "From Learner to Expert",
    theory: "Elaborative Interrogation",
    theorist: "Feynman Technique",
    theoryDesc: "Pembelajaran aktif melalui pertanyaan 'Mengapa?' dan 'Bagaimana?' mengintegrasikan fakta baru dengan pengetahuan dasar. Ini pergeseran dari membaca pasif menjadi menjelaskan secara aktif — pondasi menuuju ahli.",
    tactic: "Upload konsep/framework yang Anda miliki, lalu gunakan AI sebagai Socratic sparring partner (rekan debat). Minta AI untuk mengkritisi asumsi yang ada, dan paksa diri Anda untuk menjawab tantangan tersebut.",
    samplePrompt: "Review my uploaded framework. Ask me one deep, challenging question about the underlying assumptions of this model, and wait for my answer.",
    problem: "Pemahaman masih terasa berada di permukaan, sering luput menghadapi skenario di luar materi.",
    solution: "Memperdalam tingkat pemahaman hingga selevel pakar melalui pola Socratic dialog.",
    impact: "Mampu menjawab pertanyaan fundamental dengan sangat meyakinkan dan lebih percaya diri.",
    workflow: [
      "Pastikan seluruh materi suatu topik sudah berada di dalam sistem",
      "Minta AI mengajukan pertanyaan fundamental (pertanyaan 'why', 'what if')",
      "Simpan analogi dan jawaban krusial Anda menjadi Catatan pemahaman utuh",
      "Kembangkan menjadi Study Guide berserta kumpulan flashcard-nya"
    ],
    quickWin: "Dalam 3-4 pertanyaan pengujian kritis, temukan sisi gelap pemahaman yang tidak Anda sadari sebelumnya."
  },
  {
    id: 5,
    tag: "10 → 10+",
    num: "05",
    title: "Accelerate Your Research",
    subtitle: "Synthesize & Discover",
    theory: "Dual Coding Theory",
    theorist: "Allan Paivio",
    theoryDesc: "Manusia jauh lebih mudah memproses dan mengingat informasi jika disampaikan via dua saluran kognitif sekaligus secara berbarengan — visual/tekstual serta auditori.",
    tactic: "Hasilkan Audio Overview (ulasan audio) bagi dokumen kompleks Anda. Dengarkan perdebatan host AI terhadap nuansa-nuansa spesifik sambil Anda membaca sumber aslinya secara simultan.",
    samplePrompt: "What is the consensus across all these sources? What is still debated? Where is the research gap I could fill?",
    problem: "Kesulitan menyari atau mensintesis tumpukan sumber riset atau dokumen referensi yang begitu banyak.",
    solution: "Sintesis mendalam yang difasilitasi AI guna menemukan pola dan celah kosong penelitian (research gap).",
    impact: "Penemuan gagasan inovatif baru memandu percepatan penulisan atau riset yang substantif.",
    workflow: [
      "Upload jurnal riset, memo, dan berbagai ragam artikel pendukung",
      "Beri instruksi sintesis dan analisis literature gap pada materi rujukan tersebut",
      "Tandai ide hasil sintesa ini dan simpan rapat-rapat sebagai referensi",
      "Satukan dalam tinjauan riset literature menggunakan format Timeline"
    ],
    quickWin: "Buat pemetaan lanskap penelitian dalam waktu 15 menit, tugas yang biasanya menelan harian bahkan mingguan."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function PromptDatabaseView({ onBack }: { onBack?: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('appToken') === 'iwdemy123';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [authError, setAuthError] = useState('');
  const handleTokenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput === 'iwdemy123') {
      setIsAuthenticated(true);
      localStorage.setItem('appToken', 'iwdemy123');
      setAuthError('');
    } else {
      setAuthError('Invalid token. Please try again.');
    }
  };

  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // States for manual prompt
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    description: '',
    category: 'All',
    content: ''
  });

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string>('Home');
  const [activeTechniqueTab, setActiveTechniqueTab] = useState<string>('home');
  const [activeLearningTab, setActiveLearningTab] = useState<string>('home');
  const [actionType, setActionType] = useState<'ACT' | 'ACTIONS'>('ACTIONS');

  const techniqueCategories = [
    {
      id: "actions",
      title: "Framework A.C.T.I.O.N.S.",
      icon: <Sparkles className="w-8 h-8 text-brand-gold" />,
      description: "Strategi Prompting untuk Pemimpin Bisnis dalam Era AI. Fokus pada Budaya, Talenta, dan Manajemen Perubahan."
    },
    {
      id: "types",
      title: "Types of Prompting",
      icon: <Layers className="w-8 h-8 text-brand-gold" />,
      description: "Memahami pola instruksi yang berbeda (Zero-shot, Few-shot, CoT) untuk memaksimalkan logika dan efisiensi AI."
    },
    {
      id: "jeffsu",
      title: "Jeff Su's Precision Framework",
      icon: <Target className="w-8 h-8 text-brand-gold" />,
      description: "Kumpulan teknik presisi tinggi: XML Sandwich, Universal Perfection Loop, Router Nudge, dan Verbosity Control."
    },
    {
      id: "brutal",
      title: "The Brutal Method",
      icon: <Shield className="w-8 h-8 text-brand-gold" />,
      description: "Bypass politeness bias. Gunakan framing pihak ketiga atau persona pengkritik untuk feedback kejam nan solutif."
    }
  ];
  const [actionData, setActionData] = useState({
    a: '', c: '', t: '', i: '', o: '', n: '', s: ''
  });
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxZlGXkUirzRvMjFYUs5zYE-AZwfsOYDysWD-rwIgOMcraQPUZYkl6351KFwAVHwUbXsQ/exec');
      const textData = await response.text();
      try {
        const data = JSON.parse(textData);
        const mappedPrompts = data.map((item: any) => ({ 
          ...item, 
          id: String(item.id),
          category: item.new_category || item.category || 'Other'
        }));
        setPrompts(mappedPrompts);

        // Dynamically extract unique categories
        const catSet = new Set<string>();
        catSet.add('All');
        mappedPrompts.forEach((p: Prompt) => {
          if (p.category) catSet.add(p.category);
        });
        setDynamicCategories(Array.from(catSet));
      } catch (parseError) {
        console.error("Invalid response format, expected JSON. Result:", textData.substring(0, 100));
        throw new Error("Failed to fetch data from Google Script (invalid response format).");
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdminAuth(true);
      setShowAdminLogin(false);
      setShowAdminPanel(true);
      setAdminPassword('');
    } else {
      alert('Incorrect password!');
    }
  };

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert data to URLSearchParams for simple POST without CORS issues
    const formData = new URLSearchParams();
    formData.append('action', 'add');
    formData.append('title', newPrompt.title);
    formData.append('description', newPrompt.description);
    formData.append('category', newPrompt.category);
    formData.append('content', newPrompt.content);

    try {
      await fetch('https://script.google.com/macros/s/AKfycbxZlGXkUirzRvMjFYUs5zYE-AZwfsOYDysWD-rwIgOMcraQPUZYkl6351KFwAVHwUbXsQ/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
      
      // Reset form and refetch apps
      setNewPrompt({ title: '', description: '', category: 'All', content: '' });
      setShowAdminPanel(false);
      await fetchPrompts();
      alert('Prompt successfully added!');
    } catch (error) {
      console.error('Error add prompt', error);
      alert('Failed to add. Ensure your Google Apps Script accepts POST requests.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrompt = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    
    // We can do an optimistic updates
    setPrompts((prev) => prev.filter(p => p.id !== id));

    const formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('id', id);

    try {
      await fetch('https://script.google.com/macros/s/AKfycbxZlGXkUirzRvMjFYUs5zYE-AZwfsOYDysWD-rwIgOMcraQPUZYkl6351KFwAVHwUbXsQ/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
    } catch (error) {
      console.error('Error delete prompt', error);
      // Re-fetch on error to sync with truth
      await fetchPrompts();
    }
  };

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory = activeCategory === 'All' || prompt.category === activeCategory;
    const matchesSearch = 
      (prompt.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (prompt.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const generateActionPrompt = () => {
    let promptParts = [];
    if (actionType === 'ACT') {
      if (actionData.a) promptParts.push(actionData.a);
      if (actionData.c) promptParts.push(actionData.c);
      if (actionData.t) promptParts.push(actionData.t);
      if (!actionData.a && !actionData.c && !actionData.t) {
        promptParts = [
          '[A - Actor & Audience]\n[Masukkan Peran dan Target Audiens]',
          '[C - Context & Conditions]\n[Masukkan Latar Belakang dan Konteks]',
          '[T - Target & Task]\n[Masukkan Tugas Spesifik Anda]'
        ];
      }
    } else {
      if (actionData.a) promptParts.push(actionData.a);
      if (actionData.c) promptParts.push(actionData.c);
      if (actionData.t) promptParts.push(actionData.t);
      if (actionData.i) promptParts.push(actionData.i);
      if (actionData.o) promptParts.push(actionData.o);
      if (actionData.n) promptParts.push(actionData.n);
      if (actionData.s) promptParts.push(actionData.s);

      if (!actionData.a && !actionData.c && !actionData.t && !actionData.i && !actionData.o && !actionData.n && !actionData.s) {
        promptParts = [
          '[A - Actor & Audience]\nBertindaklah sebagai [Peran/Keahlian Anda]. Audiens Anda adalah [Target Audiens].',
          '[C - Context & Conditions]\nBerikut latar belakang yang perlu dipahami: [Jelaskan situasi bisnis spesifik, masalah, atau dinamika budaya saat ini].',
          '[T - Target & Task]\nTugas Anda adalah [Jelaskan dokumen/solusi apa yang harus dibuat oleh AI].',
          '[I - Intention & Impact]\nDampak psikologis atau bisnis yang ingin saya capai melalui tugas ini adalah [Jelaskan tujuan terdalam dan hasil perubahan perilaku yang diinginkan].',
          '[O - Output & Organization]\nFormat keluaran dalam bentuk [Sebutkan panjang, nada bahasa, struktur visual seperti tabel/poin].',
          '[N - Negatives & Non-negotiables]\nAnda DILARANG [Sebutkan pantangan, kata yang dihindari, asumsi yang salah, atau nada yang tidak pantas].',
          '[S - Steps & Sequencing]\nIkuti urutan pemikiran ini untuk menghasilkan solusi:\n1. [Langkah 1]\n2. [Langkah 2]\n3. [Langkah 3]'
        ];
      }
    }
    return promptParts.join('\n\n');
  };

  const mainMenus = [
    {
      id: "Prompting Techniques",
      title: "Prompting Techniques",
      icon: <MessageSquare className="w-8 h-8 text-brand-gold" />,
      description: "Kumpulan template dasar komunikasi dengan AI dari berbagai sumber terpercaya. Berisi Prompt ACT untuk tugas harian operasional dan Prompt ACTIONS untuk inisiatif strategis atau komunikasi krisis."
    },
    {
      id: "Reading and Learning",
      title: "Reading and Learning",
      icon: <BookOpen className="w-8 h-8 text-brand-gold" />,
      description: "5 mode pembelajaran berbasis riset kognitif: Get the Gist Instantly, Create Structured Outlines, Spark New Ideas, Deep Mastery, dan Accelerate Your Research."
    },
    {
      id: "Specialized Prompt Library",
      title: "Specialized Prompt Library",
      icon: <Library className="w-8 h-8 text-brand-gold" />,
      description: "Kumpulan 1000+ prompt teknis dan profesi spesifik yang diletakkan di urutan paling bawah agar peserta mengeksplorasi lebih jauh."
    }
  ];

  // Pagination config
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const displayedPrompts = filteredPrompts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
      alert("Your browser is blocking clipboard access. Please select and copy manually (Ctrl+C).");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center font-sans">
        <form onSubmit={handleTokenLogin} className="bg-brand-dark p-10 rounded-2xl shadow-2xl w-full max-w-md border border-[rgba(248,246,242,0.12)]">
          <div className="flex justify-center mb-10 gap-4">
             <img 
              src="https://drive.google.com/thumbnail?id=1sCKHvnvr5McsNdlNNsrPHaH3FGm9LE4Z&sz=w800" 
              alt="Tjitra & Associates" 
              className="h-9 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-sans text-text-lo-dark mx-1 mt-1 text-lg">|</span>
            <img 
              src="https://drive.google.com/thumbnail?id=1iCu_xg7KG8jwNbxZeNZAZaqbLi1Yv_fD&sz=w800" 
              alt="IWDemy" 
              className="h-8 object-contain mt-1"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-black text-white mb-3">Access Required</h2>
            <p className="text-text-lo-dark text-sm">Please enter the access token to continue.</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <input
                type="password"
                placeholder="Enter access token"
                className="w-full px-5 py-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(248,246,242,0.12)] rounded-xl focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white placeholder-text-lo-dark transition-all"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
              {authError && <p className="text-red-400 text-sm mt-3 font-medium text-center">{authError}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-brand-gold text-brand-dark py-4 rounded-xl font-bold font-display hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-gold flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              Unlock Access
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-brand-light flex flex-col font-sans text-text-md-light selection:bg-brand-gold selection:text-brand-dark transition-all duration-500">
        
        {/* Navbar - Sticky Top */}
      <nav className="w-full bg-brand-light/95 backdrop-blur-md border-b border-border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://drive.google.com/thumbnail?id=1sCKHvnvr5McsNdlNNsrPHaH3FGm9LE4Z&sz=w800" 
              alt="Tjitra & Associates" 
              className="h-6 sm:h-8 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-sans text-border-light mx-1 sm:mx-2 hidden sm:inline">|</span>
            <img 
              src="https://drive.google.com/thumbnail?id=1iCu_xg7KG8jwNbxZeNZAZaqbLi1Yv_fD&sz=w800" 
              alt="IWDemy" 
              className="h-5 sm:h-7 object-contain mt-1"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </nav>

      {/* Header - Dark Section */}
      <header className="bg-brand-dark pt-16 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-10 relative z-10">
          
          <div className="flex flex-col gap-5">
            {/* Eyebrow - Monospace */}
            <div className="inline-flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold text-brand-gold tracking-[3px] uppercase">
                COMMUNITY RESOURCES
              </span>
              <div className="h-[1px] w-[50px] bg-brand-gold opacity-30"></div>
            </div>

            {/* Headline - Plus Jakarta Sans */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-black tracking-[-1.5px] text-text-hi-dark leading-[1.12]">
              Prompts <span className="italic font-light text-brand-gold">Database.</span>
            </h1>
          </div>

          <div className="w-full md:w-full max-w-2xl mt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-text-lo-dark" />
              <input
                type="text"
                placeholder="Search prompt patterns..."
                className="w-full pl-14 pr-5 py-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(248,246,242,0.12)] rounded-xl focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-text-hi-dark placeholder-text-lo-dark font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area - Light Cream Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-12 md:py-16 flex flex-col z-20 layout-container">
        
        {/* Render Main Menus if we are on the Home Page */}
        {activeMenu === 'Home' ? (
          <div className="w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-text-hi-light tracking-tight mb-4">
                Pilih Modul Pembelajaran
              </h2>
              <p className="text-text-md-light text-lg">
                Jelajahi alur pembelajaran dari teknik dasar prompting hingga solusi operasional dan pendelegasian AI yang tingkat lanjut.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {mainMenus.map((menu, idx) => (
                <div 
                  key={menu.id}
                  onClick={() => {
                    setActiveMenu(menu.id);
                    setActiveCategory('All');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-border-subtle group hover:shadow-lg hover:border-brand-gold transition-all duration-300 cursor-pointer flex flex-col items-start text-left h-full"
                >
                  <div className="w-14 h-14 bg-bg-gold-subtle rounded-xl flex items-center justify-center mb-6 text-brand-gold-muted group-hover:scale-110 transition-transform duration-300">
                    {menu.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-text-hi-light mb-3 group-hover:text-brand-gold-muted transition-colors">
                    <span className="text-brand-gold mr-2">{idx + 1}.</span> {menu.title}
                  </h3>
                  <p className="font-sans text-sm text-text-md-light leading-relaxed mb-6 flex-1">
                    {menu.description}
                  </p>
                  <div className="flex items-center gap-2 font-display font-bold uppercase tracking-[1px] text-[11px] text-brand-gold group-hover:text-brand-dark transition-colors mt-auto">
                    Mulai Eksplorasi <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeMenu === 'Specialized Prompt Library' ? (
          <div className="w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Normal Content Listing for Specialized */}
            <div id="all-prompts-table" className="w-full flex flex-col md:flex-row gap-8 md:gap-16 transition-all duration-500">
              
              {/* Sidebar / Filters (Monospace Tracking) */}
              <aside className="w-full md:w-48 flex-shrink-0">
                <button 
                  onClick={() => setActiveMenu('Home')} 
                  className="flex items-center gap-2 text-text-md-light hover:text-brand-gold-muted font-medium mb-6 transition-colors"
                >
                  <ChevronLeft size={16} /> Kembali ke Menu
                </button>
                <p className="font-mono text-[10px] font-bold text-text-lo-light tracking-[3px] uppercase mb-4 pl-3">
                  Categories
                </p>
                <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 custom-scrollbar">
                  {dynamicCategories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-left px-4 py-2.5 rounded-lg font-medium text-[15px] transition-all whitespace-nowrap ${
                          isActive 
                            ? 'bg-bg-gold-subtle border border-border-gold text-brand-gold-muted font-bold' 
                            : 'border border-transparent text-text-lo-light hover:text-text-hi-light hover:bg-[rgba(0,0,0,0.02)]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Content Area - 2 Columns Desktop, Lots of Whitespace */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6 pl-1">
                  <h2 className="font-display text-xl font-bold text-text-hi-light">
                    {activeCategory === 'All' ? 'Semua Prompt' : `Kategori: ${activeCategory}`}
                  </h2>
                  <span className="font-mono text-xs font-medium text-text-md-light bg-[rgba(0,0,0,0.04)] px-3 py-1.5 rounded-full">
                    {filteredPrompts.length} prompts
                  </span>
                </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[16px] border border-border-subtle px-6">
              <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
              <h3 className="font-display text-xl font-bold text-text-hi-light tracking-[-0.3px]">Loading Database</h3>
              <p className="text-text-md-light mt-2 font-medium text-sm">Fetching data from Spreadsheet...</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[16px] border border-border-subtle px-6">
              <h3 className="font-display text-2xl font-bold text-text-hi-light tracking-[-0.5px]">No patterns found</h3>
              <p className="text-text-md-light mt-3 font-medium">Try using different keywords to continue.</p>
              <button 
                onClick={() => {setSearchTerm(''); setActiveCategory('All');}}
                className="mt-8 px-6 py-3 font-display font-extrabold uppercase tracking-[2px] text-[13px] bg-brand-gold text-brand-dark hover:bg-[#C2983E] transition-colors rounded-xl"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-min">
                {displayedPrompts.map((prompt) => (
                  <div 
                    key={prompt.id} 
                    onClick={() => setSelectedPrompt(prompt)}
                    className="bg-white rounded-xl p-5 shadow-sm border border-border-subtle flex flex-col group hover:shadow-md hover:border-brand-gold transition-all duration-300 cursor-pointer h-full"
                  >
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <span className="font-mono text-[10px] font-bold tracking-widest uppercase bg-bg-gold-subtle text-brand-gold-muted px-2.5 py-1 rounded">
                        {prompt.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {isAdminAuth && (
                          <button 
                            onClick={(e) => handleDeletePrompt(prompt.id, e)}
                            className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Delete Prompt"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleCopy(prompt.id, prompt.content); 
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            copiedId === prompt.id 
                              ? 'text-brand-gold bg-bg-gold-subtle' 
                              : 'text-text-lo-light hover:text-brand-dark hover:bg-black/5'
                          }`}
                          title="Copy prompt"
                        >
                         {copiedId === prompt.id ? <Check size={16}/> : <Copy size={16}/>}
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-display font-bold text-text-hi-light leading-tight group-hover:text-brand-gold-muted transition-colors mb-2 text-lg">
                      {prompt.title}
                    </h3>
                    
                    <p className="font-sans text-sm text-text-md-light line-clamp-3">
                      {prompt.description}
                    </p>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="p-2 sm:px-4 sm:py-2 flex items-center gap-1 sm:gap-2 text-[13px] font-display font-bold text-text-hi-light bg-white border border-border-subtle rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 hover:border-black/10 transition-all"
                  >
                    <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      
                      // Pagination abbreviation logic
                      if (totalPages > 7) {
                        if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                          if (page === 2 || page === totalPages - 1) {
                            return <span key={`ellipsis-${page}`} className="px-1 text-text-lo-light font-mono select-none">...</span>;
                          }
                          return null;
                        }
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl font-mono text-sm font-bold transition-all ${
                            page === currentPage
                              ? 'bg-brand-gold text-brand-dark shadow-sm'
                              : 'text-text-md-light hover:bg-[rgba(30,28,24,0.05)] hover:text-text-hi-light'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="p-2 sm:px-4 sm:py-2 flex items-center gap-1 sm:gap-2 text-[13px] font-display font-bold text-text-hi-light bg-white border border-border-subtle rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 hover:border-black/10 transition-all"
                  >
                    <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
        </div>
        ) : (
          <div className="w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setActiveMenu('Home')} 
              className="flex items-center gap-2 text-text-md-light hover:text-brand-gold-muted font-medium mb-8 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-border-subtle flex items-center justify-center group-hover:border-brand-gold group-hover:bg-bg-gold-subtle transition-all">
                <ChevronLeft size={16} />
              </div>
              Kembali ke Menu
            </button>
            
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-border-subtle shadow-sm flex flex-col md:flex-row gap-12 items-start text-left min-h-[400px]">
              <div className="w-20 h-20 rounded-2xl bg-bg-gold-subtle flex items-center justify-center flex-shrink-0 text-brand-gold-muted">
                {mainMenus.find(m => m.id === activeMenu)?.icon}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-[-1px] text-text-hi-light mb-6">
                  {activeMenu}
                </h2>
                
                <div className="prose prose-lg text-text-md-light marker:text-brand-gold-muted max-w-3xl font-sans w-full">
                  {activeMenu === 'Prompting Techniques' && (
                    <div className="w-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                      
                      {activeTechniqueTab === 'home' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          {techniqueCategories.map((tech, idx) => (
                            <div 
                              key={tech.id}
                              onClick={() => setActiveTechniqueTab(tech.id)}
                              className="bg-white rounded-2xl p-6 shadow-sm border border-border-subtle group hover:shadow-lg hover:border-brand-gold transition-all duration-300 cursor-pointer flex flex-col items-start text-left h-full"
                            >
                              <div className="w-12 h-12 bg-bg-gold-subtle rounded-xl flex items-center justify-center mb-4 text-brand-gold-muted group-hover:scale-110 transition-transform duration-300">
                                {tech.icon}
                              </div>
                              <h3 className="font-display text-lg font-bold text-text-hi-light mb-2 group-hover:text-brand-gold-muted transition-colors">
                                <span className="text-brand-gold mr-2">{idx + 1}.</span> {tech.title}
                              </h3>
                              <p className="font-sans text-sm text-text-md-light leading-relaxed flex-1">
                                {tech.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTechniqueTab !== 'home' && (
                        <button 
                          onClick={() => setActiveTechniqueTab('home')} 
                          className="flex items-center gap-2 text-text-md-light hover:text-brand-gold-muted font-medium mb-6 transition-colors"
                        >
                          <ChevronLeft size={16} /> Kembali ke Menu Kategori
                        </button>
                      )}

                      {activeTechniqueTab === 'actions' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="w-full mt-4 mb-4">
                            <h3 className="text-2xl font-display font-bold text-text-hi-light mb-3">Framework A.C.T.I.O.N.S.</h3>
                            <p className="text-text-md-light text-lg mb-8">Strategi Prompting untuk Pemimpin Bisnis dalam Era AI. Fokus pada Budaya, Talenta, dan Manajemen Perubahan.</p>
                          </div>

                          {/* EXPLANATION / THE 7 STEPS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12 w-full">
                        <div className="bg-white border-l-4 border-brand-gold p-5 rounded-r-xl shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-bg-gold-subtle text-brand-dark flex items-center justify-center font-bold">A</div>
                            <h4 className="font-bold text-text-hi-light text-sm">Actor & Audience</h4>
                          </div>
                          <p className="text-xs text-text-md-light leading-relaxed">Menentukan persona/peran AI dan siapa target pembaca akhir. Ini memastikan nada dan gaya bahasa selaras secara psikologis dengan penerima pesan.</p>
                        </div>
                        
                        <div className="bg-white border-l-4 border-brand-gold p-5 rounded-r-xl shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-bg-gold-subtle text-brand-dark flex items-center justify-center font-bold">C</div>
                            <h4 className="font-bold text-text-hi-light text-sm">Context & Conditions</h4>
                          </div>
                          <p className="text-xs text-text-md-light leading-relaxed">Latar belakang, dinamika budaya perusahaan saat ini, kendala, atau data mentah yang perlu dipahami oleh AI sebelum memformulasikan solusi.</p>
                        </div>

                        <div className="bg-white border-l-4 border-brand-gold p-5 rounded-r-xl shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-bg-gold-subtle text-brand-dark flex items-center justify-center font-bold">T</div>
                            <h4 className="font-bold text-text-hi-light text-sm">Target & Task</h4>
                          </div>
                          <p className="text-xs text-text-md-light leading-relaxed">Tujuan utama atau aksi spesifik yang harus dieksekusi (misalnya: merancang silabus, membuat matriks keputusan kompetensi, menulis skrip komunikasi).</p>
                        </div>

                        <div className="bg-white border-l-4 border-brand-gold p-5 rounded-r-xl shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-bg-gold-subtle text-brand-dark flex items-center justify-center font-bold">I</div>
                            <h4 className="font-bold text-text-hi-light text-sm">Intention & Impact</h4>
                          </div>
                          <p className="text-xs text-text-md-light leading-relaxed">Elemen pembeda paling krusial: "Mengapa" tugas ini dilakukan. Apa dampak bisnis dan perubahan perilaku yang ingin dicapai pada audiens?</p>
                        </div>

                        <div className="bg-white border-l-4 border-brand-gold p-5 rounded-r-xl shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-bg-gold-subtle text-brand-dark flex items-center justify-center font-bold">O</div>
                            <h4 className="font-bold text-text-hi-light text-sm">Output & Organization</h4>
                          </div>
                          <p className="text-xs text-text-md-light leading-relaxed">Spesifikasi eksak dari format, panjang dokumen, struktur (misal: tabel, poin-poin), dan contoh nada dari keluaran yang diharapkan.</p>
                        </div>

                        <div className="bg-white border-l-4 border-brand-gold p-5 rounded-r-xl shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-bg-gold-subtle text-brand-dark flex items-center justify-center font-bold">N</div>
                            <h4 className="font-bold text-text-hi-light text-sm">Negatives & Non-nego</h4>
                          </div>
                          <p className="text-xs text-text-md-light leading-relaxed">Aturan ketat tentang apa yang TIDAK BOLEH dilakukan oleh AI. Ini penting untuk menghindari halusinasi, bias, jargon akademis yang kaku, atau asumsi buta.</p>
                        </div>

                        <div className="bg-white border-l-4 border-brand-gold p-5 rounded-r-xl shadow-sm md:col-span-2 lg:col-span-3 xl:col-span-2">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-bg-gold-subtle text-brand-dark flex items-center justify-center font-bold">S</div>
                            <h4 className="font-bold text-text-hi-light text-sm">Steps & Sequencing</h4>
                          </div>
                          <p className="text-xs text-text-md-light leading-relaxed">Alur logika atau langkah kognitif berurutan yang harus dilalui AI untuk mencapai kesimpulan yang akurat dan dapat ditindaklanjuti.</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-12 w-full mt-4">
                        
                        {/* Box 1: Kasus 1 */}
                        <div className="bg-white rounded-2xl p-8 border border-border-subtle shadow-sm flex flex-col gap-4">
                          <h4 className="text-xl font-bold text-text-hi-light">Kasus: Mengelola Komunikasi Perubahan (Change Management)</h4>
                          <p className="text-text-md-light">
                            <strong>Situasi:</strong> Meluncurkan Ekosistem Pembelajaran Digital baru, namun karyawan merasa skeptis dan menganggapnya sebagai beban kerja tambahan.
                          </p>
                          <div className="bg-brand-light border border-brand-gold rounded-xl p-5 font-mono text-sm leading-relaxed text-brand-dark whitespace-pre-wrap">
{`A: Bertindaklah sebagai Kepala Inovasi dan Pengembangan. Audiens adalah seluruh manajer operasional.
C: Kita akan meluncurkan platform pembelajaran berbasis AI. Banyak manajer takut inisiatif ini akan menyita waktu operasional mereka yang sudah padat.
T: Buatkan draf memo internal untuk mengumumkan peluncuran ini.
I: Tujuannya adalah untuk menurunkan resistensi, menyoroti kemudahan penggunaan, dan menumbuhkan growth mindset bahwa teknologi ini akan mempercepat pekerjaan mereka, bukan menambah beban.
O: Memo maksimal 3 paragraf pendek, gunakan 3 bullet points untuk manfaat utama.
N: DILARANG menggunakan kata "wajib" atau bernada mengancam. JANGAN gunakan jargon teknis.
S: 1. Buka dengan empati terhadap jadwal padat mereka. 2. Jelaskan efisiensi platform secara logis. 3. Tutup dengan ajakan kolaborasi yang suportif.`}
                          </div>
                        </div>

                        {/* TOGGLE BUTTON */}
                        {!showBuilder ? (
                          <div className="flex justify-center mt-4 w-full">
                            <button 
                              onClick={() => {
                                setShowBuilder(true);
                                setTimeout(() => {
                                  document.getElementById('master-template-builder')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className="bg-brand-dark hover:bg-brand-gold-muted text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                            >
                              <Sparkles size={20} className="group-hover:rotate-12 transition-transform" /> Buka Master Template Simulator
                            </button>
                          </div>
                        ) : (
                        <div id="master-template-builder" className="bg-white rounded-2xl p-8 border-brand-gold border-[2px] shadow-md flex flex-col gap-6 relative">
                          <div className="absolute top-0 right-0 bg-brand-gold text-white text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-xl">Interactive Builder</div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-2xl font-display font-bold text-text-hi-light flex items-center gap-3">
                                <Sparkles className="text-brand-gold" /> Master Template Simulator
                              </h4>
                              <p className="text-text-md-light max-w-3xl mt-2">Pilih jenis Framework Anda, isi detailnya pada form di sebelah kiri, dan dapatkan prompt yang siap disalin pada area kanan.</p>
                            </div>
                            <button 
                              onClick={() => setShowBuilder(false)}
                              className="text-text-md-light hover:text-red-500 rounded-full p-2 bg-[rgba(0,0,0,0.02)] hover:bg-[rgba(255,0,0,0.1)] transition-colors"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          
                          {/* Toggle ACT vs ACTIONS */}
                          <div className="flex gap-4">
                            <button 
                              onClick={() => setActionType('ACT')}
                              className={`px-6 py-2.5 rounded-full font-bold transition-all ${actionType === 'ACT' ? 'bg-brand-dark text-white shadow-md' : 'bg-[rgba(0,0,0,0.04)] text-text-md-light hover:bg-[rgba(0,0,0,0.08)]'}`}
                            >
                              ACT (Lite)
                            </button>
                            <button 
                              onClick={() => setActionType('ACTIONS')}
                              className={`px-6 py-2.5 rounded-full font-bold transition-all ${actionType === 'ACTIONS' ? 'bg-brand-dark text-white shadow-md' : 'bg-[rgba(0,0,0,0.04)] text-text-md-light hover:bg-[rgba(0,0,0,0.08)]'}`}
                            >
                              A.C.T.I.O.N.S (Full)
                            </button>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
                            {/* Form Area */}
                            <div className="flex flex-col gap-4">
                              <div>
                                <label className="block text-sm font-bold text-text-hi-light mb-1">A - Actor & Audience</label>
                                <textarea 
                                  className="w-full p-3 bg-[rgba(0,0,0,0.02)] border border-border-subtle rounded-xl text-sm min-h-[80px]"
                                  placeholder="Bertindaklah sebagai [Peran Anda]. Audiens Anda adalah..."
                                  value={actionData.a}
                                  onChange={(e) => setActionData({...actionData, a: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-text-hi-light mb-1">C - Context & Conditions</label>
                                <textarea 
                                  className="w-full p-3 bg-[rgba(0,0,0,0.02)] border border-border-subtle rounded-xl text-sm min-h-[80px]"
                                  placeholder="Berikut latar belakang yang perlu dipahami..."
                                  value={actionData.c}
                                  onChange={(e) => setActionData({...actionData, c: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-text-hi-light mb-1">T - Target & Task</label>
                                <textarea 
                                  className="w-full p-3 bg-[rgba(0,0,0,0.02)] border border-border-subtle rounded-xl text-sm min-h-[80px]"
                                  placeholder="Tugas Anda adalah memformulasikan..."
                                  value={actionData.t}
                                  onChange={(e) => setActionData({...actionData, t: e.target.value})}
                                />
                              </div>

                              {actionType === 'ACTIONS' && (
                                <>
                                  <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-text-hi-light mb-1">I - Intention & Impact</label>
                                    <textarea 
                                      className="w-full p-3 bg-[rgba(0,0,0,0.02)] border border-border-subtle rounded-xl text-sm min-h-[80px]"
                                      placeholder="Dampak psikologis atau bisnis yang ingin saya capai..."
                                      value={actionData.i}
                                      onChange={(e) => setActionData({...actionData, i: e.target.value})}
                                    />
                                  </div>
                                  <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-text-hi-light mb-1">O - Output & Organization</label>
                                    <textarea 
                                      className="w-full p-3 bg-[rgba(0,0,0,0.02)] border border-border-subtle rounded-xl text-sm min-h-[80px]"
                                      placeholder="Format keluaran dalam bentuk tabel/bullet, panjangnya..."
                                      value={actionData.o}
                                      onChange={(e) => setActionData({...actionData, o: e.target.value})}
                                    />
                                  </div>
                                  <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-text-hi-light mb-1">N - Negatives & Non-negotiables</label>
                                    <textarea 
                                      className="w-full p-3 bg-[rgba(0,0,0,0.02)] border border-border-subtle rounded-xl text-sm min-h-[80px]"
                                      placeholder="Anda DILARANG menggunakan kata..."
                                      value={actionData.n}
                                      onChange={(e) => setActionData({...actionData, n: e.target.value})}
                                    />
                                  </div>
                                  <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-text-hi-light mb-1">S - Steps & Sequencing</label>
                                    <textarea 
                                      className="w-full p-3 bg-[rgba(0,0,0,0.02)] border border-border-subtle rounded-xl text-sm min-h-[80px]"
                                      placeholder="1. Analisis datanya... 2. Rumuskan strateginya..."
                                      value={actionData.s}
                                      onChange={(e) => setActionData({...actionData, s: e.target.value})}
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Preview Area */}
                            <div className="bg-brand-dark rounded-xl p-6 shadow-inner flex flex-col max-h-[800px]">
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="font-bold text-white uppercase tracking-wide text-sm">Generated Prompt</h5>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(generateActionPrompt());
                                    setCopiedId('builder');
                                    setTimeout(() => setCopiedId(null), 2000);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                  {copiedId === 'builder' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                  {copiedId === 'builder' ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                              <div className="flex-1 bg-[rgba(0,0,0,0.3)] rounded-lg p-5 overflow-y-auto custom-scrollbar font-mono text-sm text-[rgba(255,255,255,0.9)] whitespace-pre-wrap leading-relaxed">
                                {generateActionPrompt()}
                              </div>
                            </div>
                          </div>
                        </div>
                        )}
                      </div>
                      </div>
                      )}

                      {activeTechniqueTab === 'types' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="w-full mt-4 mb-8">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-2xl font-display font-bold text-text-hi-light mb-3">Types of Prompting Techniques</h3>
                                <p className="text-text-md-light text-lg mb-6">Memahami pola instruksi yang berbeda untuk memaksimalkan logika dan efisiensi AI.</p>
                              </div>
                              <div className="text-[10px] text-text-lo-light uppercase tracking-widest font-mono text-right whitespace-nowrap bg-brand-light px-3 py-2 border border-border-subtle rounded-lg opacity-80">
                                Watermark:<br/>Brij Kishore Pandey<br/>@codewithbrij
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full mt-8">
                              {techniquesData.map((tech, idx) => (
                                <div key={idx} className={`bg-white border-2 border-brand-gold rounded-2xl shadow-sm overflow-hidden flex flex-col h-full`}>
                                  <div className="bg-brand-dark px-5 py-3 text-center">
                                    <h4 className="font-display font-medium text-white text-xl tracking-wide">{tech.title}</h4>
                                  </div>
                                  <div className="p-6 flex-1 flex flex-col content-start">
                                    <motion.div 
                                      variants={containerVariants} 
                                      initial="hidden" 
                                      whileInView="visible" 
                                      viewport={{ once: true, margin: "-50px" }} 
                                      className="flex flex-wrap justify-center items-center gap-2 mb-6 min-h-[90px]"
                                    >
                                      {tech.steps.map((step, i, arr) => (
                                        <React.Fragment key={i}>
                                          <motion.div variants={itemVariants} className="bg-white px-3 py-2 rounded-xl text-xs sm:text-sm font-bold font-sans text-center text-brand-dark border border-border-subtle shadow-sm flex items-center justify-center max-w-[140px]">
                                            {step}
                                          </motion.div>
                                          {i !== arr.length - 1 && (
                                            <motion.div variants={itemVariants} className="flex-shrink-0">
                                              <ArrowRight size={18} className="text-brand-gold" />
                                            </motion.div>
                                          )}
                                        </React.Fragment>
                                      ))}
                                    </motion.div>
                                    <div className="mt-auto bg-brand-light p-4 rounded-xl border border-border-subtle">
                                      <p className="text-sm font-medium text-text-md-light leading-relaxed">
                                        {tech.desc}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                        </div>
                      )}

                      {activeTechniqueTab === 'brutal' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="w-full mt-4 mb-8">
                            <h3 className="text-3xl font-display font-black text-brand-dark uppercase tracking-wide mb-2">
                              The Brutal Method: Forcing Honest Feedback from AI
                            </h3>
                            <p className="text-text-md-light font-medium text-lg leading-relaxed max-w-3xl">
                              Bypass the "politeness bias" of AI to extract critical, actionable feedback.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full mt-8">
                            {/* Left Column: The Problem & The Framework */}
                            <div className="xl:col-span-2 flex flex-col gap-6">
                              
                              {/* The Problem */}
                              <div className="bg-white border-2 border-brand-gold rounded-2xl shadow-sm p-6">
                                <h4 className="font-display font-bold text-xl text-brand-dark mb-4 border-b border-border-subtle pb-2">THE PROBLEM: THE "HELPFULNESS" BIAS</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-bg-gold-subtle rounded-xl flex items-center justify-center flex-shrink-0">
                                      <span className="text-2xl">🤖</span>
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark mb-1">AI is Trained to Protect Your Ego</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">Standard AI interactions yield soft, vague feedback because models are optimized to be agreeable assistants.</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-500">
                                      <span className="text-2xl">⚠️</span>
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark mb-1">High-Stakes Use Cases Requiring Honesty</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">Critical feedback is essential for client proposals, product launches, cold outreach, and significant financial/legal commitments.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* The Brutal Framework */}
                              <div className="bg-white border-2 border-brand-gold rounded-2xl shadow-sm p-6">
                                <h4 className="font-display font-bold text-xl text-brand-dark mb-4 border-b border-border-subtle pb-2">THE BRUTAL FRAMEWORK</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                                  
                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-mono text-gray-500">1</div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark mb-1">[Begin Fresh: Kill the Memory]</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">Use "Temporary Chat" (ChatGPT, Gemini) or "Incognito/Ghost Mode" (Claude) to prevent the AI from adapting to your preferences.</p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-mono text-gray-500">2</div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark mb-1">[Right Model Selection]</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">For high-stakes scenarios, drop the prompt into 2-3 different models for a multi-angled perspective.</p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-mono text-gray-500">3</div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark mb-1">[Use a Critic Persona]</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">Assign a specific role to the AI to challenge assumptions, hunt for loopholes, or provide harsh, actionable feedback (e.g. Devil's Advocate, Gordon Ramsey).</p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-mono text-gray-500">4</div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark mb-1">[Third-Party Framing]</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">Detach your identity; tell the AI the idea belongs to a "co-worker" or "competitor" to spare your feelings.</p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-mono text-gray-500">5</div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark mb-1">[Ask Specific Questions]</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">Replace "What do you think?" with targeted prompts about financial risks, user frustrations, or "pre-mortem" failure analysis.</p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-mono text-gray-500">6</div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark mb-1">[Leverage AI Against Itself]</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">Ask the model to grade its feedback (1-100) for genuine criticality and then rewrite it to be harsher (AI Jiu-Jitsu).</p>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>

                            {/* Right Column: Model Spectrum & Bonus */}
                            <div className="flex flex-col gap-6">
                              
                              {/* The Model Spectrum */}
                              <div className="bg-[#2D3339] rounded-2xl shadow-sm p-6 text-white border border-[#404850]">
                                <h4 className="font-display font-bold text-xl mb-4 border-b border-[#404850] pb-2 text-center text-[#E0E5E9]">THE MODEL SPECTRUM</h4>
                                
                                <div className="flex flex-col relative h-[300px] justify-between py-4">
                                  {/* Line */}
                                  <div className="absolute left-[28px] top-4 bottom-4 w-1 bg-gradient-to-b from-[#5C7E8F] via-[#A8B49B] to-[#9A504E] rounded-full"></div>

                                  <div className="flex items-start gap-4 z-10">
                                    <div className="w-10 h-10 rounded-full bg-[#5C7E8F] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs uppercase shadow-md">
                                      Hon
                                    </div>
                                    <div className="pt-1">
                                      <h5 className="font-bold text-[#E0E5E9] text-sm">Grok & DeepSeek</h5>
                                      <p className="text-[11px] text-[#A0ABB5] leading-snug">lean toward blunt honesty, truth-seeking & objective.</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-4 z-10">
                                    <div className="w-10 h-10 rounded-full bg-[#A8B49B] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-md">
                                      Gem
                                    </div>
                                    <div className="pt-1">
                                      <h5 className="font-bold text-[#E0E5E9] text-sm">Gemini</h5>
                                      <p className="text-[11px] text-[#A0ABB5] leading-snug">is supportive (but occasionally surprising).</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-4 z-10">
                                    <div className="w-10 h-10 rounded-full bg-[#9A504E] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-md">
                                      Sup
                                    </div>
                                    <div className="pt-1">
                                      <h5 className="font-bold text-[#E0E5E9] text-sm">ChatGPT & Claude</h5>
                                      <p className="text-[11px] text-[#A0ABB5] leading-snug">are kind & ego-protective; require specific prompting to become critical.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Bonus */}
                              <div className="bg-brand-light border-2 border-brand-gold rounded-2xl shadow-sm p-6">
                                <h4 className="font-display font-bold text-lg text-brand-dark mb-3">BONUS: SYSTEM-LEVEL LOGIC</h4>
                                <h5 className="font-bold text-brand-dark text-sm mb-2">Custom Instructions for Permanent Critique</h5>
                                <p className="text-xs text-text-md-light leading-relaxed">
                                  Use personalization settings to set a permanent rule:
                                </p>
                                <div className="mt-3 p-3 bg-[rgba(0,0,0,0.03)] border border-border-subtle rounded-lg text-xs font-mono italic text-brand-dark">
                                  "Prioritize substance over compliments; challenge assumptions; never soften criticism."
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      )}

                      {activeTechniqueTab === 'jeffsu' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="w-full mt-4 mb-10">
                            <div>
                                <h3 className="text-2xl font-display font-bold text-text-hi-light mb-3">
                                  Jeff Su's Precision Framework
                                </h3>
                                <p className="text-text-md-light text-lg">
                                  Teknik presisi tinggi untuk mendapatkan umpan balik kritis dan hasil maksimal dari AI.
                                </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-12 w-full">
                            
                            {/* Templates Part */}
                            <div>
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-bg-gold-subtle text-brand-gold-muted flex items-center justify-center font-bold">1</div>
                                <h4 className="text-xl font-bold text-text-hi-light">Prompt Templates</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {jeffSuData.templates.map((tpl, i) => (
                                  <div key={i} className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm">
                                    <h5 className="font-bold text-brand-dark mb-2">{tpl.title}</h5>
                                    <p className="text-xs text-text-md-light mb-4">{tpl.desc}</p>
                                    <div className="bg-brand-light border border-brand-gold rounded-lg p-3">
                                      <p className="font-mono text-xs text-brand-dark whitespace-pre-wrap">{tpl.prompt}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Building Blocks */}
                            <div>
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-bg-gold-subtle text-brand-gold-muted flex items-center justify-center font-bold">2</div>
                                <h4 className="text-xl font-bold text-text-hi-light">6 Building Blocks of a Perfect Prompt</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {jeffSuData.buildingBlocks.map((bb, i) => (
                                  <div key={i} className="bg-white p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-2 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-bg-gold-subtle rounded-bl-3xl -mr-2 -mt-2"></div>
                                    <h5 className="font-bold text-brand-dark text-sm z-10">{bb.title}</h5>
                                    <p className="text-xs text-text-md-light leading-relaxed z-10">{bb.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Best Practices */}
                            <div>
                               <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-bg-gold-subtle text-brand-gold-muted flex items-center justify-center font-bold">3</div>
                                <h4 className="text-xl font-bold text-text-hi-light">ChatGPT-5 Best Practices</h4>
                              </div>
                              <div className="flex flex-col gap-3">
                                {jeffSuData.bestPractices.map((bp, i) => (
                                  <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-xl border border-border-subtle shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-brand-light border border-brand-gold flex items-center justify-center text-brand-gold-muted font-bold text-sm shrink-0">
                                      {i + 1}
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-brand-dark text-sm">{bp.title}</h5>
                                      <p className="text-xs text-text-md-light mt-1">{bp.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Mistakes */}
                            <div>
                               <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-bg-gold-subtle text-brand-gold-muted flex items-center justify-center font-bold">4</div>
                                <h4 className="text-xl font-bold text-text-hi-light">5 Kesalahan Umum Secara Singkat</h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {jeffSuData.mistakes.map((mis, i) => (
                                  <div key={i} className="bg-brand-light p-5 rounded-xl border border-border-subtle">
                                      <h5 className="font-bold text-brand-dark text-sm mb-2">{mis.title}</h5>
                                      <p className="text-xs text-text-md-light leading-relaxed">{mis.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeMenu === 'Reading and Learning' && (
                    <div className="w-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                      
                      {activeLearningTab === 'home' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          {[
                            { id: 'smart', title: 'Smart Learning & Research', desc: '5 mode pembelajaran berbasis riset kognitif menggunakan AI.', icon: <Brain className="w-8 h-8 text-brand-gold" /> },
                            { id: 'faster', title: 'Learn Anything Faster', desc: 'Prompt templates untuk percepatan penyerapan konsep baru.', icon: <Sparkles className="w-8 h-8 text-brand-gold" /> },
                            { id: 'extract', title: 'Extract From a Book', desc: 'Dapatkan intisari buku bisnis dengan cepat.', icon: <BookOpen className="w-8 h-8 text-brand-gold" /> }
                          ].map((cat, idx) => (
                            <div 
                              key={cat.id}
                              onClick={() => setActiveLearningTab(cat.id)}
                              className="bg-white rounded-2xl p-6 shadow-sm border border-border-subtle group hover:shadow-lg hover:border-brand-gold transition-all duration-300 cursor-pointer flex flex-col items-start text-left h-full"
                            >
                              <div className="w-12 h-12 bg-bg-gold-subtle rounded-xl flex items-center justify-center mb-4 text-brand-gold-muted group-hover:scale-110 transition-transform duration-300">
                                {cat.icon}
                              </div>
                              <h3 className="font-display text-lg font-bold text-text-hi-light mb-2 group-hover:text-brand-gold-muted transition-colors">
                                {cat.title}
                              </h3>
                              <p className="font-sans text-sm text-text-md-light leading-relaxed flex-1">
                                {cat.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeLearningTab !== 'home' && (
                         <button 
                           onClick={() => setActiveLearningTab('home')} 
                           className="flex items-center gap-2 text-text-md-light hover:text-brand-gold-muted font-medium mb-6 transition-colors"
                         >
                           <ChevronLeft size={16} /> Kembali ke Menu Kategori
                         </button>
                      )}

                      {activeLearningTab === 'smart' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="mb-10">
                            <h3 className="text-3xl font-display font-black text-brand-dark uppercase tracking-wide mb-2">Smart Learning & Research (AI Reading)</h3>
                            <p className="text-text-md-light font-medium text-lg leading-relaxed max-w-3xl">
                              5 mode pembelajaran berbasis riset kognitif. Setiap mode memetakan teori pembelajaran (learning theory) ke dalam workflow praktis menggunakan AI.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-8">
                            {readingModesData.map((mode) => (
                              <div key={mode.id} className="bg-white rounded-3xl shadow-sm border border-border-light hover:border-brand-gold/40 hover:shadow-md transition-all duration-300 p-6 md:p-8 flex flex-col items-start gap-8 group">
                                <div className="w-full flex flex-col md:flex-row gap-8">
                                  <div className="w-full md:w-1/3 flex flex-col items-start">
                                    <div className="inline-block px-3 py-1 bg-brand-light text-brand-dark text-xs font-bold font-mono tracking-widest rounded-full mb-4 border border-border-light group-hover:border-brand-gold/30 transition-colors">
                                      MODE {mode.num} • {mode.tag}
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-text-hi-light mb-2 leading-tight">{mode.title}</h3>
                                    <p className="text-sm text-text-md-light font-medium mb-6 leading-relaxed">{mode.subtitle}</p>
                                    
                                    <div className="bg-[rgba(0,0,0,0.02)] p-5 rounded-2xl border border-border-subtle w-full mb-4 mt-auto">
                                      <div className="text-[11px] uppercase tracking-widest font-bold text-brand-gold-muted flex items-center gap-2 mb-3">
                                        <MessageSquare size={14} /> Sample Prompt
                                      </div>
                                      <p className="text-sm font-mono text-text-md-light italic leading-relaxed">"{mode.samplePrompt}"</p>
                                    </div>
                                    <div className="bg-bg-gold-subtle text-brand-dark p-4 rounded-xl text-sm font-medium border border-brand-gold/20 w-full flex items-start gap-3">
                                       <Zap size={18} className="text-brand-gold mt-0.5 flex-shrink-0" />
                                       <div>
                                         <span className="font-bold block mb-1">Quick Win:</span>
                                         <span className="text-text-md-light">{mode.quickWin}</span>
                                       </div>
                                    </div>
                                  </div>

                                  <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
                                    {/* Pengertian */}
                                    <div className="flex flex-col">
                                      <div className="bg-brand-light p-6 rounded-2xl border border-border-subtle flex-1 flex flex-col">
                                         <div className="flex items-center gap-2 mb-4">
                                            <Brain className="w-5 h-5 text-brand-gold" />
                                            <h4 className="font-bold text-brand-dark uppercase tracking-widest text-[11px]">Pengertian (Teori)</h4>
                                         </div>
                                         <div className="font-bold text-brand-dark mb-1">{mode.theory}</div>
                                         <div className="text-xs text-brand-gold-muted font-bold font-mono mb-4">{mode.theorist}</div>
                                         <p className="text-sm text-text-md-light leading-relaxed font-medium">{mode.theoryDesc}</p>
                                      </div>
                                    </div>

                                    {/* Use Case */}
                                    <div className="flex flex-col">
                                      <div className="bg-[rgba(0,0,0,0.02)] p-6 rounded-2xl border border-border-subtle flex-1 flex flex-col">
                                         <div className="flex items-center gap-2 mb-4">
                                            <Target className="w-5 h-5 text-brand-gold" />
                                            <h4 className="font-bold text-brand-dark uppercase tracking-widest text-[11px]">Use Case & Solusi</h4>
                                         </div>
                                         <p className="text-sm text-brand-dark mb-4 flex flex-col gap-1">
                                           <span className="font-bold text-[10px] uppercase tracking-widest text-text-lo-light">Masalah (Problem):</span> 
                                           <span className="font-medium text-text-md-light leading-relaxed">{mode.problem}</span>
                                         </p>
                                         <p className="text-sm text-brand-dark mb-4 flex flex-col gap-1">
                                           <span className="font-bold text-[10px] uppercase tracking-widest text-text-lo-light">Solusi Pendekatan:</span> 
                                           <span className="font-medium text-text-md-light leading-relaxed">{mode.solution}</span>
                                         </p>
                                         <p className="text-sm text-brand-dark flex flex-col gap-1 mt-auto pt-2 border-t border-border-light">
                                           <span className="font-bold text-[10px] uppercase tracking-widest text-text-lo-light">Dampak Akhir:</span> 
                                           <span className="font-medium text-text-hi-light">{mode.impact}</span>
                                         </p>
                                      </div>
                                    </div>

                                    {/* Caranya / Workflow */}
                                    <div className="flex flex-col xl:col-span-2 mt-2">
                                      <div className="bg-[rgba(0,0,0,0.02)] p-6 rounded-2xl border border-border-subtle flex flex-col md:flex-row gap-8">
                                         <div className="flex-1">
                                           <div className="flex items-center gap-2 mb-3">
                                              <Layers className="w-5 h-5 text-brand-gold" />
                                              <h4 className="font-bold text-brand-dark uppercase tracking-widest text-[11px]">Taktik</h4>
                                           </div>
                                           <p className="text-sm text-brand-dark font-medium leading-relaxed">{mode.tactic}</p>
                                         </div>
                                         <div className="w-px bg-border-light hidden md:block"></div>
                                         <div className="flex-1">
                                           <h5 className="font-bold text-brand-dark text-[11px] uppercase tracking-widest mb-4">Langkah Penggunaan (Workflow)</h5>
                                           <div className="space-y-4">
                                             {mode.workflow.map((step, idx) => (
                                               <div key={idx} className="flex gap-3 items-start">
                                                  <div className="bg-brand-light text-brand-dark w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 border border-border-subtle">{idx + 1}</div>
                                                  <span className="text-sm text-text-md-light font-medium leading-relaxed">{step}</span>
                                               </div>
                                             ))}
                                           </div>
                                         </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeLearningTab === 'faster' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex justify-between items-start mt-4 mb-8">
                            <div>
                              <h3 className="text-3xl font-display font-black text-brand-dark uppercase tracking-wide mb-2">Use AI To Learn Anything Faster</h3>
                              <p className="text-text-md-light font-medium">Prompt templates untuk percepatan penyerapan konsep baru dengan bantuan AI.</p>
                            </div>
                            <div className="text-[10px] text-text-lo-light uppercase tracking-widest font-mono text-right whitespace-nowrap bg-brand-light px-3 py-2 border border-border-subtle rounded-lg opacity-80">
                              Created by:<br/>Moritz Kremb<br/>@moritzkremb
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-10 w-full">
                            {learningData.map((item, idx) => (
                              <motion.div 
                                key={idx} 
                                variants={itemVariants} 
                                initial="hidden" 
                                whileInView="visible" 
                                viewport={{ once: true, margin: "-50px" }}
                                className="bg-white rounded-2xl p-8 xl:p-10 shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full group"
                              >
                                <div className="flex flex-col h-full">
                                  <div className="mb-8">
                                    <div className="text-brand-gold font-mono text-xs tracking-[0.2em] font-bold mb-5 flex items-center gap-4">
                                      <span className="w-8 h-px bg-brand-gold/40"></span>
                                      {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <h4 className="font-display font-bold text-brand-dark text-2xl mb-4 leading-tight">{item.title}</h4>
                                    <p className="text-[15px] text-text-md-light leading-relaxed">{item.desc}</p>
                                  </div>
                                  
                                  <div className="mt-auto bg-brand-light/60 rounded-xl p-6 md:p-8 border border-border-light relative transition-colors hover:bg-brand-light">
                                     <div className="flex justify-between items-center mb-5">
                                       <h5 className="font-bold text-brand-dark text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 opacity-50">
                                          <MessageSquare size={14} /> The Prompt
                                       </h5>
                                       <button 
                                          onClick={() => {
                                             navigator.clipboard.writeText(item.prompt);
                                          }}
                                          className="text-text-lo-light hover:text-brand-dark transition-colors p-1"
                                          title="Copy to clipboard"
                                       >
                                         <Copy size={16} />
                                       </button>
                                     </div>
                                     
                                     <div className="text-brand-dark text-[14px] leading-relaxed font-mono whitespace-pre-wrap break-words opacity-80">
                                        {item.prompt}
                                     </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeLearningTab === 'extract' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex justify-between items-start mt-4 mb-8">
                            <div>
                              <h3 className="text-3xl font-display font-black text-brand-dark uppercase tracking-wide mb-2">How to Use AI to Extract Everything from a Book</h3>
                              <p className="text-text-md-light font-medium">Prompt templates for extracting valuable insights from books with AI.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-10 w-full">
                            {extractBooksData.map((item, idx) => (
                              <motion.div 
                                key={idx} 
                                variants={itemVariants} 
                                initial="hidden" 
                                whileInView="visible" 
                                viewport={{ once: true, margin: "-50px" }}
                                className="bg-white rounded-2xl p-8 xl:p-10 shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full group"
                              >
                                <div className="flex flex-col h-full">
                                  <div className="mb-8">
                                    <div className="text-brand-gold font-mono text-xs tracking-[0.2em] font-bold mb-5 flex items-center gap-4">
                                      <span className="w-8 h-px bg-brand-gold/40"></span>
                                      {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <h4 className="font-display font-bold text-brand-dark text-2xl mb-4 leading-tight">{item.title}</h4>
                                    <p className="text-[15px] text-text-md-light leading-relaxed">{item.desc}</p>
                                  </div>
                                  
                                  <div className="mt-auto bg-brand-light/60 rounded-xl p-6 md:p-8 border border-border-light relative transition-colors hover:bg-brand-light">
                                     <div className="flex justify-between items-center mb-5">
                                       <h5 className="font-bold text-brand-dark text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 opacity-50">
                                          <MessageSquare size={14} /> The Prompt
                                       </h5>
                                       <button 
                                          onClick={() => {
                                             navigator.clipboard.writeText(item.prompt);
                                          }}
                                          className="text-text-lo-light hover:text-brand-dark transition-colors p-1"
                                          title="Copy to clipboard"
                                       >
                                         <Copy size={16} />
                                       </button>
                                     </div>
                                     
                                     <div className="text-brand-dark text-[14px] leading-relaxed font-mono whitespace-pre-wrap break-words opacity-80">
                                        {item.prompt}
                                     </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}


                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Cream Background Minimal */}
      <footer className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 mt-auto border-t border-border-light">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 mb-2">
              <img 
                src="https://drive.google.com/thumbnail?id=1sCKHvnvr5McsNdlNNsrPHaH3FGm9LE4Z&sz=w800" 
                alt="Tjitra & Associates" 
                className="h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-sans text-border-light">|</span>
              <img 
                src="https://drive.google.com/thumbnail?id=1iCu_xg7KG8jwNbxZeNZAZaqbLi1Yv_fD&sz=w800" 
                alt="IWDemy" 
                className="h-7 object-contain mt-1"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="font-sans italic text-[13px] text-text-md-light">
              Aspiring Growth Experiencing Technology
            </p>
            <p className="font-sans font-medium text-[13px] text-brand-gold-muted mt-1">
              Curated by Community | Powered by Tjitra
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 font-medium text-[13px] text-text-lo-light">
            <span>© {new Date().getFullYear()} Tjitra & Associates</span>
            <button 
              onClick={() => {
                if (isAdminAuth) setShowAdminPanel(true);
                else setShowAdminLogin(true);
              }}
              className="mt-4 text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showAdminLogin && !isAdminAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-light/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl border border-[rgba(0,0,0,0.05)] flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 relative">
            <button 
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 text-text-lo-light hover:text-text-hi-light"
            >
              <X size={20} />
            </button>
            <div className="w-14 h-14 bg-bg-gold-subtle text-brand-gold rounded-full flex items-center justify-center mb-5">
              <Lock size={28} strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-2xl font-bold text-text-hi-light mb-2">Admin Login</h2>
            <form onSubmit={handleAdminLogin} className="w-full mt-4">
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-brand-light text-text-hi-light focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent mb-4 transition-all text-center"
              />
              <button
                type="submit"
                className="w-full py-3.5 bg-brand-dark text-brand-gold font-display font-extrabold uppercase tracking-[2px] text-[12px] rounded-xl hover:bg-[#1a1815] transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Dashboard Modal */}
      {showAdminPanel && isAdminAuth && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.05)] flex justify-between items-center bg-brand-light">
              <h2 className="font-display text-xl font-bold">Admin Panel</h2>
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="p-2 text-text-lo-light hover:text-text-hi-light rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form onSubmit={handleAddPrompt} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-hi-light mb-1">Title</label>
                    <input
                      required
                      type="text"
                      value={newPrompt.title}
                      onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                      className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-gold"
                      placeholder="Example: Digital Marketing Strategy"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-text-hi-light mb-1">Description & Instructions</label>
                    <textarea
                      required
                      value={newPrompt.description}
                      onChange={(e) => setNewPrompt({ ...newPrompt, description: e.target.value })}
                      className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-gold h-20 resize-y"
                      placeholder="Example: Use this prompt to create a digital marketing strategy..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-hi-light mb-1">Category</label>
                    <select
                      value={newPrompt.category}
                      onChange={(e) => setNewPrompt({ ...newPrompt, category: e.target.value })}
                      className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-gold"
                    >
                      {dynamicCategories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-hi-light mb-1">Main Prompt Content</label>
                    <textarea
                      required
                      value={newPrompt.content}
                      onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                      className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-gold h-48 font-mono text-sm resize-y"
                      placeholder="Example: I want you to act as..."
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="px-6 py-3 bg-brand-dark text-brand-gold rounded-xl font-display font-extrabold text-[12px] uppercase tracking-[1px] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Adding...' : 'Save New Prompt'}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Dialog for Full Prompt */}
      {selectedPrompt && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-brand-dark/60 backdrop-blur-sm" 
          onClick={() => setSelectedPrompt(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.05)] flex justify-between items-center bg-brand-light">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase bg-bg-gold-subtle text-brand-gold-muted px-2.5 py-1 rounded">
                {selectedPrompt.category}
              </span>
              <button 
                onClick={() => setSelectedPrompt(null)}
                className="p-2 text-text-lo-light hover:text-text-hi-light rounded-full hover:bg-black/5 transition-colors"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <h2 className="font-display text-2xl font-bold text-text-hi-light mb-3">
                {selectedPrompt.title}
              </h2>
              <p className="font-sans text-text-md-light mb-6">
                {selectedPrompt.description}
              </p>
              
              <div className="bg-brand-light rounded-xl border border-[rgba(0,0,0,0.05)] p-5 relative">
                <pre className="font-mono text-[13px] text-text-md-light whitespace-pre-wrap leading-relaxed break-words">
                  {selectedPrompt.content}
                </pre>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[rgba(0,0,0,0.05)] flex justify-end gap-3 bg-brand-light">
              <button
                onClick={() => setSelectedPrompt(null)}
                className="px-5 py-2.5 rounded-xl font-display font-extrabold uppercase tracking-[1px] text-[12px] text-text-md-light hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCopy(selectedPrompt.id, selectedPrompt.content)}
                className={`px-6 py-2.5 rounded-xl font-display font-extrabold uppercase tracking-[1px] text-[12px] flex items-center gap-2 transition-all ${
                  copiedId === selectedPrompt.id 
                    ? 'bg-brand-dark text-brand-gold' 
                    : 'bg-brand-gold text-brand-dark hover:bg-[#C2983E]'
                }`}
              >
                {copiedId === selectedPrompt.id ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Full Text
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
