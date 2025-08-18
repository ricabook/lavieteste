// Edge Runtime function (ESM) - /api/stability/generate.ts
export const runtime = 'edge';

const API_HOST = 'https://api.stability.ai';
const ENDPOINT = '/v2beta/stable-image/generate/sd3';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return json({ error: 'Missing STABILITY_API_KEY' }, 500);
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const prompt = body?.prompt as string;
    const aspect_ratio = (body?.aspect_ratio as string) || '1:1';
    const mode = (body?.mode as string) || 'text-to-image';
    const output_format = (body?.output_format as string) || 'png';

    if (!prompt || prompt.trim().length < 10) {
      return json({ error: 'Invalid or missing "prompt".' }, 400);
    }

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('mode', mode);
    form.append('aspect_ratio', aspect_ratio);

    const accept =
      output_format === 'jpeg' ? 'image/jpeg' :
      output_format === 'webp' ? 'image/webp' : 'image/png';

    const upstream = await fetch(`${API_HOST}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: accept,
      },
      body: form,
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return json({ error: text || `Stability error ${upstream.status}` }, upstream.status);
    }

    const arrayBuf = await upstream.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));

    return json({ dataUrl: `data:${accept};base64,${b64}` });
  } catch (err: any) {
    return json({ error: err?.message ?? 'Unknown error' }, 500);
  }
}

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(),
    },
  });
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Authorization',
  };
}
