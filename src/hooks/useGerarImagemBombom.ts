import { useState } from "react";

interface SelecaoGeracao {
  corCasquinha: string;
  tipoChocolate: string;
  base: string;
  ganache: string;
  geleia?: string;
}

export function useGerarImagemBombom() {
  const [loading, setLoading] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gerar = async (selecao: SelecaoGeracao) => {
    setLoading(true);
    setError(null);
    setDataUrl(null);

    try {
      const response = await fetch("/api/stability/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selecao),
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar imagem: ${response.status}`);
      }

      const result = await response.json();

      if (result.imageBase64) {
        setDataUrl(`data:image/png;base64,${result.imageBase64}`);
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err: any) {
      console.error("Erro ao gerar imagem:", err);
      setError("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return { gerar, loading, dataUrl, error };
}
