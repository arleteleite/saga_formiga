import { h, botao } from '../../core/dom';
import type { Montar, SenhaConfig } from '../../core/tipos';
import { tocar } from '../../core/audio';
import { avaliar, gerarSegredo, validarPalpite, type ErroPalpite } from './engine';

const MENSAGENS: Record<ErroPalpite, string> = {
  tamanho: 'Digite os 4 algarismos.',
  'nao-numerico': 'Use apenas números.',
  repetido: 'Os algarismos devem ser diferentes entre si.',
};

export const montarSenha: Montar<SenhaConfig> = (host, cfg, ctx) => {
  let segredo = '';
  let entrada = '';
  let historico: { palpite: string; certos: number; deslocados: number }[] = [];
  let encerrado = false;

  const porta = h('div', { class: 'senha-porta' });
  const cadeado = h('div', { class: 'senha-cadeado' }, '🔒');
  const slots = h('div', { class: 'senha-slots' });
  const aviso = h('div', { class: 'aviso', role: 'status' });
  const contador = h('div', { class: 'senha-contador' });
  const lista = h('ol', { class: 'senha-historico' });
  const teclado = h('div', { class: 'teclado' });

  porta.append(cadeado, slots);

  function novaPartida(): void {
    segredo = cfg.codigo ?? gerarSegredo(ctx.rng, cfg.digitos);
    entrada = '';
    historico = [];
    encerrado = false;
    cadeado.textContent = '🔒';
    porta.classList.remove('aberta');
    aviso.textContent = '';
    desenhar();
  }

  function desenhar(): void {
    slots.replaceChildren(
      ...Array.from({ length: cfg.digitos }, (_, i) =>
        h('div', { class: `slot${i === entrada.length && !encerrado ? ' ativo' : ''}`, 'data-slot': String(i) }, entrada[i] ?? ''),
      ),
    );
    const usadas = historico.length;
    contador.textContent = `Tentativas: ${usadas} usadas, ${cfg.tentativas - usadas} restantes`;
    lista.replaceChildren(
      ...historico.map((r) =>
        h(
          'li',
          { class: 'linha-hist' },
          h('span', { class: 'palpite' }, r.palpite),
          h('span', { class: 'pino certo', title: 'Posição certa' }, `● ${r.certos}`),
          h('span', { class: 'pino fora', title: 'Existe, mas em outra posição' }, `○ ${r.deslocados}`),
        ),
      ),
    );
    lista.scrollTop = lista.scrollHeight;
  }

  function digitar(d: string): void {
    if (encerrado || entrada.length >= cfg.digitos) return;
    entrada += d;
    aviso.textContent = '';
    desenhar();
  }

  function apagar(): void {
    if (encerrado) return;
    entrada = entrada.slice(0, -1);
    aviso.textContent = '';
    desenhar();
  }

  async function enviar(): Promise<void> {
    if (encerrado) return;
    const erro = validarPalpite(entrada, cfg.digitos);
    if (erro) {
      aviso.textContent = MENSAGENS[erro];
      return;
    }
    const r = avaliar(segredo, entrada);
    historico.push({ palpite: entrada, ...r });
    const venceu = r.certos === cfg.digitos;
    tocar(venceu ? 'ok' : 'clique');
    entrada = '';
    desenhar();
    if (venceu) {
      encerrado = true;
      cadeado.textContent = '🔓';
      porta.classList.add('aberta');
      aviso.textContent = 'Senha correta! A passagem se abriu.';
      window.setTimeout(() => ctx.concluir(), 1200);
    } else if (historico.length >= cfg.tentativas) {
      encerrado = true;
      aviso.textContent = 'As tentativas acabaram. A senha mudou.';
      await ctx.bronca();
      novaPartida();
    }
  }

  for (const d of '1234567890') teclado.append(botao(d, () => digitar(d), 'tecla'));
  teclado.append(botao('⌫', apagar, 'tecla'), botao('OK', () => void enviar(), 'tecla ok'));

  const aoTeclar = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^\d$/.test(e.key)) digitar(e.key);
    else if (e.key === 'Backspace') apagar();
    else if (e.key === 'Enter') void enviar();
  };
  document.addEventListener('keydown', aoTeclar);

  host.append(h('h2', { class: 'titulo-desafio' }, 'A passagem trancada'), porta, aviso, contador, lista, teclado);
  novaPartida();

  return () => document.removeEventListener('keydown', aoTeclar);
};
