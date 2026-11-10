// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { montarSenha } from '../src/challenges/senha/ui';
import { montarForca } from '../src/challenges/forca/ui';
import { montarCalcudoku } from '../src/challenges/calcudoku/ui';
import { montarLabirinto } from '../src/challenges/labirinto/ui';
import { fases } from '../adventures/formiga-leite/aventura';
import { contarSolucoes, resolver } from '../src/challenges/calcudoku/engine';
import type { ContextoDesafio } from '../src/core/tipos';
import { Palco } from '../src/core/palco';
import { bronca } from '../adventures/formiga-leite/aventura';

function ctx() {
  const c = { concluiu: 0, broncas: 0 };
  const contexto: ContextoDesafio = {
    rng: Math.random,
    concluir: () => void c.concluiu++,
    bronca: async () => void c.broncas++,
  };
  return { c, contexto };
}

const clicar = (host: HTMLElement, rotulo: string) => {
  const b = [...host.querySelectorAll('button')].find((x) => x.textContent === rotulo && !(x as HTMLButtonElement).disabled);
  if (!b) throw new Error(`Botão não encontrado: ${rotulo}`);
  b.click();
};
const digitar = (host: HTMLElement, s: string) => {
  for (const d of s) clicar(host, d);
  clicar(host, 'OK');
};
const tecla = (key: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key }));

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '';
});
afterEach(() => vi.useRealTimers());

describe('UI da Senha', () => {
  const cfg = { digitos: 4, tentativas: 7, codigo: '0123' };

  it('acertar conclui; o código não aparece antes da vitória', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { c, contexto } = ctx();
    const destruir = montarSenha(host, cfg, contexto);
    digitar(host, '4567');
    expect(host.querySelector('.senha-historico')!.textContent).not.toContain('0123');
    expect(host.querySelector('.senha-slots')!.textContent).not.toContain('0123');
    digitar(host, '0123');
    vi.advanceTimersByTime(1500);
    expect(c.concluiu).toBe(1);
    expect(host.textContent).toContain('Senha correta');
    destruir();
  });

  it('rejeita palpite com dígitos repetidos sem gastar tentativa', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { contexto } = ctx();
    montarSenha(host, cfg, contexto);
    digitar(host, '1123');
    expect(host.textContent).toContain('diferentes');
    expect(host.textContent).toContain('Tentativas: 0 usadas, 7 restantes');
  });

  it('7 erros mostram a bronca uma vez e recomeçam do zero', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { c, contexto } = ctx();
    montarSenha(host, cfg, contexto);
    for (const p of ['4567', '4568', '4569', '4578', '4579', '4589', '4678']) digitar(host, p);
    await vi.advanceTimersByTimeAsync(10);
    expect(c.broncas).toBe(1);
    expect(c.concluiu).toBe(0);
    expect(host.textContent).toContain('Tentativas: 0 usadas, 7 restantes');
  });

  it('aceita digitação pelo teclado físico', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { c, contexto } = ctx();
    montarSenha(host, cfg, contexto);
    for (const k of ['0', '1', '2', '3', 'Enter']) tecla(k);
    vi.advanceTimersByTime(1500);
    expect(c.concluiu).toBe(1);
  });
});

describe('UI da Forca', () => {
  const palavras = [
    { palavra: 'Oi', dica: 'a' },
    { palavra: 'Ei', dica: 'b' },
    { palavra: 'Ai', dica: 'c' },
    { palavra: 'Ui', dica: 'd' },
  ];
  const cfg = { maxErros: 3, palavrasParaVencer: 3, palavras };
  const cfgFolgada = { ...cfg, maxErros: 10 };

  it('três palavras certas concluem; entre elas aparece "Próxima frase"', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { c, contexto } = ctx();
    montarForca(host, cfgFolgada, contexto);
    for (let i = 0; i < 3; i++) {
      // As frases têm 2 letras; chuta todas as letras possíveis do alfabeto até completar.
      for (const l of 'OEAUI') {
        const b = [...host.querySelectorAll('button')].find((x) => x.textContent === l && !(x as HTMLButtonElement).disabled);
        b?.click();
      }
      if (i < 2) clicar(host, 'Próxima palavra');
    }
    vi.advanceTimersByTime(1500);
    expect(c.concluiu).toBe(1);
    expect(c.broncas).toBe(0);
  });

  it('atingir o limite de erros mostra a bronca e começa nova frase', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { c, contexto } = ctx();
    montarForca(host, cfg, contexto);
    for (const l of 'XYZ') clicar(host, l);
    await vi.advanceTimersByTimeAsync(10);
    expect(c.broncas).toBe(1);
    expect(c.concluiu).toBe(0);
    expect(host.textContent).toContain('Erros: 0 de 3');
  });

  it('letra usada fica desabilitada e não gera nova tentativa', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { contexto } = ctx();
    montarForca(host, cfg, contexto);
    clicar(host, 'X');
    expect(host.textContent).toContain('Erros: 1 de 3');
    tecla('x');
    expect(host.textContent).toContain('Erros: 1 de 3');
  });

  it('a aventura tem pelo menos 10 palavras', () => {
    const f = fases.forca;
    if (f.tipo !== 'forca') throw new Error();
    expect(f.config.palavras.length).toBeGreaterThanOrEqual(10);
  });
});

