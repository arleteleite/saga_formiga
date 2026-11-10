import { describe, expect, it } from 'vitest';
import { avaliar, gerarSegredo, validarPalpite } from '../src/challenges/senha/engine';
import { casas, chutar, criarForca, normalizar, perdeu, sortearFrases, venceu } from '../src/challenges/forca/engine';
import { analisar, contarSolucoes, estruturaValida, gaiolaCumprida, novaGrade } from '../src/challenges/calcudoku/engine';
import { colide, criarLabirinto, gerarLayout, mover, passosAteSaida, temSolucao } from '../src/challenges/labirinto/engine';
import { puzzlesCalcudoku } from '../adventures/formiga-leite/puzzles-calcudoku';
import { fases, paradas } from '../adventures/formiga-leite/aventura';
import { Progresso } from '../src/core/progresso';

function rngSemente(s: number) {
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('Senha (Bulls and Cows)', () => {
  it('avalia posições certas e deslocadas', () => {
    expect(avaliar('1234', '1234')).toEqual({ certos: 4, deslocados: 0 });
    expect(avaliar('1234', '4321')).toEqual({ certos: 0, deslocados: 4 });
    expect(avaliar('1234', '1567')).toEqual({ certos: 1, deslocados: 0 });
    expect(avaliar('0123', '3210')).toEqual({ certos: 0, deslocados: 4 });
    expect(avaliar('1234', '5678')).toEqual({ certos: 0, deslocados: 0 });
    expect(avaliar('0123', '0145')).toEqual({ certos: 2, deslocados: 0 });
  });
  it('valida palpites', () => {
    expect(validarPalpite('123', 4)).toBe('tamanho');
    expect(validarPalpite('1123', 4)).toBe('repetido');
    expect(validarPalpite('12a4', 4)).toBe('nao-numerico');
    expect(validarPalpite('0123', 4)).toBeNull();
  });
  it('gera segredos com 4 dígitos distintos, aceitando zero inicial', () => {
    const rng = rngSemente(1);
    let zeroInicial = false;
    for (let i = 0; i < 500; i++) {
      const s = gerarSegredo(rng, 4);
      expect(s).toMatch(/^\d{4}$/);
      expect(new Set(s).size).toBe(4);
      if (s[0] === '0') zeroInicial = true;
    }
    expect(zeroInicial).toBe(true);
  });
});

describe('Forca', () => {
  it('normaliza acentos e cedilha', () => {
    expect(normalizar('Não função É ç')).toBe('NAO FUNCAO E C');
  });
  it('letra acentuada é revelada pela letra sem acento', () => {
    const e = criarForca('Não é função', 6);
    expect(chutar(e, 'a')).toBe('acerto');
    expect(casas(e).filter((c) => c.letra && c.revelada).map((c) => c.char)).toEqual(['ã', 'ã']);
  });
  it('letra repetida não gera nova tentativa nem erro', () => {
    const e = criarForca('Peteca', 6);
    expect(chutar(e, 'z')).toBe('erro');
    expect(chutar(e, 'Z')).toBe('repetida');
    expect(e.erros).toBe(1);
  });
  it('vence ao completar e perde ao atingir o limite', () => {
    const v = criarForca('Oi, a', 6);
    for (const l of 'OIA') chutar(v, l);
    expect(venceu(v)).toBe(true);
    expect(perdeu(v)).toBe(false);
    const p = criarForca('Oi', 3);
    for (const l of 'XYZ') chutar(p, l);
    expect(perdeu(p)).toBe(true);
    expect(venceu(p)).toBe(false);
  });
  it('símbolos e espaços aparecem revelados desde o início', () => {
    const e = criarForca('Oi, mundo!', 6);
    expect(casas(e).filter((c) => !c.letra).every((c) => c.revelada)).toBe(true);
  });
  it('ignora teclas que não são letras', () => {
    expect(chutar(criarForca('Oi', 6), '1')).toBe('invalida');
  });
  it('sorteia frases distintas', () => {
    const banco = fases.forca.tipo === 'forca' ? fases.forca.config.palavras : [];
    expect(banco.length).toBeGreaterThanOrEqual(10);
    const s = sortearFrases(banco, 3, rngSemente(5));
    expect(new Set(s.map((x) => x.palavra)).size).toBe(3);
  });
  it('o banco de palavras tem vocabulário longo e só letras válidas', () => {
    const banco = fases.forca.tipo === 'forca' ? fases.forca.config.palavras : [];
    const longas = banco.filter((x) => [...x.palavra].length >= 9);
    expect(longas.length).toBeGreaterThanOrEqual(15);
    expect(longas.length / banco.length).toBeGreaterThan(0.6);
    for (const x of banco) {
      expect(normalizar(x.palavra)).toMatch(/^[A-Z]+$/);
      expect(new Set(banco.map((y) => y.palavra)).size).toBe(banco.length);
    }
  });
});

describe('Calcudoku', () => {
  it('avalia cada operação', () => {
    expect(gaiolaCumprida({ celulas: [[0, 0], [0, 1]], op: '+', alvo: 7 }, [3, 4])).toBe(true);
    expect(gaiolaCumprida({ celulas: [[0, 0], [0, 1]], op: 'x', alvo: 12 }, [3, 4])).toBe(true);
    expect(gaiolaCumprida({ celulas: [[0, 0], [0, 1]], op: '-', alvo: 2 }, [1, 3])).toBe(true);
    expect(gaiolaCumprida({ celulas: [[0, 0], [0, 1]], op: '-', alvo: 2 }, [3, 1])).toBe(true);
    expect(gaiolaCumprida({ celulas: [[0, 0], [0, 1]], op: '/', alvo: 2 }, [4, 2])).toBe(true);
    expect(gaiolaCumprida({ celulas: [[0, 0], [0, 1]], op: '/', alvo: 2 }, [5, 2])).toBe(false);
    expect(gaiolaCumprida({ celulas: [[0, 0]], op: '=', alvo: 3 }, [3])).toBe(true);
    expect(gaiolaCumprida({ celulas: [[0, 0]], op: '=', alvo: 3 }, [4])).toBe(false);
  });

  puzzlesCalcudoku.forEach((p, i) => {
    it(`puzzle ${i + 1}: estrutura válida e solução ÚNICA`, () => {
      expect(estruturaValida(p)).toBe(true);
      expect(contarSolucoes(p, 3)).toBe(1);
    });
  });

  it('detecta repetição em linha/coluna e gaiola errada; resolve só com a solução', () => {
    const p = puzzlesCalcudoku[0]!;
    // Descobre a solução pelo solver simples e confere o analisador.
    const solucao = acharSolucao(p);
    expect(analisar(p, solucao).resolvido).toBe(true);
    const errada = solucao.map((l) => [...l]);
    errada[0]![0] = errada[0]![1]!; // repete na linha
    const a = analisar(p, errada);
    expect(a.resolvido).toBe(false);
    expect(a.conflitos.has('0,0')).toBe(true);
    expect(analisar(p, novaGrade(5)).resolvido).toBe(false);
  });
});

function acharSolucao(p: (typeof puzzlesCalcudoku)[number]) {
  const n = p.tamanho;
  const g = novaGrade(n);
  const gaiolaDe = new Map<string, number>();
  p.gaiolas.forEach((x, i) => x.celulas.forEach(([l, c]) => gaiolaDe.set(`${l},${c}`, i)));
  const ok = (i: number) => {
    const x = p.gaiolas[i]!;
    const v = x.celulas.map(([l, c]) => g[l]![c]!);
    return v.includes(0) || gaiolaCumprida(x, v);
  };
  const rec = (k: number): boolean => {
    if (k === n * n) return true;
    const l = Math.floor(k / n);
    const c = k % n;
    for (let v = 1; v <= n; v++) {
      if (g[l]!.slice(0, c).includes(v) || g.slice(0, l).some((r) => r[c] === v)) continue;
      g[l]![c] = v;
      if (ok(gaiolaDe.get(`${l},${c}`)!) && rec(k + 1)) return true;
      g[l]![c] = 0;
    }
    return false;
  };
  expect(rec(0)).toBe(true);
  return g;
}

describe('Labirinto', () => {
  const params = (fases.labirinto.tipo === 'labirinto' ? fases.labirinto.config.gerar : undefined)!;
  const lab = criarLabirinto(gerarLayout(rngSemente(42), params));

  it('cada partida gera um labirinto diferente, sempre solúvel e dentro da faixa de passos', () => {
    const vistos = new Set<string>();
    for (let i = 1; i <= 200; i++) {
      const layout = gerarLayout(rngSemente(i * 7919), params);
      const l = criarLabirinto(layout);
      expect(temSolucao(l)).toBe(true);
      const passos = passosAteSaida(l);
      expect(passos).toBeGreaterThanOrEqual(params.passosMin);
      expect(passos).toBeLessThanOrEqual(params.passosMax);
      expect(layout.length).toBe(params.linhas * 2 + 1);
      expect(layout[0]!.length).toBe(params.colunas * 2 + 1);
      vistos.add(layout.join('|'));
    }
    expect(vistos.size).toBeGreaterThan(50);
    // Com Math.random (como no jogo) duas partidas seguidas também diferem.
    expect(gerarLayout(Math.random, params).join()).not.toBe(gerarLayout(Math.random, params).join());
  });

  it('o layout da aventura tem solução', () => {
    expect(temSolucao(lab)).toBe(true);
  });
  it('corredor livre não colide; parede colide', () => {
    expect(colide(lab, lab.inicio.c + 0.5, lab.inicio.l + 0.5, 0.26)).toBe(false);
    expect(colide(lab, 0.5, 0.5, 0.26)).toBe(true);
    expect(colide(lab, lab.inicio.c + 0.5, lab.inicio.l + 0.5, 0.26)).toBe(false);
  });
  it('bater na parede volta ao início', () => {
    const r = mover(lab, { x: lab.inicio.c + 0.5, y: lab.inicio.l + 0.5 }, -0.9, 0, 0.26);
    expect(r.resultado).toBe('bateu');
    expect(r.pos).toEqual({ x: lab.inicio.c + 0.5, y: lab.inicio.l + 0.5 });
  });
  it('movimento rápido NÃO atravessa parede fina', () => {
    // Do início, sobe pelo corredor (coluna 1) e tenta cruzar a parede da direita com um salto enorme.
    const r = mover(lab, { x: lab.inicio.c + 0.5, y: lab.inicio.l + 0.5 }, 0, -8, 0.26);
    expect(r.resultado).toBe('bateu');
  });
  it('chegar à saída conclui', () => {
    const r = mover(lab, { x: lab.saida.c + 0.5, y: lab.saida.l + 0.5 }, 0.01, 0, 0.26);
    expect(r.resultado).toBe('saida');
  });
});

describe('Progressão', () => {
  const ordem = paradas.flatMap((p) => (p.fase ? [p.fase.id] : []));
  it('a ordem da aventura é labirinto, senha, forca, calcudoku', () => {
    expect(ordem).toEqual(['labirinto', 'senha', 'forca', 'calcudoku']);
  });
  it('não permite entrar num desafio sem concluir os anteriores', () => {
    const p = new Progresso(ordem);
    expect(p.podeEntrar('labirinto')).toBe(true);
    expect(p.podeEntrar('senha')).toBe(false);
    expect(p.podeEntrar('calcudoku')).toBe(false);
    expect(p.podeSeguir('labirinto')).toBe(false);
    p.concluir('labirinto');
    expect(p.podeSeguir('labirinto')).toBe(true);
    expect(p.podeEntrar('senha')).toBe(true);
    expect(p.podeEntrar('forca')).toBe(false);
    p.concluir('senha');
    p.concluir('forca');
    expect(p.todosConcluidos()).toBe(false);
    p.concluir('calcudoku');
    expect(p.todosConcluidos()).toBe(true);
    p.reiniciar();
    expect(p.estaConcluido('labirinto')).toBe(false);
  });
});
