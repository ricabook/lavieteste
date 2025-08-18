import { VercelRequest, VercelResponse } from '@vercel/node';

// Importe as dependências necessárias
const {
  STABILITY_API_KEY
} = process.env;

const engineId = "stable-diffusion-3-medium";
const apiHost = "https://api.stability.ai";

// Altere a exportação de `exports.default` para `export default`
export default async function (req: VercelRequest, res: VercelResponse) {
  if (!STABILITY_API_KEY) {
    return res.status(500).json({
      error: "Missing Stability API key."
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  const {
    prompt,
    negativePrompt,
    aspectRatio,
    outputFormat,
    model
  } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Missing 'prompt' in request body."
    });
  }

  try {
    const response = await fetch(
      `${apiHost}/v2beta/stable-image/generate/${model || engineId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "image/*",
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio: aspectRatio,
          output_format: outputFormat,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: errorText || "Failed to generate image."
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/${outputFormat};base64,${base64}`;

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      dataUrl
    });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({
      error: `Internal Server Error: ${error}`
    });
  }
}