describe('UI do Calcudoku', () => {
  it('preencher a solução conclui; preencher errado não conclui e sinaliza erro', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { c, contexto } = ctx();
    const f = fases.calcudoku;
    if (f.tipo !== 'calcudoku') throw new Error();
    // Usa só o primeiro puzzle para tornar o teste determinístico.
    const puzzle = f.config.puzzles[0]!;
    montarCalcudoku(host, { puzzles: [puzzle] }, contexto);
    expect(contarSolucoes(puzzle)).toBe(1);

    // Preenche tudo com 1: viola linhas/colunas.
    const celulas = [...host.querySelectorAll<HTMLElement>('.calc-celula')];
    for (const cel of celulas) {
      cel.click();
      tecla('1');
    }
    expect(c.concluiu).toBe(0);
    expect(host.querySelectorAll('.conflito').length).toBeGreaterThan(0);
    clicar(host, 'Reiniciar');
    expect(c.concluiu).toBe(0);
    expect([...host.querySelectorAll('.calc-valor')].filter((e) => e.textContent).length).toBe(0);
  });
});

describe('UI do Calcudoku (vitória)', () => {
  it('digitar a solução célula a célula conclui', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { c, contexto } = ctx();
    const f = fases.calcudoku;
    if (f.tipo !== 'calcudoku') throw new Error();
    for (const puzzle of f.config.puzzles) {
      host.replaceChildren();
      c.concluiu = 0;
      const destruir = montarCalcudoku(host, { puzzles: [puzzle] }, contexto);
      const sol = resolver(puzzle).primeira!;
      const celulas = [...host.querySelectorAll<HTMLElement>('.calc-celula')];
      celulas.forEach((cel, i) => {
        cel.click();
        tecla(String(sol[Math.floor(i / 5)]![i % 5]));
      });
      vi.advanceTimersByTime(1500);
      expect(c.concluiu).toBe(1);
      expect(host.querySelectorAll('.conflito, .gaiola-errada').length).toBe(0);
      destruir();
    }
  });
});

describe('UI do Labirinto', () => {
  it('encostar na parede conta uma batida e avisa', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const { c, contexto } = ctx();
    const f = fases.labirinto;
    if (f.tipo !== 'labirinto') throw new Error();
    const destruir = montarLabirinto(host, f.config, contexto);
    for (let i = 0; i < 6; i++) tecla('ArrowLeft'); // início está encostado na parede da esquerda
    expect(host.textContent).toMatch(/Batidas: [1-9]/);
    expect(c.concluiu).toBe(0);
    destruir();
  });
});

describe('Bronca da Kátia', () => {
  it('mostra a Kátia brava e depois séria, com textos diferentes, e um botão que fecha', async () => {
    const raiz = document.createElement('div');
    document.body.append(raiz);
    const palco = new Palco(raiz, { continuar: 'Continuar', seguir: 's', nomeProtagonista: 'Felipe', petecaPergunta: 'p', petecaBotao: 'b', fechar: 'f' }, bronca, Math.random);
    const textos: string[] = [];
    const imgs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const p = palco.bronca();
      imgs.push(raiz.querySelector('.dialogo img')!.getAttribute('src')!);
      textos.push(raiz.querySelector('.dialogo p')!.textContent!);
      expect(raiz.querySelector('.falante')!.textContent).toBe('Kátia');
      (raiz.querySelector('.dialogo .btn') as HTMLButtonElement).click();
      await p;
      expect(raiz.querySelector('.dialogo')).toBeNull();
    }
    expect(new Set(textos).size).toBe(3);
    expect(textos.every((t) => !t.includes('PENDENTE'))).toBe(true);
    expect(imgs[0]).toContain('katia_brava');
    expect(imgs[1]).toContain('katia_seria');
    expect(imgs[2]).toContain('katia_brava');
  });
});
