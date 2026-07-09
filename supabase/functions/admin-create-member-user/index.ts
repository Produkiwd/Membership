import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

type CreateMemberPayload = {
  email?: string;
  password?: string;
  name?: string | null;
  role?: string | null;
  tier?: string | null;
  groupName?: string | null;
  allowedPortals?: string[] | null;
  expiresAt?: string | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const normalizeEmail = (email?: string) => email?.trim().toLowerCase() || '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'Supabase function secrets are not configured.' }, 500);
  }

  const authorization = req.headers.get('Authorization') || '';
  if (!authorization) {
    return jsonResponse({ error: 'Missing authorization header.' }, 401);
  }

  let payload: CreateMemberPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400);
  }

  const email = normalizeEmail(payload.email);
  const password = payload.password || '';

  if (!email) {
    return jsonResponse({ error: 'Email wajib diisi.' }, 400);
  }

  if (password.length < 6) {
    return jsonResponse({ error: 'Password minimal 6 karakter.' }, 400);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });

  const { data: isAdmin, error: adminError } = await userClient.rpc('membership_is_admin');
  if (adminError || !isAdmin) {
    return jsonResponse({ error: 'Admin access required.' }, 403);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: authData, error: createAuthError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: payload.name || email.split('@')[0],
    },
  });

  const duplicateAuth =
    createAuthError?.message?.toLowerCase().includes('already') ||
    createAuthError?.message?.toLowerCase().includes('registered') ||
    createAuthError?.message?.toLowerCase().includes('duplicate');

  if (createAuthError && !duplicateAuth) {
    return jsonResponse({ error: createAuthError.message }, 400);
  }

  const { data: member, error: memberError } = await userClient.rpc('membership_admin_create_member', {
    p_email: email,
    p_name: payload.name || email.split('@')[0],
    p_role: payload.role || 'member',
    p_tier: payload.tier || 'Professional',
    p_group_name: payload.groupName || null,
    p_allowed_portals: payload.allowedPortals?.length ? payload.allowedPortals : ['aif'],
    p_expires_at: payload.expiresAt || null,
  });

  if (memberError) {
    if (authData?.user?.id) {
      await serviceClient.auth.admin.deleteUser(authData.user.id);
    }

    return jsonResponse({ error: memberError.message }, 400);
  }

  return jsonResponse({
    member,
    authUserCreated: !duplicateAuth,
  });
});
