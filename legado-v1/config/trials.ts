import { pendente, type Texto } from '../src/textos';

// Tela 3.2 — infiltração. Cada cômodo tem três opções e uma escolha certa.
// O objeto certo de cada cômodo vem do roteiro (sala, banheiro e cozinha: pano;
// panela: colher). As opções erradas são rascunhos e precisam de confirmação.
// A pista de cada cômodo é da autora, e fica pendente até ser escrita.
// Os alertas da guardiã estão em client-texts.ts.

export interface Comodo {
  id: 'sala' | 'banheiro' | 'cozinha' | 'panela';
  opcoes: string[];
  // Índice da opção certa dentro de opcoes.
  correta: number;
  pista: Texto;
}

export const comodos: Comodo[] = [
  {
    id: 'sala',
    opcoes: ['vassoura', 'pano', 'sabão'],
    correta: 1,
    pista: pendente('pista da sala (autora)'),
  },
  {
    id: 'banheiro',
    opcoes: ['sabão', 'pano', 'esponja'],
    correta: 1,
    pista: pendente('pista do banheiro (autora)'),
  },
  {
    id: 'cozinha',
    opcoes: ['rodo', 'pano', 'vassoura'],
    correta: 1,
    pista: pendente('pista da cozinha (autora)'),
  },
  {
    id: 'panela',
    opcoes: ['garfo', 'colher', 'concha'],
    correta: 1,
    pista: pendente('pista da panela (autora)'),
  },
];

// Tela 3.3 — pistas. Cada sequência tem uma resposta certa e opções para os botões.
// A primeira é o exemplo do roteiro (3, 6, 12, ? → 24). As outras duas são
// rascunhos: o briefing deixa as sequências a definir, e a autora confirma.

export interface Sequencia {
  termos: number[];
  resposta: number;
  // Opções dos botões. A resposta certa precisa estar aqui.
  opcoes: number[];
}

export const sequencias: Sequencia[] = [
  {
    termos: [3, 6, 12],
    resposta: 24,
    opcoes: [18, 24, 30, 36],
  },
  {
    termos: [5, 10, 20],
    resposta: 40,
    opcoes: [30, 40, 45, 50],
  },
  {
    termos: [2, 3, 5, 7, 11],
    resposta: 13,
    opcoes: [12, 13, 14, 15],
  },
];
