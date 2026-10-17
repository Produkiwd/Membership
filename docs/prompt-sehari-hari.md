---
title: Prompt Sehari-hari
date: 2026-10-17
updated: 2026-10-17
project: IWDemy Membership, Prompt Studio
domain: AI First, prompt library
status: draft untuk review
classification: L2
tags: [prompt-studio, prompt-umum, anti-halu, devil-advocate]
related: [src/components/PromptDatabaseView.tsx]
---

# Prompt Sehari-hari

Kumpulan prompt pendek untuk dipakai di percakapan apa pun dengan ChatGPT, Claude, atau Gemini. Formulanya boleh apa saja. Prompt ini ditempel di awal percakapan atau di tengahnya, saat Anda butuh AI bekerja dengan cara tertentu.

Cara pakai:
1. Salin prompt.
2. Ganti bagian dalam [kurung siku] dengan isi Anda.
3. Tempel ke percakapan yang sedang berjalan, atau buka percakapan baru.

Prompt yang bertanda **Dipakai di: percakapan yang sedang berjalan** merujuk ke jawaban AI sebelumnya. Prompt ini hanya berguna kalau ditempel di percakapan yang sudah berjalan.

Total 30 prompt dalam 6 kelompok.

---

## A. Supaya AI jujur (anti-halu)

AI sering menjawab dengan yakin walaupun isinya salah. Prompt di kelompok ini memberi AI izin untuk bilang tidak tahu, dan meminta AI menunjukkan dari mana jawabannya berasal.

### A1. Izinkan AI bilang tidak tahu
**Kapan dipakai:** di awal percakapan yang menyangkut fakta, angka, aturan, atau nama.

```
Sepanjang percakapan ini, kalau kamu tidak yakin dengan sebuah fakta, angka, nama, atau tanggal, katakan "saya tidak yakin" dan jelaskan bagian mana yang tidak kamu yakini. Jangan mengarang supaya jawaban terlihat lengkap. Jawaban yang jujur dan tidak lengkap lebih berguna buat saya.
```

### A2. Jawab hanya dari dokumen
**Kapan dipakai:** saat Anda melampirkan dokumen, laporan, atau notulen, dan ingin AI tidak menambah informasi dari luar.

```
Jawab pertanyaan saya hanya berdasarkan dokumen yang saya lampirkan. Untuk setiap poin jawaban, sertakan kutipan kalimat aslinya dari dokumen. Kalau jawabannya tidak ada di dokumen, tulis "Tidak ditemukan di dokumen" dan berhenti di situ.

Pertanyaan saya: [pertanyaan]
```

### A3. Pisahkan fakta, dugaan, dan pendapat
**Kapan dipakai:** saat membaca jawaban yang terdengar meyakinkan dan Anda ingin tahu mana yang bisa dipegang.
**Dipakai di:** percakapan yang sedang berjalan

```
Tulis ulang jawabanmu barusan dan beri label di setiap poin:
FAKTA kalau bisa diperiksa dari sumber yang jelas,
DUGAAN kalau kamu menyimpulkan sendiri,
PENDAPAT kalau ini penilaian atau saran.
Untuk setiap FAKTA, sebutkan dari mana saya bisa memeriksanya.
```

### A4. Daftar hal yang perlu dicek
**Kapan dipakai:** sebelum jawaban AI dipakai untuk laporan, presentasi, atau keputusan.
**Dipakai di:** percakapan yang sedang berjalan

```
Dari jawabanmu barusan, buat daftar semua klaim yang harus saya periksa sendiri sebelum saya pakai: angka, nama, tanggal, kutipan, aturan, dan referensi. Urutkan dari yang paling berisiko kalau ternyata salah. Untuk masing-masing, sarankan cara tercepat memeriksanya.
```

### A5. Uji jawaban dengan pertanyaan balik
**Kapan dipakai:** saat jawaban penting dan Anda ingin AI memeriksa dirinya sendiri sebelum Anda percaya.
**Dipakai di:** percakapan yang sedang berjalan

