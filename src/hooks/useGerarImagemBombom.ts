import { useState } from "react";

type Selecionados = {
  corCasquinha: string;
  tipoChocolate: string;
  base: string;
  ganache: string;
  geleia?: string;
};

export function useGerarImagemBombom() {
  const [loading, setLoading] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function gerar(selecao: Selecionados | { prompt: string }) {
    setLoading(true);
    setError(null);
    setDataUrl(null);
    try {
      const resp = await fetch("/api/stability/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selecao),
      });

      const text = await resp.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text?.slice(0, 200) || "Resposta não-JSON do servidor");
      }

      if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);

      if (!data?.dataUrl) throw new Error("Resposta inválida: sem dataUrl");

      setDataUrl(data.dataUrl);
    } catch (e: any) {
      setError(e?.message || "Erro ao gerar imagem");
    } finally {
      setLoading(false);
    }
  }

  return { gerar, loading, dataUrl, error };
}
