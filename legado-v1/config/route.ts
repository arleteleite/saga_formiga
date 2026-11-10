import type { Texto } from '../src/textos';

// Tela 1.3 — opções do orçamento. Nenhuma bloqueia: todas seguem para a fase 2.
// As análises são propostas do PRD (seção 2); a autora confirma o texto.

export type Rota = 'A' | 'B' | 'C';

export const rotas: Record<Rota, { rotulo: string; analise: Texto }> = {
  A: {
    rotulo: 'A. Barco rápido',
    analise: 'Rápida, mas cara. A planilha chorou, mas a formiga chegou antes do jantar.',
  },
  B: {
    rotulo: 'B. Barco barato',
    analise: 'Barata, mas lenta. A colônia contou os dias até a formiga chegar, e o pão já tinha mofado.',
  },
  C: {
    rotulo: 'C. Caminhada',
    analise: 'Sem custo, mas perigosa. A planilha aplaudiu. A formiga, nem tanto.',
  },
};