```
Sebelum saya memakai jawabanmu, lakukan ini:
1. Tulis 3 sampai 5 pertanyaan yang bisa membuktikan jawabanmu salah.
2. Jawab setiap pertanyaan itu secara terpisah, tanpa melihat jawaban awalmu.
3. Bandingkan hasilnya dengan jawaban awal. Kalau ada yang tidak cocok, perbaiki jawaban awalmu dan jelaskan apa yang berubah.
```

### A6. Beri tingkat keyakinan
**Kapan dipakai:** saat AI memberi beberapa poin atau rekomendasi dan Anda perlu tahu mana yang kuat.
**Dipakai di:** percakapan yang sedang berjalan

```
Untuk setiap poin di jawabanmu, beri tingkat keyakinan: tinggi, sedang, atau rendah. Jelaskan dalam satu kalimat kenapa kamu memberi tingkat itu. Kalau keyakinanmu rendah, katakan informasi apa yang kamu butuhkan supaya lebih yakin.
```

---

## B. Berpikir kritis

AI cenderung setuju dengan penggunanya. Prompt di kelompok ini meminta AI mengambil posisi yang berlawanan supaya celah dalam ide Anda kelihatan lebih awal.

### B1. Devil's advocate
**Kapan dipakai:** saat Anda sudah yakin dengan sebuah ide dan ingin tahu titik lemahnya.

```
Jadilah devil's advocate untuk ide saya di bawah ini. Tugasmu mencari alasan kenapa ide ini bisa gagal atau keliru. Jangan memuji dan jangan memberi jalan tengah. Berikan 5 keberatan paling kuat, urutkan dari yang paling serius. Untuk tiap keberatan, jelaskan kondisi apa yang membuatnya benar-benar terjadi.

Ide saya: [ide, rencana, atau argumen]
```

### B2. Pre-mortem
**Kapan dipakai:** sebelum menjalankan proyek, program, atau perubahan.

```
Bayangkan sekarang sudah 6 bulan kemudian dan [proyek atau rencana] gagal total. Tulis cerita singkat tentang apa yang terjadi. Lalu buat daftar 5 penyebab kegagalan yang paling mungkin, tanda-tanda awal yang bisa saya lihat untuk masing-masing, dan satu langkah pencegahan yang bisa saya lakukan minggu ini.
```

### B3. Temukan asumsi tersembunyi
**Kapan dipakai:** saat rencana terasa masuk akal tapi Anda belum tahu apa saja yang sebenarnya Anda andalkan.

```
Baca rencana atau argumen saya di bawah. Tuliskan semua asumsi yang saya pakai tapi tidak saya sebut. Untuk setiap asumsi, nilai: seberapa besar kemungkinan asumsi ini salah, dan apa akibatnya kalau salah. Tandai 2 asumsi yang paling perlu saya uji dulu.

[rencana atau argumen]
```

### B4. Suarakan pihak yang tidak setuju
**Kapan dipakai:** sebelum presentasi, negosiasi, atau rapat dengan pihak yang mungkin menolak.

```
Saya akan menyampaikan [usulan] kepada [pihak, misalnya direksi, tim keuangan, atau klien]. Berperanlah sebagai orang dari pihak itu yang paling skeptis. Ajukan 7 pertanyaan atau keberatan paling sulit yang mungkin mereka sampaikan. Setelah itu, beri saran singkat cara menjawab masing-masing.
```

### B5. Bangun argumen terbaik untuk posisi lawan
**Kapan dipakai:** saat Anda berbeda pendapat dengan seseorang dan ingin memahami posisinya dengan adil.

```
Posisi saya: [posisi Anda]
Posisi orang lain: [posisi yang berlawanan]

Susun argumen terkuat untuk posisi orang lain, seolah kamu pendukungnya yang paling cerdas dan jujur. Lalu sebutkan bagian mana dari argumen itu yang paling sulit saya bantah.
```

