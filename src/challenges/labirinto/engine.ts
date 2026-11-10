export interface Labirinto {
  linhas: number;
  colunas: number;
  paredes: boolean[][];
  inicio: { c: number; l: number };
  saida: { c: number; l: number };
}

export function criarLabirinto(layout: string[]): Labirinto {
  let inicio: Labirinto['inicio'] | null = null;
  let saida: Labirinto['saida'] | null = null;
  const paredes = layout.map((linha, l) =>
    [...linha].map((ch, c) => {
      if (ch === 'S') inicio = { c, l };
      if (ch === 'E') saida = { c, l };
      return ch === '#';
    }),
  );
  if (!inicio || !saida) throw new Error('Labirinto precisa de S e E');
  return { linhas: layout.length, colunas: layout[0]!.length, paredes, inicio, saida };
}

// Posições em unidades de célula (1 = uma célula). Círculo de raio r.
export function colide(lab: Labirinto, x: number, y: number, r: number): boolean {
  const c0 = Math.floor(x - r);
  const c1 = Math.floor(x + r);
  const l0 = Math.floor(y - r);
  const l1 = Math.floor(y + r);
  for (let l = l0; l <= l1; l++) {
    for (let c = c0; c <= c1; c++) {
      const parede = l < 0 || c < 0 || l >= lab.linhas || c >= lab.colunas || lab.paredes[l]![c]!;
      if (!parede) continue;
      const px = Math.max(c, Math.min(x, c + 1));
      const py = Math.max(l, Math.min(y, l + 1));
      if ((x - px) ** 2 + (y - py) ** 2 < r * r) return true;
    }
  }
  return false;
}

export function centroInicio(lab: Labirinto): { x: number; y: number } {
  return { x: lab.inicio.c + 0.5, y: lab.inicio.l + 0.5 };
}

export type ResultadoMovimento = 'ok' | 'bateu' | 'saida';

// Move com varredura: divide o deslocamento em passos menores que o raio,
// para um movimento rápido não atravessar uma parede fina.
export function mover(
  lab: Labirinto,
  pos: { x: number; y: number },
  dx: number,
  dy: number,
  r: number,
): { pos: { x: number; y: number }; resultado: ResultadoMovimento } {
  const dist = Math.hypot(dx, dy);
  const passos = Math.max(1, Math.ceil(dist / (r * 0.4)));
  let x = pos.x;
  let y = pos.y;
  for (let i = 1; i <= passos; i++) {
    x = pos.x + (dx * i) / passos;
    y = pos.y + (dy * i) / passos;
    if (colide(lab, x, y, r)) return { pos: centroInicio(lab), resultado: 'bateu' };
    if (Math.floor(x) === lab.saida.c && Math.floor(y) === lab.saida.l) return { pos: { x, y }, resultado: 'saida' };
  }
  return { pos: { x, y }, resultado: 'ok' };
}

// Existe caminho entre início e saída? (BFS nas células livres)
export function temSolucao(lab: Labirinto): boolean {
  const fila: [number, number][] = [[lab.inicio.c, lab.inicio.l]];
  const visto = new Set([`${lab.inicio.c},${lab.inicio.l}`]);
  while (fila.length) {
    const [c, l] = fila.shift()!;
    if (c === lab.saida.c && l === lab.saida.l) return true;
    for (const [dc, dl] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nc = c + dc;
      const nl = l + dl;
      if (nc < 0 || nl < 0 || nc >= lab.colunas || nl >= lab.linhas) continue;
      if (lab.paredes[nl]![nc] || visto.has(`${nc},${nl}`)) continue;
      visto.add(`${nc},${nl}`);
      fila.push([nc, nl]);
    }
  }
  return false;
}

// Passos (células) do caminho mais curto entre S e E; -1 se não houver.
export function passosAteSaida(lab: Labirinto): number {
  const fila: [number, number, number][] = [[lab.inicio.c, lab.inicio.l, 0]];
  const visto = new Set([`${lab.inicio.c},${lab.inicio.l}`]);
  while (fila.length) {
    const [c, l, d] = fila.shift()!;
    if (c === lab.saida.c && l === lab.saida.l) return d;
    for (const [dc, dl] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nc = c + dc;
      const nl = l + dl;
      if (nc < 0 || nl < 0 || nc >= lab.colunas || nl >= lab.linhas) continue;
      if (lab.paredes[nl]![nc] || visto.has(`${nc},${nl}`)) continue;
      visto.add(`${nc},${nl}`);
      fila.push([nc, nl, d + 1]);
    }
  }
  return -1;
}

export interface ParametrosLabirinto {
  // Tamanho em "salas" (a grade final tem 2n+1 células por lado).
  colunas: number;
  linhas: number;
  // Faixa aceita de passos do caminho mais curto (nem longo demais, nem trivial).
  passosMin: number;
  passosMax: number;
}

// Gera um labirinto perfeito (uma única rota entre quaisquer pontos) por busca em
// profundidade. Início embaixo à esquerda, saída em cima à direita.
export function gerarLayout(rng: () => number, p: ParametrosLabirinto): string[] {
  for (let tentativa = 0; tentativa < 500; tentativa++) {
    const layout = gerarUmLayout(rng, p.colunas, p.linhas);
    const n = passosAteSaida(criarLabirinto(layout));
    if (n >= p.passosMin && n <= p.passosMax) return layout;
  }
  // Raro: nenhuma tentativa caiu na faixa; devolve o último gerado (ainda solúvel).
  return gerarUmLayout(rng, p.colunas, p.linhas);
}

function gerarUmLayout(rng: () => number, W: number, H: number): string[] {
  const g: string[][] = Array.from({ length: 2 * H + 1 }, () => Array<string>(2 * W + 1).fill('#'));
  const visto = new Set<string>();
  const pilha: [number, number][] = [[0, H - 1]];
  visto.add(`0,${H - 1}`);
  g[2 * (H - 1) + 1]![1] = '.';
  while (pilha.length) {
    const [x, y] = pilha[pilha.length - 1]!;
    const dirs = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).filter(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      return nx >= 0 && ny >= 0 && nx < W && ny < H && !visto.has(`${nx},${ny}`);
    });
    if (!dirs.length) {
      pilha.pop();
      continue;
    }
    const [dx, dy] = dirs[Math.floor(rng() * dirs.length)]!;
    const nx = x + dx;
    const ny = y + dy;
    g[2 * y + 1 + dy]![2 * x + 1 + dx] = '.';
    g[2 * ny + 1]![2 * nx + 1] = '.';
    visto.add(`${nx},${ny}`);
    pilha.push([nx, ny]);
  }
  g[2 * H - 1]![1] = 'S';
  g[1]![2 * W - 1] = 'E';
  return g.map((l) => l.join(''));
}
