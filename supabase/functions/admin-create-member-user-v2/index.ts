import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { provisionMember } from './provision.ts';
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const respond = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = req.headers.get('Authorization');
  if (!url || !anon || !service) return respond({ error: 'Konfigurasi layanan belum lengkap.' }, 503);
  if (!authorization) return respond({ error: 'Silakan login kembali.' }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: identity, error: identityError } = await userClient.auth.getUser();
  if (identityError || !identity.user) return respond({ error: 'Silakan login kembali.' }, 401);
  const { data: admin, error: adminError } = await userClient.rpc('membership_is_admin');
  if (adminError || !admin) return respond({ error: 'Admin access required.' }, 403);
  let payload: any;
  try { payload = await req.json(); } catch { return respond({ error: 'Format permintaan tidak valid.' }, 400); }
  const serviceClient = createClient(url, service, { auth: { persistSession: false } });
  const result = await provisionMember(payload, {
    validate: async (email, input) => {
      const { data, error } = await userClient.rpc('membership_admin_validate_create_v2', { p_email: email, p_input: input });
      if (error) throw new Error(error.code === 'PGRST202' ? 'Integrasi database belum aktif.' : error.message);
      return data;
    },
    createAuth: async (email, password) => {
      const { data, error } = await serviceClient.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name: email.split('@')[0] } });
      if (error) throw new Error('Akun login belum berhasil dibuat. Coba lagi atau periksa akun yang sudah ada.');
      return !!data.user;
    },
    saveMember: async (email, input) => {
      const { data, error } = await userClient.rpc('membership_admin_create_member_v2', { p_email: email, p_name: email.split('@')[0], p_input: input });
      if (error) throw new Error(error.message);
      return data;
    },
  });
  return respond(result.body, result.status);
});
