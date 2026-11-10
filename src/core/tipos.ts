import type { Texto } from '../textos';

export type Rng = () => number;

// Contrato comum dos desafios: cada módulo monta sua interface no `host`,
// chama ctx.concluir() ao vencer e devolve uma função que desmonta tudo.
export interface ContextoDesafio {
  rng: Rng;
  concluir(): void;
  // Mostra a bronca da cliente e resolve quando o jogador continua.
  bronca(): Promise<void>;
}

export type Montar<C> = (host: HTMLElement, config: C, ctx: ContextoDesafio) => () => void;

export type Pose =
  | 'formiga' | 'formiga2' | 'formiga3' | 'formiga4' | 'formiga5'
  | 'peteca' | 'peteca2' | 'peteca3'
  | 'katia' | 'katia_brava' | 'katia_seria' | 'katia_formiga' | 'katia_formiga_peteca' | 'katia_formiga_peteca_felizes';

export interface Linha {
  quem: 'formiga' | 'peteca' | 'narrador' | 'cliente';
  pose?: Pose;
  texto: Texto;
}

export interface LabirintoConfig {
  // Layout fixo ('#' parede, '.' caminho, 'S' início, 'E' saída). Se omitido, é gerado a cada partida.
  layout?: string[];
  gerar?: { colunas: number; linhas: number; passosMin: number; passosMax: number };
  // Gatilho de susto: desligado e sem conteúdo nesta aventura.
  susto?: { ativo: boolean; imagem?: string; audio?: string };
}
export interface SenhaConfig {
  digitos: number;
  tentativas: number;
  // Senha fixa opcional; null = sorteada a cada partida.
  codigo: string | null;
}
export interface ForcaConfig {
  maxErros: number;
  palavrasParaVencer: number;
  palavras: { palavra: string; dica: string }[];
}
export type OperacaoCalc = '+' | 'x' | '-' | '/' | '=';
export interface GaiolaCalc {
  celulas: [number, number][];
  op: OperacaoCalc;
  alvo: number;
}
export interface PuzzleCalc {
  tamanho: number;
  gaiolas: GaiolaCalc[];
}
export interface CalcudokuConfig {
  puzzles: PuzzleCalc[];
}

export type Fase =
  | { id: string; tipo: 'labirinto'; config: LabirintoConfig; regras: Texto[] }
  | { id: string; tipo: 'senha'; config: SenhaConfig; regras: Texto[] }
  | { id: string; tipo: 'forca'; config: ForcaConfig; regras: Texto[] }
  | { id: string; tipo: 'calcudoku'; config: CalcudokuConfig; regras: Texto[] };

export interface Parada {
  id: string;
  // Posição no mapa (mundo de 540 de largura).
  x: number;
  y: number;
  antes: Linha[];
  fase?: Fase;
  depois?: Linha[];
  // Eventos especiais da narrativa.
  petecaSeJunta?: boolean;
  final?: boolean;
}
