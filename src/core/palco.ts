import { h, botao } from './dom';
import { alternarSom, somLigado, tocar } from './audio';
import { resolverTexto, type Texto } from '../textos';
import type { ContextoDesafio, Fase, Linha, Montar, Pose, Rng } from './tipos';
import { montarLabirinto } from '../challenges/labirinto/ui';
import { montarSenha } from '../challenges/senha/ui';
import { montarForca } from '../challenges/forca/ui';
import { montarCalcudoku } from '../challenges/calcudoku/ui';

// Registro de desafios: novos tipos entram aqui sem mexer no mapa.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRO: Record<Fase['tipo'], Montar<any>> = {
  labirinto: montarLabirinto,
  senha: montarSenha,
  forca: montarForca,
  calcudoku: montarCalcudoku,
};

const BASE = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
export const imagem = (pose: Pose): string => `${BASE}img/${pose}.png`;

export interface TextosPalco {
  continuar: string;
  seguir: string;
  petecaPergunta: string;
  nomeProtagonista: string;
  petecaBotao: string;
  fechar: string;
}

// Camada HTML sobre o canvas. Guarda abertura, diálogos e desafios.
export class Palco {
  constructor(
    readonly raiz: HTMLElement,
    private readonly textos: TextosPalco,
    private readonly bronquinhas: Texto[],
    private readonly rng: Rng,
  ) {
    const ajustar = (): void => {
      const w = raiz.clientWidth || 540;
      raiz.style.setProperty('--u', `${w / 540}px`);
    };
    ajustar();
    raiz.append(this.botaoSom());
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(ajustar).observe(raiz);
  }

  private derrotas = 0;

  private botaoSom(): HTMLElement {
    const b = h('button', { class: 'btn-som', type: 'button' });
    const atualizar = (): void => {
      b.textContent = somLigado() ? '🔊' : '🔇';
      b.setAttribute('aria-label', somLigado() ? 'Desligar som' : 'Ligar som');
    };
    b.addEventListener('click', () => {
      alternarSom();
      atualizar();
      tocar('clique');
    });
    atualizar();
    return b;
  }

  private nomeDe(quem: Linha['quem']): string {
    return quem === 'formiga' ? this.textos.nomeProtagonista : quem === 'peteca' ? 'Peteca' : quem === 'cliente' ? 'Kátia' : '';
  }

  private limpar(seletor: string): void {
    this.raiz.querySelectorAll(seletor).forEach((e) => e.remove());
  }

  // Mostra falas em sequência. Cada toque avança; o último botão tem o rótulo dado.
  dialogo(linhas: Linha[], rotuloFinal?: string): Promise<void> {
    if (linhas.length === 0) return Promise.resolve();
    return new Promise((resolve) => {
      let i = 0;
      const caixa = h('div', { class: 'dialogo', role: 'dialog' });
      this.raiz.append(caixa);
      const mostrar = (): void => {
        const l = linhas[i]!;
        const ultimo = i === linhas.length - 1;
        const retrato =
          l.quem === 'narrador' || (l.quem === 'cliente' && !l.pose)
            ? null
            : h('img', { class: 'retrato', alt: '', src: imagem(l.pose ?? (l.quem === 'peteca' ? 'peteca3' : 'formiga')) });
        caixa.replaceChildren(
          ...(retrato ? [retrato] : []),
          h(
            'div',
            { class: `fala ${l.quem}` },
            this.nomeDe(l.quem) ? h('strong', { class: 'falante' }, this.nomeDe(l.quem)) : null,
            h('p', {}, resolverTexto(l.texto)),
          ),
          botao(ultimo ? (rotuloFinal ?? this.textos.continuar) : this.textos.continuar, () => {
            tocar('clique');
            if (ultimo) {
              caixa.remove();
              resolve();
            } else {
              i++;
              mostrar();
            }
          }, 'btn pequeno'),
        );
      };
      mostrar();
    });
  }

