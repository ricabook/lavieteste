
// Vercel Serverless Function (Node runtime)
import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_HOST = 'https://api.stability.ai';
const ENDPOINT = '/v2beta/stable-image/generate/sd3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Missing STABILITY_API_KEY' });
      return;
    }

    // Body pode vir como string no Vercel em alguns casos
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      prompt,
      negativePrompt,
      aspectRatio = '1:1',
      outputFormat = 'png',
      seed,
      model = 'sd3-medium'
    } = body;

    if (!prompt) {
      res.status(400).json({ error: 'prompt is required' });
      return;
    }

    const upstream = await fetch(`${API_HOST}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/*', // retorna imagem binária
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        aspect_ratio: aspectRatio,     // "1:1" | "4:5" | "3:2" | "16:9" etc.
        output_format: outputFormat,   // "png" | "jpeg" | "webp"
        model,                         // "sd3-medium" | "sd3-large" | "sd3-large-turbo"
        seed,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      res.status(502).json({ error: `Stability error: ${upstream.status} - ${text}` });
      return;
    }

    const arrayBuf = await upstream.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString('base64');
    const mime = outputFormat === 'jpeg' ? 'image/jpeg' :
                 outputFormat === 'webp' ? 'image/webp' : 'image/png';

    res.status(200).json({ dataUrl: `data:${mime};base64,${base64}` });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Unknown error' });
  }
}
