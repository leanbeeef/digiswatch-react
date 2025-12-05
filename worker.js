const PALETTE_PATH = '/api/generate-palette-from-prompt';
const SEASON_PATH = '/api/analyze-color-season';
const MAX_PROMPT_BYTES = 2000;
const MAX_IMAGE_BYTES = 2_500_000; // ~2.5MB; keep reasonable for Workers
const MIN_PROMPT_LEN = 6;
// Raise the rate limit to effectively unlimited for owner use; adjust down if abuse observed.
const RATE_LIMIT = 1000; // per window (shared across endpoints)
const RATE_WINDOW_SECONDS = 60 * 60;
const REQUEST_TIMEOUT_MS = 12000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders, ...extraHeaders },
  });

const callOpenAI = async ({ env, messages, response_format, max_tokens }) => {
  if (!env.OPENAI_API_KEY) {
    return { error: json({ error: 'OPENAI_API_KEY not set' }, 500) };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        response_format,
        max_tokens,
      }),
      signal: controller.signal,
    });
    const text = await resp.text();
    if (!resp.ok) {
      return { error: json({ error: 'Upstream error', detail: text || resp.statusText }, resp.status) };
    }
    return { data: JSON.parse(text) };
  } catch (err) {
    const status = err?.name === 'AbortError' ? 504 : 502;
    return { error: json({ error: 'OpenAI request failed', detail: err?.message }, status) };
  } finally {
    clearTimeout(timeoutId);
  }
};

const rateLimit = async (request, env) => {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const rlKey = `rl:${ip}`;
  const currentRaw = await env.RL_KV.get(rlKey);
  const current = currentRaw ? parseInt(currentRaw, 10) || 0 : 0;
  if (current >= RATE_LIMIT) {
    return { error: json({ error: 'Rate limit exceeded' }, 429) };
  }
  await env.RL_KV.put(rlKey, String(current + 1), { expirationTtl: RATE_WINDOW_SECONDS });
  return {};
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return json({ error: 'Unsupported media type' }, 415);
    }

    const bodyText = await request.text();

    if (path === PALETTE_PATH) {
      if (bodyText.length > MAX_PROMPT_BYTES) {
        return json({ error: 'Payload too large' }, 413);
      }
      let prompt = '';
      try {
        const parsed = JSON.parse(bodyText);
        prompt = (parsed.prompt || '').toString().trim();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }
      if (prompt.length < MIN_PROMPT_LEN) {
        return json({ error: 'Prompt too short' }, 400);
      }

      const rl = await rateLimit(request, env);
      if (rl.error) return rl.error;

      const { data, error } = await callOpenAI({
        env,
        messages: [
          {
            role: 'system',
            content:
              'You are a color theory expert. Generate a color palette based on the user description. Return ONLY JSON: { "colors": ["#hex1", ...], "explanation": "Short explanation of why these colors were chosen." }. 5-8 colors.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });
      if (error) return error;

      const content = data?.choices?.[0]?.message?.content;
      if (!content) return json({ error: 'Invalid response from model' }, 502);

      try {
        const parsed = JSON.parse(content);
        return json(parsed, 200);
      } catch {
        return json({ error: 'Failed to parse model response' }, 502);
      }
    }

    if (path === SEASON_PATH) {
      if (bodyText.length > MAX_IMAGE_BYTES) {
        return json({ error: 'Payload too large' }, 413);
      }
      let image = '';
      try {
        const parsed = JSON.parse(bodyText);
        image = (parsed.image || '').toString();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }

      if (!image || image.length < 50) {
        return json({ error: 'Image is required' }, 400);
      }

      const rl = await rateLimit(request, env);
      if (rl.error) return rl.error;

      const { data, error } = await callOpenAI({
        env,
        messages: [
          {
            role: 'system',
            content: `You are a professional personal color analyst. Analyze the person in the image to determine their seasonal color palette (Spring, Summer, Autumn, Winter, including sub-seasons like Soft Autumn, Deep Winter, etc.).
Return ONLY a JSON object with this EXACT structure:
{
  "season": "Name of Season (e.g. Soft Autumn)",
  "description": "Brief description of their features and why they fit this season.",
  "face_breakdown": {
    "skin_color": "#hex_code_of_skin",
    "eye_color": "#hex_code_of_eyes",
    "hair_color": "#hex_code_of_hair"
  },
  "seasonal_palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5", "#hex6", "#hex7", "#hex8"],
  "makeup_suggestions": {
    "lipstick": ["#hex1", "#hex2", "#hex3"],
    "blush": ["#hex1", "#hex2", "#hex3"],
    "eyeshadow": ["#hex1", "#hex2", "#hex3"]
  }
}`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this person\'s color season.' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      });
      if (error) return error;

      const content = data?.choices?.[0]?.message?.content;
      if (!content) return json({ error: 'Invalid response from model' }, 502);

      try {
        const parsed = JSON.parse(content);
        return json(parsed, 200);
      } catch {
        return json({ error: 'Failed to parse model response' }, 502);
      }
    }

    return json({ error: 'Not found' }, 404);
  },
};