### B6. Jangan setuju hanya karena saya yang bilang
**Kapan dipakai:** di awal percakapan yang menuntut penilaian jujur, misalnya review rencana atau tulisan.

```
Dalam percakapan ini, jangan setuju dengan saya hanya karena saya yang mengatakannya. Kalau menurutmu saya keliru, katakan langsung dan beri alasannya. Kalau saya mendebat dan argumen saya tidak lebih kuat, tetap pada penilaianmu. Saya lebih butuh penilaian yang jujur daripada yang enak didengar.
```

Untuk kritik mendalam atas dokumen penting, lihat juga **The Brutal Method** di menu Prompting Techniques.

---

## C. Cek kualitas jawaban

Jawaban pertama AI jarang yang terbaik. Prompt di kelompok ini membantu Anda mendapat jawaban yang lebih tepat sebelum dan sesudah AI menulis.

### C1. Tanya dulu sebelum menjawab
**Kapan dipakai:** saat permintaan Anda belum lengkap, atau Anda belum yakin apa yang Anda butuhkan.

```
Sebelum mengerjakan permintaan saya, ajukan pertanyaan yang kamu perlukan supaya hasilnya tepat. Maksimal 5 pertanyaan, satu per baris. Tunggu jawaban saya, baru kerjakan.

Permintaan saya: [permintaan]
```

### C2. Periksa ulang hasilmu
**Kapan dipakai:** setelah AI menghasilkan tulisan, analisis, atau rencana.
**Dipakai di:** percakapan yang sedang berjalan

```
Baca ulang hasilmu barusan seolah kamu editor yang teliti. Cari kesalahan logika, angka yang tidak konsisten, bagian yang tidak menjawab permintaan saya, dan kalimat yang membingungkan. Sebutkan temuanmu dulu, lalu tulis versi yang sudah diperbaiki.
```

### C3. Nilai dengan kriteria
**Kapan dipakai:** saat Anda punya standar yang jelas, misalnya untuk proposal, email penting, atau materi presentasi.

```
Nilai [tulisan atau hasil] dengan kriteria berikut, skor 1 sampai 5 untuk masing-masing:
[kriteria 1]
[kriteria 2]
[kriteria 3]
Untuk setiap skor di bawah 4, jelaskan apa yang kurang dan beri contoh perbaikannya.
```

### C4. Apa yang belum dibahas
**Kapan dipakai:** saat jawaban terasa rapi tapi Anda curiga ada yang terlewat.
**Dipakai di:** percakapan yang sedang berjalan

```
Dari topik ini, apa saja yang belum kamu bahas tapi penting untuk saya ketahui? Pikirkan risiko, pengecualian, pihak yang terdampak, dan hal yang biasanya dilupakan orang. Sebutkan 5 hal teratas dan jelaskan kenapa masing-masing penting.
```

### C5. Beri tiga versi yang berbeda
**Kapan dipakai:** saat Anda belum tahu arah yang paling pas untuk tulisan, judul, atau pendekatan.

```
Buat 3 versi [tulisan, judul, atau pendekatan] dengan arah yang benar-benar berbeda satu sama lain. Beri nama setiap versi sesuai pendekatannya. Di akhir, jelaskan versi mana yang paling cocok untuk [tujuan dan pembaca], dan alasannya.
```

---

## D. Kejelasan

Prompt untuk mengubah isi yang sudah ada supaya lebih mudah dipahami pembacanya.

### D1. Jelaskan seperti ke orang awam
**Kapan dipakai:** saat Anda sendiri belum paham sebuah konsep, atau harus menjelaskannya ke orang lain.

```
Jelaskan [konsep] kepada orang cerdas yang belum pernah belajar bidang ini. Pakai bahasa sehari-hari, satu analogi dari kehidupan biasa, dan satu contoh nyata. Hindari istilah teknis. Kalau terpaksa memakainya, jelaskan artinya di kalimat yang sama.
```

