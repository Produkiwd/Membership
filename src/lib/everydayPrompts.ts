// Generated from docs/prompt-sehari-hari.md. Edit the Markdown, then run scripts/gen-everyday-prompts.mjs.
export type EverydayPrompt = { id: string; title: string; when: string; prompt: string; followUp: boolean };
export type EverydayPromptGroup = { id: string; title: string; desc: string; prompts: EverydayPrompt[] };

export const EVERYDAY_PROMPT_GROUPS: EverydayPromptGroup[] = [
  {
    "id": "A",
    "title": "Supaya AI jujur (anti-halu)",
    "desc": "AI sering menjawab dengan yakin walaupun isinya salah. Prompt di kelompok ini memberi AI izin untuk bilang tidak tahu, dan meminta AI menunjukkan dari mana jawabannya berasal.",
    "prompts": [
      {
        "id": "A1",
        "title": "Izinkan AI bilang tidak tahu",
        "when": "di awal percakapan yang menyangkut fakta, angka, aturan, atau nama.",
        "prompt": "Sepanjang percakapan ini, kalau kamu tidak yakin dengan sebuah fakta, angka, nama, atau tanggal, katakan \"saya tidak yakin\" dan jelaskan bagian mana yang tidak kamu yakini. Jangan mengarang supaya jawaban terlihat lengkap. Jawaban yang jujur dan tidak lengkap lebih berguna buat saya.",
        "followUp": false
      },
      {
        "id": "A2",
        "title": "Jawab hanya dari dokumen",
        "when": "saat Anda melampirkan dokumen, laporan, atau notulen, dan ingin AI tidak menambah informasi dari luar.",
        "prompt": "Jawab pertanyaan saya hanya berdasarkan dokumen yang saya lampirkan. Untuk setiap poin jawaban, sertakan kutipan kalimat aslinya dari dokumen. Kalau jawabannya tidak ada di dokumen, tulis \"Tidak ditemukan di dokumen\" dan berhenti di situ.\n\nPertanyaan saya: [pertanyaan]",
        "followUp": false
      },
      {
        "id": "A3",
        "title": "Pisahkan fakta, dugaan, dan pendapat",
        "when": "saat membaca jawaban yang terdengar meyakinkan dan Anda ingin tahu mana yang bisa dipegang.",
        "prompt": "Tulis ulang jawabanmu barusan dan beri label di setiap poin:\nFAKTA kalau bisa diperiksa dari sumber yang jelas,\nDUGAAN kalau kamu menyimpulkan sendiri,\nPENDAPAT kalau ini penilaian atau saran.\nUntuk setiap FAKTA, sebutkan dari mana saya bisa memeriksanya.",
        "followUp": true
      },
      {
        "id": "A4",
        "title": "Daftar hal yang perlu dicek",
        "when": "sebelum jawaban AI dipakai untuk laporan, presentasi, atau keputusan.",
        "prompt": "Dari jawabanmu barusan, buat daftar semua klaim yang harus saya periksa sendiri sebelum saya pakai: angka, nama, tanggal, kutipan, aturan, dan referensi. Urutkan dari yang paling berisiko kalau ternyata salah. Untuk masing-masing, sarankan cara tercepat memeriksanya.",
        "followUp": true
      },
      {
        "id": "A5",
        "title": "Uji jawaban dengan pertanyaan balik",
        "when": "saat jawaban penting dan Anda ingin AI memeriksa dirinya sendiri sebelum Anda percaya.",
        "prompt": "Sebelum saya memakai jawabanmu, lakukan ini:\n1. Tulis 3 sampai 5 pertanyaan yang bisa membuktikan jawabanmu salah.\n2. Jawab setiap pertanyaan itu secara terpisah, tanpa melihat jawaban awalmu.\n3. Bandingkan hasilnya dengan jawaban awal. Kalau ada yang tidak cocok, perbaiki jawaban awalmu dan jelaskan apa yang berubah.",
        "followUp": true
      },
      {
        "id": "A6",
        "title": "Beri tingkat keyakinan",
        "when": "saat AI memberi beberapa poin atau rekomendasi dan Anda perlu tahu mana yang kuat.",
        "prompt": "Untuk setiap poin di jawabanmu, beri tingkat keyakinan: tinggi, sedang, atau rendah. Jelaskan dalam satu kalimat kenapa kamu memberi tingkat itu. Kalau keyakinanmu rendah, katakan informasi apa yang kamu butuhkan supaya lebih yakin.",
        "followUp": true
      }
    ]
  },
  {
    "id": "B",
    "title": "Berpikir kritis",
    "desc": "AI cenderung setuju dengan penggunanya. Prompt di kelompok ini meminta AI mengambil posisi yang berlawanan supaya celah dalam ide Anda kelihatan lebih awal.",
    "prompts": [
      {
        "id": "B1",
        "title": "Devil's advocate",
        "when": "saat Anda sudah yakin dengan sebuah ide dan ingin tahu titik lemahnya.",
        "prompt": "Jadilah devil's advocate untuk ide saya di bawah ini. Tugasmu mencari alasan kenapa ide ini bisa gagal atau keliru. Jangan memuji dan jangan memberi jalan tengah. Berikan 5 keberatan paling kuat, urutkan dari yang paling serius. Untuk tiap keberatan, jelaskan kondisi apa yang membuatnya benar-benar terjadi.\n\nIde saya: [ide, rencana, atau argumen]",
        "followUp": false
      },
      {
        "id": "B2",
        "title": "Pre-mortem",
        "when": "sebelum menjalankan proyek, program, atau perubahan.",
        "prompt": "Bayangkan sekarang sudah 6 bulan kemudian dan [proyek atau rencana] gagal total. Tulis cerita singkat tentang apa yang terjadi. Lalu buat daftar 5 penyebab kegagalan yang paling mungkin, tanda-tanda awal yang bisa saya lihat untuk masing-masing, dan satu langkah pencegahan yang bisa saya lakukan minggu ini.",
        "followUp": false
      },
      {
        "id": "B3",
        "title": "Temukan asumsi tersembunyi",
        "when": "saat rencana terasa masuk akal tapi Anda belum tahu apa saja yang sebenarnya Anda andalkan.",
        "prompt": "Baca rencana atau argumen saya di bawah. Tuliskan semua asumsi yang saya pakai tapi tidak saya sebut. Untuk setiap asumsi, nilai: seberapa besar kemungkinan asumsi ini salah, dan apa akibatnya kalau salah. Tandai 2 asumsi yang paling perlu saya uji dulu.\n\n[rencana atau argumen]",
        "followUp": false
      },
      {
        "id": "B4",
        "title": "Suarakan pihak yang tidak setuju",
        "when": "sebelum presentasi, negosiasi, atau rapat dengan pihak yang mungkin menolak.",
        "prompt": "Saya akan menyampaikan [usulan] kepada [pihak, misalnya direksi, tim keuangan, atau klien]. Berperanlah sebagai orang dari pihak itu yang paling skeptis. Ajukan 7 pertanyaan atau keberatan paling sulit yang mungkin mereka sampaikan. Setelah itu, beri saran singkat cara menjawab masing-masing.",
        "followUp": false
      },
      {
        "id": "B5",
        "title": "Bangun argumen terbaik untuk posisi lawan",
        "when": "saat Anda berbeda pendapat dengan seseorang dan ingin memahami posisinya dengan adil.",
        "prompt": "Posisi saya: [posisi Anda]\nPosisi orang lain: [posisi yang berlawanan]\n\nSusun argumen terkuat untuk posisi orang lain, seolah kamu pendukungnya yang paling cerdas dan jujur. Lalu sebutkan bagian mana dari argumen itu yang paling sulit saya bantah.",
        "followUp": false
      },
      {
        "id": "B6",
        "title": "Jangan setuju hanya karena saya yang bilang",
        "when": "di awal percakapan yang menuntut penilaian jujur, misalnya review rencana atau tulisan.",
        "prompt": "Dalam percakapan ini, jangan setuju dengan saya hanya karena saya yang mengatakannya. Kalau menurutmu saya keliru, katakan langsung dan beri alasannya. Kalau saya mendebat dan argumen saya tidak lebih kuat, tetap pada penilaianmu. Saya lebih butuh penilaian yang jujur daripada yang enak didengar.",
        "followUp": false
      }
    ]
  },
  {
    "id": "C",
    "title": "Cek kualitas jawaban",
    "desc": "Jawaban pertama AI jarang yang terbaik. Prompt di kelompok ini membantu Anda mendapat jawaban yang lebih tepat sebelum dan sesudah AI menulis.",
    "prompts": [
      {
        "id": "C1",
        "title": "Tanya dulu sebelum menjawab",
        "when": "saat permintaan Anda belum lengkap, atau Anda belum yakin apa yang Anda butuhkan.",
        "prompt": "Sebelum mengerjakan permintaan saya, ajukan pertanyaan yang kamu perlukan supaya hasilnya tepat. Maksimal 5 pertanyaan, satu per baris. Tunggu jawaban saya, baru kerjakan.\n\nPermintaan saya: [permintaan]",
        "followUp": false
      },
      {
        "id": "C2",
        "title": "Periksa ulang hasilmu",
        "when": "setelah AI menghasilkan tulisan, analisis, atau rencana.",
        "prompt": "Baca ulang hasilmu barusan seolah kamu editor yang teliti. Cari kesalahan logika, angka yang tidak konsisten, bagian yang tidak menjawab permintaan saya, dan kalimat yang membingungkan. Sebutkan temuanmu dulu, lalu tulis versi yang sudah diperbaiki.",
        "followUp": true
      },
      {
        "id": "C3",
        "title": "Nilai dengan kriteria",
        "when": "saat Anda punya standar yang jelas, misalnya untuk proposal, email penting, atau materi presentasi.",
        "prompt": "Nilai [tulisan atau hasil] dengan kriteria berikut, skor 1 sampai 5 untuk masing-masing:\n[kriteria 1]\n[kriteria 2]\n[kriteria 3]\nUntuk setiap skor di bawah 4, jelaskan apa yang kurang dan beri contoh perbaikannya.",
        "followUp": false
      },
      {
        "id": "C4",
        "title": "Apa yang belum dibahas",
        "when": "saat jawaban terasa rapi tapi Anda curiga ada yang terlewat.",
        "prompt": "Dari topik ini, apa saja yang belum kamu bahas tapi penting untuk saya ketahui? Pikirkan risiko, pengecualian, pihak yang terdampak, dan hal yang biasanya dilupakan orang. Sebutkan 5 hal teratas dan jelaskan kenapa masing-masing penting.",
        "followUp": true
      },
      {
        "id": "C5",
        "title": "Beri tiga versi yang berbeda",
        "when": "saat Anda belum tahu arah yang paling pas untuk tulisan, judul, atau pendekatan.",
        "prompt": "Buat 3 versi [tulisan, judul, atau pendekatan] dengan arah yang benar-benar berbeda satu sama lain. Beri nama setiap versi sesuai pendekatannya. Di akhir, jelaskan versi mana yang paling cocok untuk [tujuan dan pembaca], dan alasannya.",
        "followUp": false
      }
    ]
  },
  {
    "id": "D",
    "title": "Kejelasan",
    "desc": "Prompt untuk mengubah isi yang sudah ada supaya lebih mudah dipahami pembacanya.",
    "prompts": [
      {
        "id": "D1",
        "title": "Jelaskan seperti ke orang awam",
        "when": "saat Anda sendiri belum paham sebuah konsep, atau harus menjelaskannya ke orang lain.",
        "prompt": "Jelaskan [konsep] kepada orang cerdas yang belum pernah belajar bidang ini. Pakai bahasa sehari-hari, satu analogi dari kehidupan biasa, dan satu contoh nyata. Hindari istilah teknis. Kalau terpaksa memakainya, jelaskan artinya di kalimat yang sama.",
        "followUp": false
      },
      {
        "id": "D2",
        "title": "Ringkas untuk atasan",
        "when": "saat Anda harus melapor ke pimpinan yang hanya punya waktu satu menit.",
        "prompt": "Ringkas [isi atau dokumen] untuk [jabatan pembaca] yang hanya punya waktu satu menit. Susunannya:\n1. Satu kalimat inti: apa yang terjadi atau apa yang perlu diputuskan.\n2. Tiga poin pendukung, masing-masing satu kalimat.\n3. Apa yang saya minta dari beliau.\nMaksimal 120 kata.",
        "followUp": false
      },
      {
        "id": "D3",
        "title": "Ubah nada tulisan",
        "when": "saat isi sudah benar tapi nadanya kurang pas untuk pembacanya.",
        "prompt": "Tulis ulang teks di bawah dengan nada [misalnya: lebih hangat, lebih tegas, lebih formal, lebih santai] untuk [pembaca]. Pertahankan semua isi dan fakta. Setelah itu, sebutkan 3 perubahan utama yang kamu buat.\n\n[teks]",
        "followUp": false
      },
      {
        "id": "D4",
        "title": "Ringkas rapat jadi tindak lanjut",
        "when": "setelah rapat, dengan bahan notulen atau transkrip yang sudah dibersihkan dari data pribadi.",
        "prompt": "Dari catatan rapat di bawah, buat:\n1. Keputusan yang sudah diambil.\n2. Tindak lanjut dalam tabel: apa, siapa, kapan.\n3. Hal yang belum diputuskan dan perlu dibahas lagi.\nKalau penanggung jawab atau tenggat tidak disebut di catatan, tulis \"belum ditentukan\". Jangan menebak.\n\n[catatan rapat]",
        "followUp": false
      },
      {
        "id": "D5",
        "title": "Dari poin ke tulisan utuh",
        "when": "saat Anda punya poin-poin kasar dan perlu tulisan yang enak dibaca.",
        "prompt": "Ubah poin-poin di bawah menjadi [email, paragraf laporan, atau pengumuman] untuk [pembaca]. Pakai kalimat pendek dan bahasa yang wajar. Jangan menambah informasi yang tidak ada di poin saya. Kalau ada yang kurang jelas, tandai dengan [perlu dilengkapi].\n\n[poin-poin]",
        "followUp": false
      }
    ]
  },
  {
    "id": "E",
    "title": "Mengambil keputusan",
    "desc": "Prompt untuk menimbang pilihan secara lebih terstruktur. AI membantu menimbang, keputusan tetap di tangan Anda.",
    "prompts": [
      {
        "id": "E1",
        "title": "Bandingkan pilihan",
        "when": "saat ada dua atau lebih pilihan dan Anda belum bisa memilih.",
        "prompt": "Saya harus memilih antara [pilihan A], [pilihan B], dan [pilihan C] untuk [tujuan]. Buat tabel perbandingan berdasarkan biaya, waktu, risiko, dampak, dan kemudahan menjalankannya. Lalu sebutkan pilihan mana yang paling masuk akal dalam kondisi apa, dan informasi apa yang masih saya butuhkan sebelum memutuskan.",
        "followUp": false
      },
      {
        "id": "E2",
        "title": "Dampak lanjutan",
        "when": "saat keputusan terlihat bagus untuk jangka pendek tapi Anda ingin melihat lebih jauh.",
        "prompt": "Kalau saya menjalankan [keputusan], apa dampak langsungnya? Lalu apa dampak dari dampak itu dalam 3 bulan dan 1 tahun? Pikirkan orang, biaya, proses, dan hubungan dengan pihak lain. Tandai dampak yang tidak terlihat jelas di awal.",
        "followUp": false
      },
      {
        "id": "E3",
        "title": "Langkah pertama yang paling kecil",
        "when": "saat tujuan terasa besar dan Anda tidak tahu harus mulai dari mana.",
        "prompt": "Tujuan saya: [tujuan]\nWaktu dan sumber daya yang saya punya: [kondisi]\n\nApa satu langkah paling kecil yang bisa saya kerjakan hari ini dan langsung memberi informasi apakah saya berada di jalur yang benar? Jelaskan cara menjalankannya dan tanda bahwa langkah itu berhasil.",
        "followUp": false
      },
      {
        "id": "E4",
        "title": "Uji keputusan dengan skenario",
        "when": "saat keputusan bergantung pada kondisi yang belum pasti.",
        "prompt": "Untuk keputusan [keputusan], buat 3 skenario: kondisi terbaik, kondisi paling mungkin, dan kondisi terburuk. Untuk masing-masing, jelaskan apa yang terjadi dan apa yang perlu saya siapkan. Di akhir, nilai apakah keputusan ini masih layak dijalankan di skenario terburuk.",
        "followUp": false
      }
    ]
  },
  {
    "id": "F",
    "title": "Mengatur percakapan",
    "desc": "Prompt untuk menjaga percakapan panjang tetap rapi dan memindahkan konteks ke percakapan baru.",
    "prompts": [
      {
        "id": "F1",
        "title": "Tetapkan aturan main",
        "when": "di pesan pertama, saat Anda akan bekerja lama dengan AI untuk satu tugas.",
        "prompt": "Untuk seluruh percakapan ini:\nPeranmu: [peran, misalnya: rekan analis, editor, pelatih]\nTujuan saya: [tujuan]\nPembaca hasil akhirnya: [pembaca]\nGaya bahasa: [misalnya: Bahasa Indonesia, kalimat pendek, tanpa istilah asing yang tidak perlu]\nKalau ada yang tidak jelas, tanya saya dulu. Kalau kamu tidak tahu, bilang tidak tahu.",
        "followUp": false
      },
      {
        "id": "F2",
        "title": "Ringkas untuk percakapan baru",
        "when": "saat percakapan sudah terlalu panjang dan AI mulai lupa hal yang sudah dibahas.",
        "prompt": "Buat ringkasan dari percakapan kita yang bisa saya tempel ke percakapan baru supaya kita bisa lanjut tanpa mengulang. Isinya: tujuan, keputusan yang sudah diambil, fakta penting, hal yang sudah dicoba dan tidak berhasil, dan langkah berikutnya. Tulis dalam format yang langsung bisa ditempel.",
        "followUp": true
      },
      {
        "id": "F3",
        "title": "Kembali ke tujuan",
        "when": "saat percakapan mulai melebar ke mana-mana.",
        "prompt": "Berhenti sebentar. Ingatkan saya apa tujuan awal percakapan ini, apa yang sudah kita capai, dan apa yang masih kurang. Lalu sarankan langkah berikutnya yang paling dekat ke tujuan itu.",
        "followUp": true
      },
      {
        "id": "F4",
        "title": "Ajari saya, jangan kerjakan untuk saya",
        "when": "saat Anda ingin menguasai sebuah keterampilan sendiri.",
        "prompt": "Saya ingin belajar [keterampilan atau tugas]. Jangan langsung beri jawabannya. Pandu saya langkah demi langkah dengan pertanyaan. Biarkan saya mencoba dulu, lalu beri masukan atas jawaban saya. Kalau saya salah, beri petunjuk sebelum memberi jawaban yang benar.",
        "followUp": false
      }
    ]
  }
];
