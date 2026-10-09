# Integrasi Kelola Member — rencana penerapan

Tanggal audit: 9 Oktober 2026. Cakupan: member.sinau.tech.

## Yang sudah disiapkan di lokal

- Tambah dan edit memakai konfigurasi tier yang sama: AIF, AIF How To, Internal, SinaD.
- Atur Tier mengatur portal, kotak, role akun, masa berlaku, serta peran dan izin belajar SinaD.
- Strategize otomatis untuk pilihan AIF How To. Think dan Thinking With Claude memiliki ID izin terpisah.
- Daftar portal berupa ringkasan. Urutan kolom dipertahankan.
- Batch memakai katalog database; tambah batch tidak menimpa batch dengan nama mirip.
- Simpan memakai respons transaksi database. Kesalahan tidak ditampilkan sebagai sukses.
- Konflik edit diperiksa melalui updated_at; perubahan yang usang ditolak.
- Masa berlaku hingga akhir tanggal WIB; kosong berarti tanpa batas.
- Prompt Studio mengikuti pilihan kotak; Strategize saja dan SinaD saja tidak mendapat akses.
- IDL website diaktifkan saat member diberi akses AIF, walaupun IDL tidak dipilih sebagai portal di hub.

## Bukti audit baca saja

Data member aktif memakai membership.members, membership.groups, membership.program_access dan membership.website_access. Tabel public.memberships kosong dan tidak dipakai untuk alur ini. Ada 187 member tidak dihapus, termasuk akun yang masa berlakunya habis. RPC daftar yang aktif menyembunyikan akun kedaluwarsa.

Layanan tambah member versi lama memakai Auth, addressbook.people, dan RPC membership_admin_create_member. Fungsi itu membuat atau menghubungkan identitas pusat, sehingga alur tersebut tetap dipakai di dalam transaksi baru.

module_materials saat audit dapat dibaca semua pengguna terautentikasi; file ada pada bucket privat module-materials. Migrasi menambahkan kebijakan pembatas untuk memeriksa izin modul dan masa berlaku.

## Tindakan yang memerlukan persetujuan Stephen

1. Terapkan hanya supabase/migrations/20261009015015_member_access_v2.sql melalui apply_migration. Jangan menjalankan db push seluruh direktori: riwayat migrasi server lebih lengkap daripada salinan repo ini.
2. Deploy fungsi baru admin-create-member-user-v2 beserta provision.ts, dengan verify_jwt=true. Fungsi lama tetap tersedia.
3. Jalankan audit struktur setelah penerapan dan uji localhost. Push website merupakan langkah terpisah.

SQL tersebut menambahkan:

- Tabel privat membership.member_access_v2_history, RLS aktif, tanpa akses langsung untuk anon/authenticated/service_role.
- Helper validasi, pembacaan, resolusi batch, dan pemulihan di skema membership; akses langsung dibatasi.
- RPC public baru untuk katalog member/batch, profil sendiri, tambah batch, simpan member, validasi tambah, dan tambah member.
- Dua kebijakan RLS pembatas SELECT: module_materials dan storage.objects khusus bucket module-materials.

Migrasi tidak melakukan backfill member, tidak menghapus baris/file, dan tidak mengganti tanda tangan RPC lama. Tier lama ditampilkan sebagai kategori baru saat dibaca. Ketika admin menekan Simpan, pilihan tersimpan di metadata.accessV2 dan tier_code lama diperbarui sebagai proyeksi kompatibilitas. Metadata dashboard lain tetap dipertahankan.

## Dependensi dan batas dampak

- Auth users, addressbook.people, membership.roles/tiers/groups/programs/websites dan RPC identitas lama harus tetap tersedia.
- Simpan memperbarui role/tier/group/expiry dan metadata milik member; program aif/idl/sinad serta website member/idl/sinau. Program/website lain tidak ditimpa.
- Tier kompatibilitas: Internal→internal; enam kotak AIF→leaders; Strategize/Prompt/Create→professional; Claude saja→twc; AI Operating System saja→ai_os; SinaD tanpa AIF→sinad_teacher atau sinad_student; kombinasi lain→community. Pilihan rinci tetap di accessV2.
- Dashboard lain yang masih membaca tier_code hanya mendapat proyeksi tersebut. Pembacaan akses rinci oleh IDL/SinaD eksternal belum terverifikasi; tidak mengklaim seluruh ekosistem telah mengikuti accessV2.
- Materi Think dan Claude masih berbagi sumber 04. Kebijakan membolehkan pembacaan sumber bersama itu bagi pemilik izin Think ATAU Claude. Pemisahan file materi dapat dilakukan kemudian jika isinya perlu berbeda.
- RLS baru berdampak pada semua pembaca tabel/bucket materi itu, termasuk aplikasi lain jika memakai sumber yang sama. Akun tanpa akses AIF aktif akan ditolak.
- Materi bawaan dan Prompt Studio masih ada dalam bundle frontend; pembatas tampilan bukan perlindungan terhadap ekstraksi isi bundle. RLS hanya melindungi materi Supabase.
- Auth dan transaksi Postgres tidak atomik bersama. Jika Auth berhasil tetapi member gagal, akun dipertahankan dan UI memberikan petunjuk retry. Retry menggunakan akun yang ada, tidak mengganti sandinya. Tidak ada penghapusan akun otomatis pada fungsi baru.

## Cadangan dan pemulihan

Sebelum setiap edit, server menyimpan keadaan awal member serta program/website akses ke tabel privat history dalam transaksi yang sama. Password, token, dan dump peserta tidak masuk repo/artifact.

Pemulihan satu edit dilakukan hanya setelah tindakan pemulihan itu disetujui, melalui SQL pemilik database:

    select membership.restore_member_access_v2(:member_id, :history_id);

