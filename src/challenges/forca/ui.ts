import { h, botao } from '../../core/dom';
import type { ForcaConfig, Montar } from '../../core/tipos';
import { tocar } from '../../core/audio';
import { casas, chutar, criarForca, ehLetra, normalizar, perdeu, sortearFrases, venceu, type EstadoForca } from './engine';

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NS = 'http://www.w3.org/2000/svg';

// Partes do desenho: cada erro revela a próxima. Com maxErros diferente de 6,
// as partes são distribuídas proporcionalmente.
const PARTES: string[] = [
  '<circle cx="150" cy="70" r="20" />',
  '<line x1="150" y1="90" x2="150" y2="150" />',
  '<line x1="150" y1="105" x2="125" y2="135" />',
  '<line x1="150" y1="105" x2="175" y2="135" />',
  '<line x1="150" y1="150" x2="130" y2="195" />',
  '<line x1="150" y1="150" x2="170" y2="195" />',
];

function desenhoForca(erros: number, max: number): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 220 230');
  svg.setAttribute('class', 'forca-desenho');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Forca com ${erros} de ${max} erros`);
  const visiveis = Math.min(PARTES.length, Math.ceil((erros / max) * PARTES.length));
  svg.innerHTML =
    '<g stroke="#f5e6c8" stroke-width="5" stroke-linecap="round" fill="none">' +
    '<line x1="20" y1="215" x2="120" y2="215" /><line x1="60" y1="215" x2="60" y2="20" />' +
    '<line x1="60" y1="20" x2="150" y2="20" /><line x1="150" y1="20" x2="150" y2="50" />' +
    PARTES.slice(0, visiveis).join('') +
    '</g>';
  return svg;
}

export const montarForca: Montar<ForcaConfig> = (host, cfg, ctx) => {
  let rodadas = sortearFrases(cfg.palavras, Math.min(cfg.palavras.length, cfg.palavrasParaVencer + 6), ctx.rng);
  let proxima = 0;
  let acertadas = 0;
  let estado!: EstadoForca;
  let dica = '';
  let travado = false;

  const progresso = h('div', { class: 'forca-progresso' });
  const desenhoBox = h('div', { class: 'forca-desenho-box' });
  const dicaEl = h('div', { class: 'forca-dica' });
  const frase = h('div', { class: 'forca-frase', 'aria-live': 'polite' });
  const restantes = h('div', { class: 'forca-restantes' });
  const aviso = h('div', { class: 'aviso', role: 'status' });
  const teclado = h('div', { class: 'teclado teclado-letras' });
  const teclas = new Map<string, HTMLButtonElement>();

  function iniciarRodada(): void {
    if (proxima >= rodadas.length) {
      rodadas = sortearFrases(cfg.palavras, cfg.palavras.length, ctx.rng);
      proxima = 0;
    }
    const sorteada = rodadas[proxima++]!;
    estado = criarForca(sorteada.palavra, cfg.maxErros);
    dica = sorteada.dica;
    travado = false;
    aviso.textContent = '';
    for (const b of teclas.values()) {
      b.disabled = false;
      b.className = 'tecla';
    }
    desenhar();
  }

  function desenhar(): void {
    progresso.textContent = `Palavra ${Math.min(acertadas + 1, cfg.palavrasParaVencer)} de ${cfg.palavrasParaVencer} · acertadas: ${acertadas}`;
    dicaEl.textContent = `Dica: ${dica}`;
    desenhoBox.replaceChildren(desenhoForca(estado.erros, estado.maxErros));
    restantes.textContent = `Erros: ${estado.erros} de ${estado.maxErros}`;

    // Agrupa por palavra para a frase quebrar linha sem cortar palavras.
    const palavras: HTMLElement[] = [];
    let atual: HTMLElement = h('span', { class: 'palavra' });
    for (const casa of casas(estado)) {
      if (casa.char === ' ') {
        palavras.push(atual);
        atual = h('span', { class: 'palavra' });
        continue;
      }
      const texto = casa.letra ? (casa.revelada ? casa.char.toUpperCase() : '') : casa.char;
      atual.append(h('span', { class: `casa${casa.letra ? '' : ' pontuacao'}`, 'data-letra': casa.letra ? '1' : '0' }, texto));
    }
    palavras.push(atual);
    frase.replaceChildren(...palavras);
  }

  async function aoChutar(tecla: string): Promise<void> {
    if (travado || !ehLetra(tecla)) return;
    const letra = normalizar(tecla);
    const r = chutar(estado, letra);
    if (r === 'repetida' || r === 'invalida') {
      aviso.textContent = 'Você já usou essa letra.';
      return;
    }
    const b = teclas.get(letra);
    if (b) {
      b.disabled = true;
      b.classList.add(r === 'acerto' ? 'acerto' : 'erro');
    }
    aviso.textContent = '';
    tocar(r === 'acerto' ? 'ok' : 'erro');
    desenhar();

    if (venceu(estado)) {
      travado = true;
      acertadas++;
      if (acertadas >= cfg.palavrasParaVencer) {
        aviso.textContent = 'Palavra descoberta! O vale abriu caminho.';
        desenhar();
        window.setTimeout(() => ctx.concluir(), 1200);
      } else {
        aviso.textContent = `Palavra descoberta! Faltam ${cfg.palavrasParaVencer - acertadas}.`;
        host.querySelector('.forca-seguir')?.remove();
        host.append(
          botao('Próxima palavra', () => {
            host.querySelector('.forca-seguir')?.remove();
            iniciarRodada();
          }, 'btn forca-seguir'),
        );
      }
    } else if (perdeu(estado)) {
      travado = true;
      aviso.textContent = 'O desenho se completou. Palavra perdida.';
      await ctx.bronca();
      iniciarRodada();
    }
  }

  for (const l of LETRAS) {
    const b = botao(l, () => void aoChutar(l), 'tecla');
    teclas.set(l, b);
    teclado.append(b);
  }

  const aoTeclar = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    void aoChutar(e.key);
  };
  document.addEventListener('keydown', aoTeclar);

  host.append(h('h2', { class: 'titulo-desafio' }, 'O desafio dos guardiões'), progresso, desenhoBox, dicaEl, frase, restantes, aviso, teclado);
  iniciarRodada();

  return () => document.removeEventListener('keydown', aoTeclar);
};
