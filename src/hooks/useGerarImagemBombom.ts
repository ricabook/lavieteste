import { useState } from 'react';
import { buildBombomPrompt, BombomOpcao } from '../lib/buildBombomPrompt';

type GenOpts = {
  aspectRatio?: '1:1' | '4:5' | '3:2' | '16:9';
  outputFormat?: 'png' | 'jpeg' | 'webp';
  model?: 'sd3-medium' | 'sd3-large' | 'sd3-large-turbo';
  seed?: number;
};

export function useGerarImagemBombom() {
  const [loading, setLoading] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function gerar(opcoes: BombomOpcao, opts?: GenOpts) {
    setLoading(true);
    setError(null);
    setDataUrl(null);

    const { prompt, negativePrompt } = buildBombomPrompt(opcoes);

    try {
      const res = await fetch('/api/stability/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          aspectRatio: opts?.aspectRatio ?? '1:1',
          outputFormat: opts?.outputFormat ?? 'png',
          model: opts?.model ?? 'sd3-medium',
          seed: opts?.seed,
        }),
      });

      if (!res.ok) {
        // Trata erros de resposta do servidor
        let errorMessage = 'Falha ao gerar imagem';
        const contentType = res.headers.get('content-type');
        
        // Se a resposta for JSON, tenta extrair a mensagem de erro
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const json = await res.json();
          errorMessage = json?.error || errorMessage;
        } else {
          // Se não for JSON, lê o corpo da resposta como texto
          errorMessage = await res.text();
        }
        
        throw new Error(errorMessage);
      }

      // Se a resposta foi bem-sucedida, processa como JSON
      const json = await res.json();
      setDataUrl(json.dataUrl);
      return json.dataUrl as string;
      
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao gerar imagem');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { gerar, loading, dataUrl, error, setDataUrl };
}