Gunakan parameter, bukan contoh data peserta. Fungsi menolak cadangan selain entri terbaru atau member yang sudah berubah lagi. Pemulihan juga dicadangkan. Tidak ada penghapusan member, akun Auth, maupun batch. Pembuatan member baru tidak dibatalkan dengan menghapusnya; penonaktifan harus disetujui terpisah.

Jika rollout menyebabkan masalah:

1. Hentikan penyimpanan v2 melalui pencabutan EXECUTE untuk authenticated pada RPC tulis v2 (SQL lengkap ada di docs/member-access-v2-pause.sql).
2. Pakai kembali build website sebelumnya; tabel history dan data akses tetap disimpan.
3. Bila pembatas materi perlu dikembalikan sementara, ubah dua policy baru menjadi USING (true) sesuai file pause. Ini membuka kembali batas baca lama sehingga memerlukan persetujuan tersendiri.
4. Tinjau dan pulihkan edit satu per satu menggunakan history. Jangan hapus tabel/fungsi sebagai jalan pintas.

## Pemeriksaan yang telah dijalankan

- TypeScript frontend: lulus.
- Build Vite: lulus; peringatan bundle besar masih ada.
- Deno check layanan tambah member: lulus.
- Uji unit akses, mapping tier, provisioning gagal/retry dan logout harian: 56 lulus.
- PostgreSQL lokal melalui PGlite, dengan fixture struktur/RPC hasil audit dan data sintetis: 15 pemeriksaan lulus, termasuk transaksi, RLS, penolakan non-admin, expiry, backup dan recovery.
- HTTP localhost dan transform komponen MemberManagement: 200.
- Pemeriksaan tampilan browser belum berhasil karena runtime browser gagal dimulai.
- Status penerapan terbaru tercatat di bagian berikut. Login/pembuatan akun Auth asli dan pemeriksaan visual browser belum diuji; push/deploy website belum dijalankan.


## Hasil penerapan — 9 Oktober 2026

Stephen menyetujui migrasi awal dan deployment fungsi baru, lalu menyetujui khusus koreksi timestamp setelah pemeriksaan persetujuan otomatis meminta persetujuan tambahan.

- Migrasi member_access_v2 berhasil diterapkan ke project yang diaudit.
- Fungsi admin-create-member-user-v2 ACTIVE, versi 1, verify_jwt=true. Fungsi lama dipertahankan.
- Migrasi koreksi member_access_v2_trigger_timestamp_fix berhasil diterapkan. Trigger set_updated_at lama dipertahankan; simpan/pemulihan mengambil updated_at dari hasil UPDATE yang sebenarnya untuk history.
- Baca katalog dan profil memakai konteks admin di database berhasil: 32 member dengan masa berlaku yang belum habis, 7 batch, semua konfigurasi akses versi 2. Total member tetap 187; tidak ada pemindahan/penghapusan peserta.
- Uji sintetis pada database aktif dijalankan di subtransaksi yang dibatalkan. Lulus: tambah/simpan akses, Strategize otomatis, kecocokan timestamp cadangan, penolakan edit usang, pemulihan, pembedaan Think/Claude, RLS materi, penolakan non-admin, serta pemeriksaan tidak ada perubahan data yang bertahan.
- Tidak dibuat akun Auth baru untuk pengujian tersebut. Tabel history tetap kosong setelah transaksi uji dibatalkan.
- Endpoint fungsi menolak permintaan tanpa login (401); OPTIONS/CORS merespons 200.
- Security Advisor terkait objek baru hanya memberi INFO RLS enabled without policy pada tabel history. Ini disengaja: tabel privat tidak memiliki akses klien atau policy baca langsung. Rujukan: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Localhost merespons 200. Pembukaan tab lokal diminta melalui Codex; runtime kontrol browser masih gagal, sehingga tampilan dan klik dari browser belum diverifikasi.
- Pembuatan akun Auth melalui happy path Edge Function belum diuji dengan akun baru sungguhan. Uji orchestration kegagalan/retry dan SQL pembuatan member sudah lulus.
- Website belum dipush. Daftar peserta yang ada belum diedit secara massal; akses rinci akan tersimpan ketika admin menekan Simpan.

## Verifikasi rilis frontend — 9 Oktober 2026

- Push ke main menjalankan workflow Build and Deploy to VPS (Membership). Workflow ini hanya membangun dan menyalin dist; tidak menjalankan migrasi database.
- Rilis disusun di atas origin/main terbaru. Prompt Studio dan EntranceLoading dari GitHub dipertahankan, termasuk tombol dari materi menuju latihan dan Formula Studio.
- Penyebab halaman kosong setelah login berhasil direproduksi di browser: timer logout harian dipanggil dengan receiver objek Clock, menghasilkan TypeError: Illegal invocation. Pemanggilan timer diperbaiki melalui fungsi pembungkus dan ditambahkan tes regresi yang mensimulasikan persyaratan timer browser.
- TypeScript dan build produksi lulus. Masih ada peringatan ukuran bundle besar.
- 57 tes unit dan 15 pemeriksaan PostgreSQL sintetis lulus. Pemeriksaan ini tidak mengubah Supabase aktif.
- Uji browser build produksi memakai sesi dan respons API sintetis yang terisolasi: dashboard AIF, daftar member, dialog Atur Tier, Prompt Studio, Kelola Materi, dan logout sesi hari sebelumnya tampil tanpa exception JavaScript.
- Pembuatan akun Auth baru sungguhan, pengiriman email reset, dan penyimpanan peserta asli tidak dijalankan sebagai bagian dari pemeriksaan rilis ini.
- Artefak browser lokal, profil uji, salinan worktree, dan arsip HTML tidak disertakan dalam commit.
