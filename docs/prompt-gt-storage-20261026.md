---
title: Rencana memindahkan Grounded Thinking (modul 02) ke Supabase Storage
date: 2026-10-26
updated: 2026-10-26
project: Membership AI First
domain: IWDemy · AI First Program · Modul 02 Prompt
status: draft, menunggu persetujuan
classification: L2
tags: [membership, supabase, storage, grounded-thinking, module-materials]
related:
  - docs/strategize-materials-20261009.md
  - src/lib/artifactProgress.ts
  - src/lib/materi.ts
---

# Rencana: GT pindah ke Supabase Storage

Status: **draft, belum ada yang dijalankan.** Belum ada unggahan, SQL, maupun push.

## Ringkasan

GT tetap tampil di urutan M2, dan progres peserta tidak hilang. Isinya diambil dari Storage. File lama di repo tetap ada dan dipakai sebagai cadangan otomatis kalau Supabase gagal dimuat.

## Temuan yang membuat cara modul 01 tidak bisa disalin mentah

Modul 01 dikosongkan dari kode (`'01': []`), lalu semua materinya diisi dari database. Cara itu tidak bisa langsung dipakai untuk GT, karena modul 02 masih punya lima materi lain di dalam kode. Ada tiga masalah:

1. **Baris dengan judul yang sama disembunyikan.** `buildArtifactList` membuang baris database yang judulnya sama dengan materi bawaan. Akibatnya, baris "M2: Grounded Thinking & Learning" tidak akan pernah tampil.
2. **Baris dengan judul lain masuk ke urutan paling akhir.** Urutannya jadi M1, M3, M4, M5, lalu GT di belakang. ID-nya juga berubah dari `02:builtin:…` menjadi `02:remote:…`, sehingga **progres "sudah dibuka" dan tautan Prompt Journal peserta untuk GT hilang.**
3. **Semua HTML dari Storage diunduh begitu modul dibuka.** Ini dilakukan `resolveMaterialUrl`. Untuk GT, artinya setiap peserta yang membuka modul Prompt langsung mengunduh 9,3 MB, walaupun yang mau dibuka M1. Saat ini GT baru diunduh ketika diklik.

## Perubahan kode (kecil, dua file)

1. `src/lib/artifactProgress.ts`: kalau ada baris database dengan judul **persis sama** dengan materi bawaan, isi materi bawaan itu diambil dari database. Posisi dan ID-nya tetap, jadi progres dan Prompt Journal aman. Kalau baris database tidak ada atau gagal dimuat, materi bawaan dari repo dipakai seperti sekarang.
2. `src/lib/materi.ts`: HTML dari Storage baru diunduh saat materinya diklik, lewat `load()` yang sudah dipakai materi bawaan. Ini berlaku juga untuk HTML modul 01. Hasilnya, membuka modul tidak lagi mengunduh semua file sekaligus.
3. Tambah satu tes kecil untuk aturan nomor 1, lalu jalankan `npm run lint` dan `npm run build`.

Override ini berlaku untuk semua modul. Karena itu, SQL pengecekan di bawah dijalankan dulu untuk memastikan belum ada baris database yang judulnya kebetulan sama dengan materi bawaan.

## File dan path

| | Nilai |
|---|---|
| File sumber | `materi/Prompt/02-grounded-thinking-and-learning.html`, isinya sama dengan build WEB GT 21 Okt 2026 |
| Ukuran | 9.310.697 byte (8,88 MiB). Batas bucket 10.485.760 byte, dan batas ini tidak diubah |
| SHA-256 | `3a902f5b7ccecf4d4179599bcdb9a9f3e2ec6b68d3810360e3ae8100ae437d71` |
| Bucket | `module-materials` (privat, tidak diubah) |
| Path Storage | `prompt/20261026/02-grounded-thinking-and-learning.html` |
| ID baris | `7fcfd4df-d8a8-5435-997e-7d3c64db8b4d` (UUID v5 dari path, stabil) |
| Judul | `M2: Grounded Thinking & Learning`, harus persis sama dengan judul di `App.tsx` |

## SQL

### 1. Pengecekan sebelum mulai (hanya membaca)

Hasil yang diharapkan: **0 baris**. Kalau ada hasil, berhenti dulu dan bahas.

```sql
select id, module_id, title, url, created_at
from public.module_materials
where (module_id, title) in (
  ('02','Context Setting: AI Hari Ini'), ('02','M1: Ngobrol dengan AI'),
  ('02','M2: Grounded Thinking & Learning'), ('02','M3: Personal Knowledge Management'),
  ('02','M4: Writing Companion'), ('02','M5: AI Creative Partner'),
  ('03','AI Skills Manual'), ('03','CIS Prompting'),
  ('04','Thinking w/ Claude AI'), ('04','Setup Claude'),
  ('06','AI Knowledge Operating System')
);
```

### 2. Insert setelah file terunggah

```sql
begin;
insert into public.module_materials (id, module_id, title, url, section, created_at) values
('7fcfd4df-d8a8-5435-997e-7d3c64db8b4d', '02', 'M2: Grounded Thinking & Learning',
 'storage:prompt/20261026/02-grounded-thinking-and-learning.html', null, now())
on conflict (id) do nothing;
commit;
```

