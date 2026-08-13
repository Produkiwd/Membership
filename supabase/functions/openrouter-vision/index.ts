import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

type VisionPayload = {
  target?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  imageDataUrl?: string;
};

const allowedTargets = new Set([
  'Pohon', 'Bunga', 'Kaktus', 'Rumput', 'Kelinci', 'Ular', 'Burung',
  'Unta', 'Hiu', 'Gurita', 'Kepiting', 'Ikan', 'Jamur',
]);

const allowedOrigins = new Set([
  'https://member.sinau.tech',
  'http://localhost:3000',
  'http://localhost:4173',
]);

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://member.sinau.tech',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const jsonResponse = (origin: string | null, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });

const difficultyRule = (difficulty: VisionPayload['difficulty'], target: string) => {
  if (difficulty === 'easy') {
    return `Bersikap sangat ramah dan toleran. Jika ada kemiripan siluet dasar atau goresan yang sekilas menyerupai '${target}', berikan kelulusan.`;
  }

  if (difficulty === 'hard') {
    return `Nilai dengan ketat dan teliti. Gambar harus jelas, proporsional, dan benar-benar merepresentasikan '${target}'. Tolak garis acak, gambar abstrak, atau gambar yang terlalu sederhana.`;
  }

  return `Nilai secara adil dan seimbang. Gambar harus memiliki bentuk dasar dan elemen penting yang secara umum dapat dikenali sebagai '${target}'.`;
};

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return jsonResponse(origin, { error: 'Method not allowed.' }, 405);
  }

  if (origin && !allowedOrigins.has(origin)) {
    return jsonResponse(origin, { error: 'Origin not allowed.' }, 403);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  const openRouterModel = Deno.env.get('OPENROUTER_MODEL') || 'google/gemini-2.5-flash';
  const authorization = req.headers.get('Authorization') || '';

  if (!supabaseUrl || !anonKey || !openRouterApiKey) {
    return jsonResponse(origin, { error: 'AI service is not configured.' }, 503);
  }

  if (!authorization.startsWith('Bearer ')) {
    return jsonResponse(origin, { error: 'Silakan login kembali untuk memakai penilaian AI.' }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse(origin, { error: 'Sesi login tidak valid atau sudah berakhir.' }, 401);
  }

  const { data: profile, error: profileError } = await userClient.rpc('membership_get_my_profile');
  const allowedPortals = profile?.allowedPortals || profile?.allowed_portals || [];
  if (profileError || !Array.isArray(allowedPortals) || !allowedPortals.includes('sinad')) {
    return jsonResponse(origin, { error: 'Akun ini tidak memiliki akses ke SinaD.' }, 403);
  }

  let payload: VisionPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(origin, { error: 'Invalid JSON body.' }, 400);
  }

  const target = payload.target?.trim() || '';
  const difficulty = payload.difficulty || 'medium';
  const imageDataUrl = payload.imageDataUrl || '';

  if (!allowedTargets.has(target)) {
    return jsonResponse(origin, { error: 'Target gambar tidak valid.' }, 400);
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return jsonResponse(origin, { error: 'Tingkat kesulitan tidak valid.' }, 400);
  }

  if (!imageDataUrl.startsWith('data:image/jpeg;base64,') || imageDataUrl.length > 2_500_000) {
    return jsonResponse(origin, { error: 'Data gambar tidak valid atau terlalu besar.' }, 400);
  }

  const prompt = `Kamu adalah juri game edukasi untuk siswa. Gambar putih di atas latar hitam diklaim sebagai '${target}'.
Nilai apakah gambar cukup menyerupai '${target}'. ${difficultyRule(difficulty, target)}
Kembalikan JSON murni dengan bentuk: {"matched": true atau false, "feedback": "umpan balik singkat dan ramah dalam bahasa Indonesia"}.`;

  try {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://member.sinau.tech',
        'X-Title': 'SinaD Interactive Game',
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!openRouterResponse.ok) {
      console.error('OpenRouter request failed:', openRouterResponse.status, await openRouterResponse.text());
      return jsonResponse(origin, { error: 'Layanan AI sedang tidak tersedia. Silakan coba lagi.' }, 502);
    }

    const openRouterData = await openRouterResponse.json();
    const replyText = openRouterData?.choices?.[0]?.message?.content?.trim();
    if (!replyText) {
      return jsonResponse(origin, { error: 'Respons AI tidak lengkap.' }, 502);
    }

    const cleanedReply = replyText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanedReply);
    if (typeof result.matched !== 'boolean') {
      return jsonResponse(origin, { error: 'Format penilaian AI tidak valid.' }, 502);
    }

    return jsonResponse(origin, {
      matched: result.matched,
      feedback: typeof result.feedback === 'string' ? result.feedback.slice(0, 300) : '',
    });
  } catch (error) {
    console.error('OpenRouter vision error:', error);
    return jsonResponse(origin, { error: 'Penilaian AI gagal diproses. Silakan coba lagi.' }, 502);
  }
});
