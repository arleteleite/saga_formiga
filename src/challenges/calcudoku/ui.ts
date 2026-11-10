import { h, botao } from '../../core/dom';
import { inteiro } from '../../core/rng';
import type { CalcudokuConfig, Montar, OperacaoCalc, PuzzleCalc } from '../../core/tipos';
import { tocar } from '../../core/audio';
import { analisar, novaGrade, type Grade } from './engine';

const SIMBOLO: Record<OperacaoCalc, string> = { '+': '+', x: '×', '-': '−', '/': '÷', '=': '' };

export const montarCalcudoku: Montar<CalcudokuConfig> = (host, cfg, ctx) => {
  const puzzle: PuzzleCalc = cfg.puzzles[inteiro(ctx.rng, cfg.puzzles.length)]!;
  const n = puzzle.tamanho;
  let grade: Grade = novaGrade(n);
  let sel: [number, number] = [0, 0];
  let resolvido = false;

  const gaiolaDe = new Map<string, number>();
  puzzle.gaiolas.forEach((g, i) => g.celulas.forEach(([l, c]) => gaiolaDe.set(`${l},${c}`, i)));
  // Primeira célula (leitura) de cada gaiola recebe o rótulo.
  const rotuloEm = new Map<string, number>();
  puzzle.gaiolas.forEach((g, i) => {
    const [l, c] = [...g.celulas].sort((a, b) => a[0] - b[0] || a[1] - b[1])[0]!;
    rotuloEm.set(`${l},${c}`, i);
  });

  const tabuleiro = h('div', { class: 'calc-grade', style: `grid-template-columns: repeat(${n}, 1fr)`, role: 'grid' });
  const aviso = h('div', { class: 'aviso', role: 'status' });
  const teclado = h('div', { class: 'teclado teclado-calc' });
  const celulas: HTMLElement[][] = [];

  for (let l = 0; l < n; l++) {
    celulas[l] = [];
    for (let c = 0; c < n; c++) {
      const el = h('div', { class: 'calc-celula', role: 'gridcell', tabindex: '-1', 'data-pos': `${l},${c}` });
      const lado = (dl: number, dc: number): boolean => gaiolaDe.get(`${l + dl},${c + dc}`) !== gaiolaDe.get(`${l},${c}`);
      if (lado(-1, 0)) el.classList.add('b-cima');
      if (lado(1, 0)) el.classList.add('b-baixo');
      if (lado(0, -1)) el.classList.add('b-esq');
      if (lado(0, 1)) el.classList.add('b-dir');
      el.addEventListener('click', () => selecionar(l, c));
      celulas[l]![c] = el;
      tabuleiro.append(el);
    }
  }

  function selecionar(l: number, c: number): void {
    if (resolvido) return;
    sel = [l, c];
    desenhar();
  }

  function definir(valor: number): void {
    if (resolvido) return;
    grade[sel[0]]![sel[1]!] = valor;
    desenhar();
    const a = analisar(puzzle, grade);
    if (valor !== 0) tocar(a.conflitos.size || a.gaiolasErradas.size ? 'erro' : 'clique');
    if (a.resolvido) {
      resolvido = true;
      aviso.textContent = 'Resolvido! A porta se abriu.';
      window.setTimeout(() => ctx.concluir(), 1200);
    }
  }

  function reiniciar(): void {
    if (resolvido) return;
    grade = novaGrade(n);
    sel = [0, 0];
    aviso.textContent = '';
    desenhar();
  }

  function desenhar(): void {
    const a = analisar(puzzle, grade);
    for (let l = 0; l < n; l++) {
      for (let c = 0; c < n; c++) {
        const el = celulas[l]![c]!;
        const k = `${l},${c}`;
        const gi = gaiolaDe.get(k)!;
        const v = grade[l]![c]!;
        el.replaceChildren();
        if (rotuloEm.has(k)) {
          const g = puzzle.gaiolas[rotuloEm.get(k)!]!;
          el.append(h('span', { class: 'calc-rotulo' }, `${g.alvo}${SIMBOLO[g.op]}`));
        }
        el.append(h('span', { class: 'calc-valor' }, v ? String(v) : ''));
        el.classList.toggle('sel', sel[0] === l && sel[1] === c);
        el.classList.toggle('conflito', a.conflitos.has(k));
        el.classList.toggle('gaiola-errada', a.gaiolasErradas.has(gi));
        el.setAttribute('aria-label', `Linha ${l + 1}, coluna ${c + 1}${v ? `, valor ${v}` : ', vazia'}`);
      }
    }
    if (!resolvido) {
      aviso.textContent = a.conflitos.size
        ? 'Há números repetidos na mesma linha ou coluna (em vermelho).'
        : a.gaiolasErradas.size
          ? 'Alguma gaiola não bate com o resultado (borda vermelha).'
          : '';
    }
  }

  for (let v = 1; v <= n; v++) teclado.append(botao(String(v), () => definir(v), 'tecla'));
  teclado.append(botao('⌫', () => definir(0), 'tecla'), botao('Reiniciar', reiniciar, 'tecla reiniciar'));

  const aoTeclar = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[1-9]$/.test(e.key) && Number(e.key) <= n) definir(Number(e.key));
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') definir(0);
    else if (e.key === 'ArrowUp') selecionar(Math.max(0, sel[0] - 1), sel[1]);
    else if (e.key === 'ArrowDown') selecionar(Math.min(n - 1, sel[0] + 1), sel[1]);
    else if (e.key === 'ArrowLeft') selecionar(sel[0], Math.max(0, sel[1] - 1));
    else if (e.key === 'ArrowRight') selecionar(sel[0], Math.min(n - 1, sel[1] + 1));
  };
  document.addEventListener('keydown', aoTeclar);

  host.append(h('h2', { class: 'titulo-desafio' }, 'O enigma da porta'), tabuleiro, aviso, teclado);
  desenhar();

  return () => document.removeEventListener('keydown', aoTeclar);
};
