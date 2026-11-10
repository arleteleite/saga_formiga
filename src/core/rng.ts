import type { Rng } from './tipos';

export function inteiro(rng: Rng, max: number): number {
  return Math.floor(rng() * max);
}

export function embaralhar<T>(lista: T[], rng: Rng): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = inteiro(rng, i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
