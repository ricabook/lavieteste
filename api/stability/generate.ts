export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { corCasquinha, tipoChocolate, base, ganache, geleia } = body as Record<string, string>;

    if (!tipoChocolate || !base || !ganache || !corCasquinha) {
      return new Response(JSON.stringify({ error: "Parâmetros incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let prompt = `Gerar a imagem de um bombom de ${tipoChocolate} com ${base}, recheio formado por ${ganache}`;
    if (geleia && geleia !== "Sem Geleia") prompt += ` e ${geleia}`;
    prompt += `. Casquinha externa pintada de ${corCasquinha}. O bombom deve ser fotorrealista, com o chocolate escolhido visível no interior. A pintura colorida deve estar apenas na casquinha externa.`;

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "STABILITY_API_KEY não configurada" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // SD3 core - aceita JSON com Accept: image/*
    const upstream = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        output_format: "png",
        aspect_ratio: "1:1",
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(JSON.stringify({ error: errText || `Stability error ${upstream.status}` }), {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buf = await upstream.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const dataUrl = `data:image/png;base64,${base64}`;

    return new Response(JSON.stringify({ dataUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
