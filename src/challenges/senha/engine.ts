import type { Rng } from '../../core/tipos';
import { embaralhar } from '../../core/rng';

// Bulls and Cows numérico: dígitos distintos, zero inicial permitido.

export function gerarSegredo(rng: Rng, digitos: number): string {
  return embaralhar(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], rng).slice(0, digitos).join('');
}

export type ErroPalpite = 'tamanho' | 'nao-numerico' | 'repetido';

export function validarPalpite(palpite: string, digitos: number): ErroPalpite | null {
  if (!/^\d*$/.test(palpite)) return 'nao-numerico';
  if (palpite.length !== digitos) return 'tamanho';
  if (new Set(palpite).size !== palpite.length) return 'repetido';
  return null;
}

export interface Resultado {
  certos: number; // dígito certo na posição certa
  deslocados: number; // dígito certo na posição errada
}

export function avaliar(segredo: string, palpite: string): Resultado {
  let certos = 0;
  let deslocados = 0;
  for (let i = 0; i < palpite.length; i++) {
    if (palpite[i] === segredo[i]) certos++;
    else if (segredo.includes(palpite[i]!)) deslocados++;
  }
  return { certos, deslocados };
}
