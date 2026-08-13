# Deploy openrouter-vision

Function ini menjadi proxy aman antara SinaD Interactive Game dan OpenRouter. Pengguna harus login dan memiliki akses portal `sinad`.

## Secret

Gunakan API key OpenRouter baru. Jangan gunakan kembali key yang pernah tertanam di file HTML atau GitHub.

```powershell
npx supabase secrets set OPENROUTER_API_KEY="ISI_KEY_BARU" --project-ref uyqgionbubycyfdmweai
```

Model dapat diatur tanpa mengubah kode melalui secret opsional `OPENROUTER_MODEL`.

## Deploy

Function memvalidasi JWT dan akses SinaD di dalam handler, sehingga deploy menggunakan `--no-verify-jwt` agar kompatibel dengan publishable key Supabase terbaru.

```powershell
npx supabase functions deploy openrouter-vision --no-verify-jwt --project-ref uyqgionbubycyfdmweai
```

## Pemeriksaan

1. Login ke `https://member.sinau.tech/` menggunakan akun yang memiliki akses SinaD.
2. Buka `Aplikasi AI` lalu jalankan SinaD Interactive Game.
3. Gambar objek dan klik `Oke Selesai & Nilai AI`.
4. Pastikan browser tidak meminta OpenRouter API key.
