import type { Rng } from '../../core/tipos';
import { embaralhar } from '../../core/rng';

// Remove acentos e cedilha só para comparar; a exibição usa o texto original.
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
}

export function ehLetra(c: string): boolean {
  return /^[A-Z]$/.test(normalizar(c));
}

export interface EstadoForca {
  frase: string;
  maxErros: number;
  usadas: Set<string>;
  erros: number;
}

export function criarForca(frase: string, maxErros: number): EstadoForca {
  return { frase, maxErros, usadas: new Set(), erros: 0 };
}

export type ResultadoChute = 'acerto' | 'erro' | 'repetida' | 'invalida';

export function chutar(estado: EstadoForca, tecla: string): ResultadoChute {
  const letra = normalizar(tecla);
  if (!/^[A-Z]$/.test(letra)) return 'invalida';
  if (estado.usadas.has(letra)) return 'repetida';
  estado.usadas.add(letra);
  const existe = [...estado.frase].some((c) => normalizar(c) === letra);
  if (!existe) estado.erros++;
  return existe ? 'acerto' : 'erro';
}

export interface Casa {
  char: string;
  letra: boolean;
  revelada: boolean;
}

export function casas(estado: EstadoForca): Casa[] {
  return [...estado.frase].map((c) => {
    const letra = ehLetra(c);
    return { char: c, letra, revelada: !letra || estado.usadas.has(normalizar(c)) };
  });
}

export function venceu(estado: EstadoForca): boolean {
  return casas(estado).every((c) => c.revelada);
}

export function perdeu(estado: EstadoForca): boolean {
  return estado.erros >= estado.maxErros && !venceu(estado);
}

// Sorteia frases sem repetir dentro da mesma partida.
export function sortearFrases<T>(banco: T[], quantidade: number, rng: Rng): T[] {
  return embaralhar(banco, rng).slice(0, quantidade);
}