  // Abertura em duas telas: título com "Jogar", depois a história completa com "Iniciar o jogo".
  abertura(titulo: string, cfg: { jogar: string; iniciar: string; tituloHistoria: string; historia: string[] }): Promise<void> {
    return new Promise((resolve) => {
      const tela = h('div', { class: 'abertura' });
      this.raiz.append(tela);
      const historia = (): void => {
        tela.replaceChildren(
          h('h2', {}, cfg.tituloHistoria),
          h('div', { class: 'historia' }, ...cfg.historia.map((t) => h('p', {}, t))),
          botao(cfg.iniciar, () => {
            tocar('ok');
            tela.remove();
            resolve();
          }),
        );
      };
      tela.replaceChildren(
        h('img', { src: imagem('formiga'), alt: '' }),
        h('h1', {}, titulo),
        botao(cfg.jogar, () => {
          tocar('clique');
          historia();
        }),
      );
    });
  }

  bronca(): Promise<void> {
    const texto = this.bronquinhas[this.derrotas % this.bronquinhas.length]!;
    this.derrotas++;
    tocar('erro');
    // Alterna a Kátia brava e séria a cada derrota.
    const pose: Pose = this.derrotas % 2 === 1 ? 'katia_brava' : 'katia_seria';
    return this.dialogo([{ quem: 'cliente', texto, pose }]);
  }

  // Abre o desafio em tela cheia e resolve quando ele for concluído.
  desafio(fase: Fase): Promise<void> {
    return new Promise((resolve) => {
      const painel = h('div', { class: 'desafio' });
      const host = h('div', { class: 'desafio-host' });
      painel.append(host, this.ajudaPeteca(fase));
      this.raiz.append(painel);

      let destruir: () => void = () => undefined;
      const ctx: ContextoDesafio = {
        rng: this.rng,
        concluir: () => {
          tocar('vitoria');
          destruir();
          painel.remove();
          resolve();
        },
        bronca: () => this.bronca(),
      };
      destruir = REGISTRO[fase.tipo](host, fase.config, ctx);
    });
  }

  // A Peteca é quem sabe as regras: só explica quando acionada, e nunca dá a resposta.
  private ajudaPeteca(fase: Fase): HTMLElement {
    const bolha = h('div', { class: 'peteca-bolha', hidden: '' });
    const botaoPeteca = h(
      'button',
      { class: 'peteca-btn', type: 'button', 'aria-label': this.textos.petecaBotao },
      h('img', { src: imagem('peteca2'), alt: '' }),
      h('span', {}, this.textos.petecaBotao),
    );
    botaoPeteca.addEventListener('click', () => {
      if (!bolha.hasAttribute('hidden')) {
        bolha.setAttribute('hidden', '');
        return;
      }
      bolha.replaceChildren(
        h('p', { class: 'pergunta' }, this.textos.petecaPergunta),
        h('ul', {}, ...fase.regras.map((r) => h('li', {}, resolverTexto(r)))),
        botao(this.textos.fechar, () => bolha.setAttribute('hidden', ''), 'btn pequeno'),
      );
      bolha.removeAttribute('hidden');
    });
    return h('div', { class: 'peteca-ajuda' }, bolha, botaoPeteca);
  }

  // Fim: tela de encerramento com botão de recomeçar.
  fim(titulo: string, linhaFinal: Texto, rotulo: string, aoReiniciar: () => void, pose: Pose = 'formiga4'): void {
    this.raiz.append(
      h(
        'div',
        { class: 'fim' },
        h('img', { src: imagem(pose), alt: '' }),
        h('h2', {}, titulo),
        h('p', {}, resolverTexto(linhaFinal)),
        botao(rotulo, aoReiniciar),
      ),
    );
  }

  removerTudo(): void {
    this.limpar('.dialogo, .desafio, .fim');
  }
}
