---
title: Semua materi AIF pindah ke database
date: 2026-10-26
updated: 2026-10-26
project: Membership AI First
domain: IWDemy · AI First Program · Kelola Materi
status: data selesai, kode belum di-push
classification: L2
tags: [membership, supabase, storage, module-materials, urutan]
related:
  - docs/strategize-materials-20261009.md
  - docs/prompt-gt-storage-20261026.md
  - supabase/migrations/20261026120000_module_material_order.sql
---

# Semua materi AIF pindah ke database

Sebelumnya sebagian materi tertanam di kode. Materi seperti itu tampil sebagai "Materi bawaan situs" dan tidak bisa dihapus atau dipindah. Setelah perubahan ini, semua materi diambil dari tabel `module_materials`. Admin bisa menghapus dan mengatur urutannya dari menu Kelola Materi.

Progres "sudah dibuka" dan tautan Prompt Journal tetap aman. Ada 22 entri jurnal yang tertaut ke materi bawaan Prompt. Kolom `legacy_key` menyimpan judul lama materi, jadi ID materi tetap sama: `02:builtin:<judul>`.

## Urutan kerja

Urutan ini dibuat supaya peserta tidak pernah melihat modul yang kosong.

1. Jalankan migrasi `20261026120000_module_material_order.sql`. Isinya: kolom `sort_order` dan `legacy_key`, izin update khusus admin, dan pengisian urutan dari waktu unggah.
2. Unggah 9 file di bawah ini ke bucket `module-materials` lewat Supabase Dashboard (Storage). Supabase MCP tidak punya alat untuk mengunggah file.
3. Jalankan SQL insert di bawah. Kode yang sekarang tayang memakai baris yang judulnya sama sebagai pengganti materi bawaan, jadi tampilan peserta belum berubah.
4. Push kode baru. Sejak saat itu daftar materi diambil dari database saja.

## File yang diunggah

| Modul | Judul (harus persis) | File di repo | Path Storage |
|---|---|---|---|
| 02 | Context Setting: AI Hari Ini | `materi/Prompt/00-context-setting.html` | `prompt/20261026/00-context-setting.html` |
| 02 | M1: Ngobrol dengan AI | `materi/Prompt/01-ngobrol-dengan-ai.html` | `prompt/20261026/01-ngobrol-dengan-ai.html` |
| 02 | M2: Grounded Thinking & Learning | `materi/Prompt/02-grounded-thinking-and-learning.html` | `prompt/20261026/02-grounded-thinking-and-learning.html` |
| 02 | M3: Personal Knowledge Management | `materi/Prompt/03-personal-knowledge-management.html` | `prompt/20261026/03-personal-knowledge-management.html` |
| 02 | M4: Writing Companion | `materi/Prompt/04-writing-companion.html` | `prompt/20261026/04-writing-companion.html` |
| 02 | M5: AI Creative Partner | `materi/Prompt/05-ai-creative-partner.html` | `prompt/20261026/05-ai-creative-partner.html` |
| 03 | AI Skills Manual | `src/Level 3/Level 3 day 1.html` | `create/20261026/level-3-day-1.html` |
| 03 | CIS Prompting | `src/Level 3/Level 3 day 1.1.html` | `create/20261026/level-3-day-1-1.html` |
| 06 | AI Knowledge Operating System | `materi/ACT/AI_Knowledge_Operating_System_v0.html` | `act/20261026/ai-knowledge-operating-system-v0.html` |

Modul 04 tidak perlu diunggah karena dua materinya sudah ada di database. File terbesar adalah GT (9.310.697 byte), masih di bawah batas bucket 10 MiB.

## SQL insert (langkah 3)

```sql
begin;
insert into public.module_materials (module_id, title, url, legacy_key, sort_order)
select v.module_id, v.title, v.url, v.title, v.sort_order
from (values
  ('02','Context Setting: AI Hari Ini','storage:prompt/20261026/00-context-setting.html',1),
  ('02','M1: Ngobrol dengan AI','storage:prompt/20261026/01-ngobrol-dengan-ai.html',2),
  ('02','M2: Grounded Thinking & Learning','storage:prompt/20261026/02-grounded-thinking-and-learning.html',3),
  ('02','M3: Personal Knowledge Management','storage:prompt/20261026/03-personal-knowledge-management.html',4),
  ('02','M4: Writing Companion','storage:prompt/20261026/04-writing-companion.html',5),
  ('02','M5: AI Creative Partner','storage:prompt/20261026/05-ai-creative-partner.html',6),
  ('03','AI Skills Manual','storage:create/20261026/level-3-day-1.html',1),
  ('03','CIS Prompting','storage:create/20261026/level-3-day-1-1.html',2),
  ('06','AI Knowledge Operating System','storage:act/20261026/ai-knowledge-operating-system-v0.html',1)
) as v(module_id, title, url, sort_order)
where not exists (
  select 1 from public.module_materials m where m.module_id = v.module_id and m.legacy_key = v.title
);
commit;
```

Cek sebelum insert, untuk memastikan kesembilan file sudah ada. Hasil yang diharapkan: 9 baris.

```sql
select name, metadata->>'size' as size, metadata->>'mimetype' as mimetype
from storage.objects
where bucket_id = 'module-materials' and name like any (array['prompt/20261026/%','create/20261026/%','act/20261026/%']);
```

## Rollback

Kalau kode baru belum di-push, cukup hapus 9 baris baru. Kode lama otomatis kembali memakai file di repo.

```sql
delete from public.module_materials
where legacy_key is not null and module_id in ('02','03','06');
```

Kalau kode baru sudah tayang, kembalikan dulu kodenya dengan `git revert`, baru jalankan SQL di atas. Kolom `sort_order` dan `legacy_key` boleh dibiarkan karena tidak mengganggu kode lama.

## Hasil 26 Okt 2026

- Migrasi dijalankan. Urutan awal terisi untuk modul 01, 04, 06, dan 07. Dua materi modul 04 memakai `legacy_key`.
- 9 file diunggah memakai sesi admin di localhost. SHA-256 tiap file dicocokkan dengan file di repo sebelum diunggah, dan ukuran di Storage sama persis.
- Insert 9 baris berhasil.
- Uji di localhost dengan kode baru: Kelola Materi menampilkan urutan; tombol naik/turun tersimpan ke database (diuji lalu dikembalikan); pratinjau M1 tampil; GT di modul Prompt terbuka dari Storage.
- Belum: commit dan push. Selama kode baru belum tayang, situs produksi tetap memakai materi di repo.
