export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => ({} as any));

    // Aceita formato A: { prompt: string }
    let prompt = (typeof body?.prompt === "string" ? body.prompt : "").trim();

    // Ou formato B: { corCasquinha, tipoChocolate, base, ganache, geleia }
    if (!prompt) {
      const missing: string[] = [];
      const corCasquinha = body?.corCasquinha as string | undefined;
      const tipoChocolate = body?.tipoChocolate as string | undefined;
      const base = body?.base as string | undefined;
      const ganache = body?.ganache as string | undefined;
      const geleia = body?.geleia as string | undefined;

      if (!tipoChocolate) missing.push("tipoChocolate");
      if (!base) missing.push("base");
      if (!ganache) missing.push("ganache");
      if (!corCasquinha) missing.push("corCasquinha");

      if (missing.length) {
        return json({ error: `Parâmetros incompletos: ${missing.join(", ")}` }, 400);
      }

      let p = `Gerar a imagem de um bombom de ${tipoChocolate} com ${base}, recheio formado por ${ganache}`;
      if (geleia && geleia !== "Sem Geleia") p += ` e ${geleia}`;
      p += `. Casquinha externa pintada de ${corCasquinha}. O bombom deve ser fotorrealista, com o chocolate escolhido visível no interior. A pintura colorida deve estar apenas na casquinha externa.`;
      prompt = p;
    }

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) return json({ error: "STABILITY_API_KEY não configurada" }, 500);

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
      return json({ error: errText || `Stability error ${upstream.status}` }, upstream.status);
    }

    const buf = await upstream.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
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
  return btoa(binary);
}
