import type { PuzzleCalc } from '../../src/core/tipos';

// Puzzles 5x5 pré-construídos. Solução única verificada por tests/calcudoku.test.ts.
// Para trocar ou adicionar puzzles, edite esta lista e rode `npm test`.
export const puzzlesCalcudoku: PuzzleCalc[] = [
  {
    tamanho: 5,
    gaiolas: [
      { celulas: [[0, 3], [1, 3]], op: '-', alvo: 4 },
      { celulas: [[4, 3], [4, 4]], op: '-', alvo: 1 },
      { celulas: [[3, 3], [3, 2], [3, 1]], op: 'x', alvo: 20 },
      { celulas: [[3, 4], [2, 4]], op: '-', alvo: 3 },
      { celulas: [[2, 0], [2, 1], [1, 1]], op: 'x', alvo: 16 },
      { celulas: [[3, 0], [4, 0], [4, 1]], op: '+', alvo: 6 },
      { celulas: [[0, 4], [1, 4]], op: 'x', alvo: 3 },
      { celulas: [[0, 2], [0, 1]], op: '-', alvo: 1 },
      { celulas: [[4, 2]], op: '=', alvo: 5 },
      { celulas: [[1, 2], [2, 2]], op: '-', alvo: 1 },
      { celulas: [[1, 0], [0, 0]], op: '-', alvo: 3 },
      { celulas: [[2, 3]], op: '=', alvo: 2 },
    ],
  },
  {
    tamanho: 5,
    gaiolas: [
      { celulas: [[1, 0], [0, 0], [1, 1]], op: '+', alvo: 6 },
      { celulas: [[1, 4], [1, 3], [0, 3]], op: 'x', alvo: 10 },
      { celulas: [[3, 4], [4, 4], [3, 3]], op: '+', alvo: 9 },
      { celulas: [[3, 1]], op: '=', alvo: 5 },
      { celulas: [[2, 4], [2, 3]], op: '-', alvo: 2 },
      { celulas: [[2, 0], [2, 1]], op: '+', alvo: 5 },
      { celulas: [[0, 2], [0, 1], [1, 2]], op: '+', alvo: 12 },
      { celulas: [[4, 0], [4, 1]], op: '-', alvo: 1 },
      { celulas: [[0, 4]], op: '=', alvo: 4 },
      { celulas: [[2, 2], [3, 2]], op: '-', alvo: 1 },
      { celulas: [[4, 3], [4, 2]], op: '/', alvo: 3 },
      { celulas: [[3, 0]], op: '=', alvo: 2 },
    ],
  },
  {
    tamanho: 5,
    gaiolas: [
      { celulas: [[1, 4], [1, 3]], op: '+', alvo: 8 },
      { celulas: [[4, 3], [3, 3]], op: '+', alvo: 7 },
      { celulas: [[4, 2], [3, 2]], op: '-', alvo: 1 },
      { celulas: [[2, 3], [2, 2], [2, 4]], op: 'x', alvo: 40 },
      { celulas: [[1, 1], [1, 2], [0, 1]], op: 'x', alvo: 10 },
      { celulas: [[4, 0], [4, 1]], op: '-', alvo: 1 },
      { celulas: [[3, 0], [2, 0]], op: '-', alvo: 1 },
      { celulas: [[0, 2], [0, 3]], op: '-', alvo: 3 },
      { celulas: [[3, 4], [4, 4]], op: '+', alvo: 6 },
      { celulas: [[0, 4]], op: '=', alvo: 2 },
      { celulas: [[0, 0], [1, 0]], op: '-', alvo: 1 },
      { celulas: [[2, 1], [3, 1]], op: '-', alvo: 2 },
    ],
  },
  {
    tamanho: 5,
    gaiolas: [
      { celulas: [[3, 1], [2, 1]], op: '+', alvo: 3 },
      { celulas: [[3, 4], [2, 4], [2, 3]], op: '+', alvo: 10 },
      { celulas: [[1, 4], [0, 4], [1, 3]], op: '+', alvo: 8 },
      { celulas: [[4, 4], [4, 3]], op: '-', alvo: 2 },
      { celulas: [[0, 0], [0, 1]], op: '-', alvo: 1 },
      { celulas: [[2, 0], [3, 0]], op: '/', alvo: 5 },
      { celulas: [[1, 2]], op: '=', alvo: 4 },
      { celulas: [[2, 2], [3, 2], [4, 2]], op: 'x', alvo: 15 },
      { celulas: [[1, 0], [1, 1]], op: '-', alvo: 2 },
      { celulas: [[3, 3]], op: '=', alvo: 3 },
      { celulas: [[0, 2], [0, 3]], op: '/', alvo: 2 },
      { celulas: [[4, 0], [4, 1]], op: '/', alvo: 2 },
    ],
  },
];
