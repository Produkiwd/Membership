# Deploy admin-create-member-user

Function ini dipakai admin panel Membership untuk membuat Supabase Auth user + membership access dalam satu langkah.

## Deploy

Jalankan dari root repo:

```powershell
npx supabase functions deploy admin-create-member-user --project-ref uyqgionbubycyfdmweai
```

Jika CLI meminta login:

```powershell
npx supabase login
```

## Secrets

Supabase Edge Functions biasanya otomatis menyediakan:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Jika function mengembalikan error `Supabase function secrets are not configured.`, set secret service role dari Supabase Dashboard:

```powershell
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="ISI_SERVICE_ROLE_KEY" --project-ref uyqgionbubycyfdmweai
```

Jangan taruh `service_role` key di frontend atau file `.env` Vite.

## Setelah Deploy

1. Login ke `http://localhost:3000/` sebagai `stephen.tssgroup@gmail.com`.
2. Masuk ke Admin Panel.
3. Isi email + password pada form Tambah Member Baru.
4. Klik Tambah.
5. Atur group, role, tier, akses portal, dan expiry di baris member.