### 3. Cek file di Storage (hanya membaca)

Hasil yang diharapkan: size `9310697` dan mimetype `text/html`.

```sql
select name, metadata->>'size' as size, metadata->>'mimetype' as mimetype, created_at
from storage.objects
where bucket_id = 'module-materials' and name = 'prompt/20261026/02-grounded-thinking-and-learning.html';
```

### 4. Rollback (hanya kalau perlu)

Rollback cukup menghapus satu baris. Setelah itu aplikasi otomatis kembali memakai file di repo, **tanpa deploy ulang**. File di Storage dibiarkan.

```sql
begin;
delete from public.module_materials
where module_id = '02' and id = '7fcfd4df-d8a8-5435-997e-7d3c64db8b4d';
commit;
```

## Urutan kerja

Urutannya dibuat supaya peserta tidak pernah melihat keadaan setengah jadi.

1. Jalankan **SQL 1**. Kalau hasilnya 0 baris, lanjut.
2. Ubah kode (dua file dan tes), lalu jalankan lint dan build. **Belum di-push.**
3. Unggah file ke path di atas. Supabase MCP tidak punya alat unggah Storage, jadi pilih salah satu cara:
   - **a. Anda unggah lewat Supabase Dashboard:** Storage → `module-materials` → buat folder `prompt/20261026/` → unggah file dengan nama `02-grounded-thinking-and-learning.html`.
   - **b. Anda unggah sendiri lewat Supabase CLI** yang sudah login di komputer Anda.
4. Jalankan **SQL 3** untuk mencocokkan ukuran file, lalu **SQL 2** untuk insert. Kode di produksi sekarang masih menyembunyikan baris ini (lihat temuan 1), jadi peserta belum melihat perubahan apa pun.
5. Push ke `main` supaya kode baru ter-deploy. Mulai saat itu GT diambil dari Storage.
6. Uji di member.sinau.tech:
   - GT tetap di posisi M2, dan tanda "sudah dibuka" masih ada.
   - Video pembuka bisa diputar.
   - Navigasi dan dialog bekerja.
   - Tidak ada galat JS.
   - Modul Prompt tidak lagi mengunduh 9 MB saat dibuka.
   - Modul 01 tetap normal.
7. Tulis catatan akhir di dokumen ini: hasil uji dan manifest.

SQL 1 sampai 3 bisa saya jalankan lewat Supabase MCP setelah Anda mengotorisasinya dengan `/mcp` di terminal `claude`. Cara lain, Anda tempel sendiri di SQL Editor.

## Yang perlu Anda putuskan

- **Persetujuan rencana ini**, termasuk perubahan kode yang juga berlaku untuk HTML modul 01 (dimuat saat diklik).
- **Push ke `main` ikut menayangkan 2 commit Prompt Sehari-hari tanggal 17 Okt yang belum di-push**, yaitu `f561783` dan `35b40bc`. Commit `bc015c0` (GT terbaru di repo, yang menjadi cadangan) juga ikut.
- **Cara unggah:** 3a atau 3b.

## Hasil 26 Okt 2026

**Langkah 2 selesai.** Kode di commit `8a37b37`. `npm run lint` lulus, `npm run build` lulus, dan `node --test tests/artifact-progress.test.ts` lulus 3/3. Belum di-push.

**SQL 1 menemukan 4 baris dengan judul yang sama dengan materi bawaan.** Saat ini keempatnya tersembunyi:

| Modul | Judul | Path Storage |
|---|---|---|
| 03 | AI Skills Manual | `create/f3c8f3f0-…-Level-3-day-1.html` |
| 03 | CIS Prompting | `create/2c50fa09-…-Level-3-day-1.1.html` |
| 04 | Thinking w/ Claude AI | `think/1018ab59-…-thinking.html` |
| 04 | Setup Claude | `think/c40fb513-…-setup.html` |

Isinya identik dengan file di repo: eTag (MD5) di Storage sama persis dengan MD5 versi yang di-commit, dan ukurannya juga sama. Setelah kode baru tayang, keempat materi ini akan diambil dari Storage, tapi **isi yang dilihat peserta tidak berubah**. Posisi dan ID progresnya juga tetap.

Modul 02 belum punya baris database sama sekali. Di Storage ada file GT lama (`prompt/bc6fcc13-…-02_Grounded_Thinking_and_Learning_v6-claude_WEB.html`, 7,58 MB) tanpa baris database. File itu tidak dipakai, dan dibiarkan apa adanya.

## Ke depan

Kalau GT diganti lagi, cukup unggah file baru ke path bertanggal yang baru, lalu ubah `url` di baris yang sama. Tidak perlu deploy.

```sql
update public.module_materials set url = 'storage:prompt/<tanggal>/02-grounded-thinking-and-learning.html'
where id = '7fcfd4df-d8a8-5435-997e-7d3c64db8b4d';
```

Catatan: kode akan mengunduh ulang file saat materi dibuka, jadi tidak ada masalah cache lama.