### D2. Ringkas untuk atasan
**Kapan dipakai:** saat Anda harus melapor ke pimpinan yang hanya punya waktu satu menit.

```
Ringkas [isi atau dokumen] untuk [jabatan pembaca] yang hanya punya waktu satu menit. Susunannya:
1. Satu kalimat inti: apa yang terjadi atau apa yang perlu diputuskan.
2. Tiga poin pendukung, masing-masing satu kalimat.
3. Apa yang saya minta dari beliau.
Maksimal 120 kata.
```

### D3. Ubah nada tulisan
**Kapan dipakai:** saat isi sudah benar tapi nadanya kurang pas untuk pembacanya.

```
Tulis ulang teks di bawah dengan nada [misalnya: lebih hangat, lebih tegas, lebih formal, lebih santai] untuk [pembaca]. Pertahankan semua isi dan fakta. Setelah itu, sebutkan 3 perubahan utama yang kamu buat.

[teks]
```

### D4. Ringkas rapat jadi tindak lanjut
**Kapan dipakai:** setelah rapat, dengan bahan notulen atau transkrip yang sudah dibersihkan dari data pribadi.

```
Dari catatan rapat di bawah, buat:
1. Keputusan yang sudah diambil.
2. Tindak lanjut dalam tabel: apa, siapa, kapan.
3. Hal yang belum diputuskan dan perlu dibahas lagi.
Kalau penanggung jawab atau tenggat tidak disebut di catatan, tulis "belum ditentukan". Jangan menebak.

[catatan rapat]
```

### D5. Dari poin ke tulisan utuh
**Kapan dipakai:** saat Anda punya poin-poin kasar dan perlu tulisan yang enak dibaca.

```
Ubah poin-poin di bawah menjadi [email, paragraf laporan, atau pengumuman] untuk [pembaca]. Pakai kalimat pendek dan bahasa yang wajar. Jangan menambah informasi yang tidak ada di poin saya. Kalau ada yang kurang jelas, tandai dengan [perlu dilengkapi].

[poin-poin]
```

---

## E. Mengambil keputusan

Prompt untuk menimbang pilihan secara lebih terstruktur. AI membantu menimbang, keputusan tetap di tangan Anda.

### E1. Bandingkan pilihan
**Kapan dipakai:** saat ada dua atau lebih pilihan dan Anda belum bisa memilih.

```
Saya harus memilih antara [pilihan A], [pilihan B], dan [pilihan C] untuk [tujuan]. Buat tabel perbandingan berdasarkan biaya, waktu, risiko, dampak, dan kemudahan menjalankannya. Lalu sebutkan pilihan mana yang paling masuk akal dalam kondisi apa, dan informasi apa yang masih saya butuhkan sebelum memutuskan.
```

### E2. Dampak lanjutan
**Kapan dipakai:** saat keputusan terlihat bagus untuk jangka pendek tapi Anda ingin melihat lebih jauh.

```
Kalau saya menjalankan [keputusan], apa dampak langsungnya? Lalu apa dampak dari dampak itu dalam 3 bulan dan 1 tahun? Pikirkan orang, biaya, proses, dan hubungan dengan pihak lain. Tandai dampak yang tidak terlihat jelas di awal.
```

### E3. Langkah pertama yang paling kecil
**Kapan dipakai:** saat tujuan terasa besar dan Anda tidak tahu harus mulai dari mana.

```
Tujuan saya: [tujuan]
Waktu dan sumber daya yang saya punya: [kondisi]

Apa satu langkah paling kecil yang bisa saya kerjakan hari ini dan langsung memberi informasi apakah saya berada di jalur yang benar? Jelaskan cara menjalankannya dan tanda bahwa langkah itu berhasil.
```

### E4. Uji keputusan dengan skenario
**Kapan dipakai:** saat keputusan bergantung pada kondisi yang belum pasti.

