
import React from 'react';
import { useGerarImagemBombom } from '../hooks/useGerarImagemBombom';

type Props = {
  selecao: {
    corCasquinha: string;
    tipoChocolate: string;
    base: string;
    ganache: string;
    geleia?: string;
  };
  aspectRatio?: '1:1' | '4:5' | '3:2' | '16:9';
  outputFormat?: 'png' | 'jpeg' | 'webp';
  model?: 'sd3-medium' | 'sd3-large' | 'sd3-large-turbo';
};

export default function GeradorBombom({ selecao, aspectRatio = '1:1', outputFormat = 'png', model = 'sd3-medium' }: Props) {
  const { gerar, loading, dataUrl, error } = useGerarImagemBombom();

  return (
    <div className="space-y-4">
      <button
        onClick={() => gerar(selecao)}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
      >
        {loading ? 'Gerando…' : 'Gerar imagem do bombom'}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {dataUrl && (
        <div className="mt-2">
          <img
            src={dataUrl}
            alt="Bombom gerado por IA"
            className="rounded-xl shadow-md max-w-full h-auto"
          />
          <a
            href={dataUrl}
            download={`bombom.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`}
            className="inline-block mt-3 text-sm underline"
          >
            Baixar imagem
          </a>
        </div>
      )}
    </div>
  );
}
