export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  // CORS (opcional; ajuda em testes locais/outros domínios)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const { corCasquinha, tipoChocolate, base, ganache, geleia } =
      body as Record<string, string>;

    if (!tipoChocolate || !base || !ganache || !corCasquinha) {
      return json({ error: "Parâmetros incompletos" }, 400);
    }

    // Monta o prompt
    let prompt = `Gerar a imagem de um bombom de ${tipoChocolate} com ${base}, recheio formado por ${ganache}`;
    if (geleia && geleia !== "Sem Geleia") prompt += ` e ${geleia}`;
    prompt += `. Casquinha externa pintada de ${corCasquinha}. O bombom deve ser fotorrealista, com o chocolate escolhido visível no interior. A pintura colorida deve estar apenas na casquinha externa.`;

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) return json({ error: "STABILITY_API_KEY não configurada" }, 500);

    // SD3 core aceita JSON; retornará imagem (binário). Evita FormData aqui.
    const upstream = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
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
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      return json({ error: errText || `Stability error ${upstream.status}` }, upstream.status);
    }

    // Edge Runtime não tem Buffer: converte ArrayBuffer -> base64 com btoa
    const arrayBuf = await upstream.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuf);
    return json({ dataUrl: `data:image/png;base64,${base64}` });
  } catch (err: any) {
    return json({ error: err?.message || "Erro interno" }, 500);
  }
}

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // btoa existe no Edge Runtime
  return btoa(binary);
}