```
Untuk keputusan [keputusan], buat 3 skenario: kondisi terbaik, kondisi paling mungkin, dan kondisi terburuk. Untuk masing-masing, jelaskan apa yang terjadi dan apa yang perlu saya siapkan. Di akhir, nilai apakah keputusan ini masih layak dijalankan di skenario terburuk.
```

---

## F. Mengatur percakapan

Prompt untuk menjaga percakapan panjang tetap rapi dan memindahkan konteks ke percakapan baru.

### F1. Tetapkan aturan main
**Kapan dipakai:** di pesan pertama, saat Anda akan bekerja lama dengan AI untuk satu tugas.

```
Untuk seluruh percakapan ini:
Peranmu: [peran, misalnya: rekan analis, editor, pelatih]
Tujuan saya: [tujuan]
Pembaca hasil akhirnya: [pembaca]
Gaya bahasa: [misalnya: Bahasa Indonesia, kalimat pendek, tanpa istilah asing yang tidak perlu]
Kalau ada yang tidak jelas, tanya saya dulu. Kalau kamu tidak tahu, bilang tidak tahu.
```

### F2. Ringkas untuk percakapan baru
**Kapan dipakai:** saat percakapan sudah terlalu panjang dan AI mulai lupa hal yang sudah dibahas.
**Dipakai di:** percakapan yang sedang berjalan

```
Buat ringkasan dari percakapan kita yang bisa saya tempel ke percakapan baru supaya kita bisa lanjut tanpa mengulang. Isinya: tujuan, keputusan yang sudah diambil, fakta penting, hal yang sudah dicoba dan tidak berhasil, dan langkah berikutnya. Tulis dalam format yang langsung bisa ditempel.
```

### F3. Kembali ke tujuan
**Kapan dipakai:** saat percakapan mulai melebar ke mana-mana.
**Dipakai di:** percakapan yang sedang berjalan

```
Berhenti sebentar. Ingatkan saya apa tujuan awal percakapan ini, apa yang sudah kita capai, dan apa yang masih kurang. Lalu sarankan langkah berikutnya yang paling dekat ke tujuan itu.
```

### F4. Ajari saya, jangan kerjakan untuk saya
**Kapan dipakai:** saat Anda ingin menguasai sebuah keterampilan sendiri.

```
Saya ingin belajar [keterampilan atau tugas]. Jangan langsung beri jawabannya. Pandu saya langkah demi langkah dengan pertanyaan. Biarkan saya mencoba dulu, lalu beri masukan atas jawaban saya. Kalau saya salah, beri petunjuk sebelum memberi jawaban yang benar.
```

---

## Catatan untuk reviewer

1. **Nama menu.** Usulan: "Prompt Sehari-hari". Alternatif: "Prompt Utilitas", "Prompt Penolong", "Kotak Alat Prompt".
2. **Jumlah.** 30 prompt. Kalau terlalu banyak untuk tahap awal, kelompok A, B, dan C bisa didahulukan karena paling dekat dengan masukan (anti-halu dan devil's advocate).
3. **Tumpang tindih.** B1 dan B6 bersinggungan dengan The Brutal Method. Di dokumen dan aplikasi, kelompok B sudah diberi rujukan ke sana. F4 bersinggungan dengan Grounded Thinking and Learning. Perlu diputuskan apakah F4 tetap dimasukkan.
4. **Bahasa.** Semua prompt ditulis dalam Bahasa Indonesia. Perlu dicek apakah peserta juga butuh versi Inggris.
5. **D4 dan data rapat.** Prompt ini mengasumsikan catatan rapat sudah dibersihkan dari data pribadi. Perlu diputuskan apakah peringatan ini cukup ditulis di "Kapan dipakai" atau perlu catatan terpisah di aplikasi.
6. **Sumber.** Draf ini disusun dari masukan Juli dan praktik umum prompting. Belum ada sumber kanonik internal yang dirujuk. Kalau ada materi AIF yang harus jadi acuan, prompt bisa disesuaikan.
