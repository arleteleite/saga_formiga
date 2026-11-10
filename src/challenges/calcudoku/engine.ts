import type { GaiolaCalc, PuzzleCalc } from '../../core/tipos';

export type Grade = number[][]; // 0 = vazio

export function novaGrade(tamanho: number): Grade {
  return Array.from({ length: tamanho }, () => Array<number>(tamanho).fill(0));
}

export function gaiolaCumprida(g: GaiolaCalc, valores: number[]): boolean {
  switch (g.op) {
    case '=':
      return valores[0] === g.alvo;
    case '+':
      return valores.reduce((a, b) => a + b, 0) === g.alvo;
    case 'x':
      return valores.reduce((a, b) => a * b, 1) === g.alvo;
    case '-':
      return valores.length === 2 && Math.abs(valores[0]! - valores[1]!) === g.alvo;
    case '/': {
      if (valores.length !== 2) return false;
      const maior = Math.max(...valores);
      const menor = Math.min(...valores);
      return menor > 0 && maior % menor === 0 && maior / menor === g.alvo;
    }
  }
}

export interface Analise {
  // Células ("l,c") que repetem valor na linha ou coluna.
  conflitos: Set<string>;
  // Índices de gaiolas totalmente preenchidas que não batem com o alvo.
  gaiolasErradas: Set<number>;
  completo: boolean;
  resolvido: boolean;
}

export function analisar(puzzle: PuzzleCalc, grade: Grade): Analise {
  const n = puzzle.tamanho;
  const conflitos = new Set<string>();
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        const va = grade[i]![a]!;
        if (va !== 0 && va === grade[i]![b]) {
          conflitos.add(`${i},${a}`);
          conflitos.add(`${i},${b}`);
        }
        const ca = grade[a]![i]!;
        if (ca !== 0 && ca === grade[b]![i]) {
          conflitos.add(`${a},${i}`);
          conflitos.add(`${b},${i}`);
        }
      }
    }
  }
  const gaiolasErradas = new Set<number>();
  puzzle.gaiolas.forEach((g, i) => {
    const valores = g.celulas.map(([l, c]) => grade[l]![c]!);
    if (valores.every((v) => v !== 0) && !gaiolaCumprida(g, valores)) gaiolasErradas.add(i);
  });
  const completo = grade.every((l) => l.every((v) => v !== 0));
  return {
    conflitos,
    gaiolasErradas,
    completo,
    resolvido: completo && conflitos.size === 0 && gaiolasErradas.size === 0,
  };
}

// Conta soluções (até `limite`). Usado nos testes para garantir solução única.
export function contarSolucoes(puzzle: PuzzleCalc, limite = 2): number {
  return resolver(puzzle, limite).total;
}

// Busca por força bruta. `primeira` é a primeira solução achada (usada em testes).
export function resolver(puzzle: PuzzleCalc, limite = 2): { total: number; primeira: Grade | null } {
  const n = puzzle.tamanho;
  const grade = novaGrade(n);
  let primeira: Grade | null = null;
  const gaiolaDe = new Map<string, number>();
  puzzle.gaiolas.forEach((g, i) => g.celulas.forEach(([l, c]) => gaiolaDe.set(`${l},${c}`, i)));
  let total = 0;

  const gaiolaOk = (i: number): boolean => {
    const g = puzzle.gaiolas[i]!;
    const v = g.celulas.map(([l, c]) => grade[l]![c]!);
    if (v.some((x) => x === 0)) return !(g.op === '+' && v.reduce((a, b) => a + b, 0) > g.alvo);
    return gaiolaCumprida(g, v);
  };

  const buscar = (k: number): void => {
    if (total >= limite) return;
    if (k === n * n) {
      total++;
      primeira ??= grade.map((l) => [...l]);
      return;
    }
    const l = Math.floor(k / n);
    const c = k % n;
    for (let v = 1; v <= n; v++) {
      let repetido = false;
      for (let j = 0; j < c; j++) if (grade[l]![j] === v) repetido = true;
      for (let i = 0; i < l; i++) if (grade[i]![c] === v) repetido = true;
      if (repetido) continue;
      grade[l]![c] = v;
      if (gaiolaOk(gaiolaDe.get(`${l},${c}`)!)) buscar(k + 1);
      grade[l]![c] = 0;
    }
  };
  buscar(0);
  return { total, primeira };
}

// Estrutura válida: gaiolas cobrem a grade inteira, sem sobreposição.
export function estruturaValida(puzzle: PuzzleCalc): boolean {
  const visto = new Set<string>();
  for (const g of puzzle.gaiolas) {
    for (const [l, c] of g.celulas) {
      const k = `${l},${c}`;
      if (visto.has(k) || l < 0 || c < 0 || l >= puzzle.tamanho || c >= puzzle.tamanho) return false;
      visto.add(k);
    }
  }
  return visto.size === puzzle.tamanho ** 2;
}
