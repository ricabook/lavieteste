
export type BombomOpcao = {
  corCasquinha: string;   // 'Sem pintura' | 'Vermelho' | ...
  tipoChocolate: string;  // 'Chocolate ao Leite Belga' | ...
  base: string;           // ex: 'base crocante de chocolate com sucrilhos'
  ganache: string;        // ex: 'ganache de morango'
  geleia?: string;        // ex: 'geléia de morango' | 'Sem geléia'
};

function normalizar(str?: string) {
  return (str || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export function buildBombomPrompt(o: BombomOpcao) {
  const geleiaNorm = normalizar(o.geleia);
  // aceita "Sem geléia" / "Sem geleia" / variações
  const temGeleia = !!o.geleia && geleiaNorm !== 'sem geleia' && geleiaNorm !== 'sem geleia';
  // (a condição acima parece duplicada mas cobre inputs com e sem acento após normalização)

  const pintura =
    normalizar(o.corCasquinha) === 'sem pintura'
      ? 'sem pintura na casquinha'
      : `casquinha externa pintada na cor ${o.corCasquinha}`;

  const estrutura = temGeleia
    ? `- 10% (${o.base}); - 70% (${o.ganache}); - 20% (${o.geleia});`
    : `- 10% (${o.base}); - 90% (${o.ganache});`;

  const basePrompt =
    `Foto de produto hiper-realista, bombom artesanal de ${o.tipoChocolate}, ${pintura}. ` +
    `O bombom está cortado ao meio, mostrando claramente a seção interna. ` +
    `Estrutura interna (de baixo para cima) com cortes limpos e camadas bem definidas: ${estrutura} ` +
    `Iluminação de estúdio suave, fundo neutro, foco nítido, detalhes de textura do chocolate e recheio. ` +
    `Sem texto, sem logos, sem mãos, sem utensílios, sem objetos extras.`;

  const negativePrompt =
    "texto, legenda, marca d'água, mãos, pessoas, talheres, pratos, migalhas exageradas, deformações, borrado, baixa resolução, múltiplos bombons, colagem";

  return { prompt: basePrompt, negativePrompt };
}
