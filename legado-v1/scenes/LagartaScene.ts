import Phaser from 'phaser';
import { historia } from '../../config/story';
import { settings } from '../../config/settings';
import { textosDaIrma } from '../../config/client-texts';
import { criarTexto } from '../textos';
import { pararMusica, tocarMusicaBatalha } from '../audio';

const { fase2, chefe } = settings;

const FAIXAS = 3;
const FAIXA_CENTRAL = 1;
const TAMANHO_FORMIGA = 60;

const COR_CORPO = 0x6b8e23;
const COR_CORPO_VULNERAVEL = 0xf2c12e;
const COR_VARREDURA = 0xd7263d;

type Passo =
  | { tipo: 'pausa'; ms: number }
  | { tipo: 'aviso'; faixa: number; ms: number }
  | { tipo: 'golpe'; faixa: number; ms: number }
  | { tipo: 'janela'; ms: number };

interface DadosLagarta {
  vidas: number;
  perdasNoCiclo: number;
}

// Tela 2.5 — chefe. A lagarta varre as três faixas, uma de cada vez. Quem estiver
// na faixa no momento da varredura perde uma vida. Depois de cada ataque há uma
// janela de vulnerabilidade: tocar na parte de cima da tela (ou apertar espaço)
// conta como golpe certo. Golpes fora da janela não fazem nada.
export class LagartaScene extends Phaser.Scene {
  private corpo!: Phaser.GameObjects.Rectangle;
  private colunas: Phaser.GameObjects.Rectangle[] = [];
  private formiga!: Phaser.GameObjects.Rectangle;
  private textoVidas!: Phaser.GameObjects.Text;
  private textoGolpes!: Phaser.GameObjects.Text;

  private vidas = fase2.vidas;
  private perdasNoCiclo = 0;
  private golpes = 0;
  private faixa = FAIXA_CENTRAL;
  private invulneravelMs = 0;
  private fila: Passo[] = [];
  private passoAtual: Passo | null = null;
  private tempoNoPasso = 0;
  private janelaAberta = false;
  private varreduraTocou = false;
  private pausada = false;
  private encerrada = false;

  private aoTocar = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.y < this.scale.height * 0.5) {
      this.golpear();
    } else {
      this.mover(pointer.x < this.scale.width / 2 ? -1 : 1);
    }
  };
  private aoSeta = (direcao: number) => (): void => this.mover(direcao);
  private aoSetaEsquerda = this.aoSeta(-1);
  private aoSetaDireita = this.aoSeta(1);
  private aoEspaco = (): void => this.golpear();

  constructor() {
    super('Lagarta');
  }

  init(dados?: DadosLagarta): void {
    this.vidas = dados?.vidas ?? fase2.vidas;
    this.perdasNoCiclo = dados?.perdasNoCiclo ?? 0;
  }

  create(): void {
    const { width, height } = this.scale;

    this.golpes = 0;
    this.faixa = FAIXA_CENTRAL;
    this.invulneravelMs = 0;
    this.fila = [];
    this.passoAtual = null;
    this.tempoNoPasso = 0;
    this.janelaAberta = false;
    this.varreduraTocou = false;
    this.pausada = false;
    this.encerrada = false;

    this.add.rectangle(width / 2, height / 2, width, height, 0x3a2a1a);

    this.colunas = [];
    for (let i = 0; i < FAIXAS; i++) {
      const coluna = this.add
        .rectangle(this.xDaFaixa(i), (height * 0.35 + height * 0.92) / 2, width / FAIXAS - 10, height * 0.57, COR_VARREDURA)
        .setAlpha(0);
      this.colunas.push(coluna);
    }

    this.corpo = this.add.rectangle(width / 2, height * 0.2, width * 0.9, 110, COR_CORPO);

    this.formiga = this.add.rectangle(
      this.xDaFaixa(this.faixa),
      this.yFormiga(),
      TAMANHO_FORMIGA,
      TAMANHO_FORMIGA,
      0x3a1f0c,
    );

    this.textoVidas = this.add.text(16, 16, '', {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    });
    this.textoGolpes = this.add.text(width - 16, 16, '', {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    }).setOrigin(1, 0);
    this.atualizarTextos();

    const banner = criarTexto(this, width / 2, height * 0.5, historia.fase2.lagarta, {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#f5e6c8',
      backgroundColor: '#1b1410cc',
      padding: { x: 10, y: 6 },
    });
    this.time.delayedCall(fase2.tempoBannerMs, () => banner.destroy());

    // Dica fixa: o jogador precisa saber o que fazer, sem depender de ler a história.
    criarTexto(this, width / 2, height * 0.93, this.game.device.input.touch ? historia.fase2.chefeDicaToque : historia.fase2.chefeDicaTeclado, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#c8b48a',
    });

    this.input.on('pointerdown', this.aoTocar);
    this.input.keyboard?.on('keydown-LEFT', this.aoSetaEsquerda);
    this.input.keyboard?.on('keydown-RIGHT', this.aoSetaDireita);
    this.input.keyboard?.on('keydown-SPACE', this.aoEspaco);

    // A música só toca depois do primeiro toque do jogo (ver audio.ts).
    tocarMusicaBatalha();

    this.events.once('shutdown', () => {
      this.input.off('pointerdown', this.aoTocar);
      this.input.keyboard?.off('keydown-LEFT', this.aoSetaEsquerda);
      this.input.keyboard?.off('keydown-RIGHT', this.aoSetaDireita);
      this.input.keyboard?.off('keydown-SPACE', this.aoEspaco);
      pararMusica();
    });
  }

  update(_time: number, delta: number): void {
    if (this.encerrada || this.pausada) return;

    this.invulneravelMs = Math.max(0, this.invulneravelMs - delta);
    this.formiga.alpha = this.invulneravelMs > 0 && Math.floor(this.time.now / 100) % 2 === 0 ? 0.3 : 1;

    this.tempoNoPasso += delta;
    if (!this.passoAtual || this.tempoNoPasso >= this.passoAtual.ms) {
      this.tempoNoPasso = this.passoAtual ? this.tempoNoPasso - this.passoAtual.ms : 0;
      this.avancarPasso();
    }

    const passo = this.passoAtual;
    if (passo?.tipo === 'golpe' && !this.varreduraTocou && passo.faixa === this.faixa) {
      this.varreduraTocou = true;
      if (this.invulneravelMs <= 0) this.sofrerBatida();
    }
  }

  private avancarPasso(): void {
    if (this.fila.length === 0) this.fila = this.gerarAtaque();

    this.passoAtual = this.fila.shift() ?? null;
    this.mostrarPasso(this.passoAtual);
  }

  // Um ataque: pausa, varredura pelas faixas (em uma ordem ou na inversa) e janela.
  private gerarAtaque(): Passo[] {
    const ordem = Math.random() < 0.5 ? [0, 1, 2] : [2, 1, 0];
    const passos: Passo[] = [{ tipo: 'pausa', ms: chefe.pausaMs }];

    for (const faixa of ordem) {
      passos.push({ tipo: 'aviso', faixa, ms: chefe.avisoMs });
      passos.push({ tipo: 'golpe', faixa, ms: chefe.golpeMs });
    }

    passos.push({ tipo: 'janela', ms: chefe.janelaMs });
    return passos;
  }

  private mostrarPasso(passo: Passo | null): void {
    this.colunas.forEach((coluna) => coluna.setAlpha(0));
    this.janelaAberta = false;
    this.corpo.setFillStyle(COR_CORPO);

    if (!passo) return;

    if (passo.tipo === 'aviso') {
      this.colunas[passo.faixa].setAlpha(0.35);
    } else if (passo.tipo === 'golpe') {
      this.colunas[passo.faixa].setAlpha(0.9);
      this.varreduraTocou = false;
    } else if (passo.tipo === 'janela') {
      this.janelaAberta = true;
      this.corpo.setFillStyle(COR_CORPO_VULNERAVEL);
    }
  }

  // Golpe certo: só vale dentro da janela de vulnerabilidade, uma vez por ataque.
  private golpear(): void {
    if (this.encerrada || this.pausada || !this.janelaAberta) return;

    this.janelaAberta = false;
    this.golpes += 1;
    this.atualizarTextos();

    if (this.golpes >= chefe.golpes) {
      this.vencer();
      return;
    }

    this.corpo.setFillStyle(COR_CORPO);
  }

  private vencer(): void {
    this.encerrada = true;
    this.pausada = true;
    this.scene.pause();
    this.scene.launch('Interludio', {
      paginas: [historia.fase2.vitoria],
      comPeteca: false,
      aoContinuar: () => this.scene.start('Vale'),
    });
  }

  private mover(direcao: number): void {
    if (this.encerrada || this.pausada) return;

    const nova = Phaser.Math.Clamp(this.faixa + direcao, 0, FAIXAS - 1);
    if (nova === this.faixa) return;

    this.faixa = nova;
    this.tweens.add({ targets: this.formiga, x: this.xDaFaixa(nova), duration: 120 });
  }

  // Batida no chefe: segue as mesmas regras da floresta. Sem vidas, a formiga
  // volta ao início da floresta com três vidas novas (tela 2.4).
  private sofrerBatida(): void {
    // Uma batida por vez: enquanto a bronca está na tela, outra não conta.
    if (this.pausada || this.encerrada) return;

    this.vidas -= 1;
    this.perdasNoCiclo += 1;
    this.invulneravelMs = fase2.invulnerabilidadeMs;
    this.atualizarTextos();

    const bronca = textosDaIrma.bronca[this.perdasNoCiclo - 1];
    const semVidas = this.vidas <= 0;
    const paginas = semVidas
      ? [bronca, historia.fase2.retomadaFloresta, textosDaIrma.fraseDeApoio]
      : [bronca];

    this.pausada = true;
    this.scene.pause();
    this.scene.launch('Interludio', {
      paginas,
      aoContinuar: () => (semVidas ? this.scene.start('Floresta') : this.continuar()),
    });
  }

  private continuar(): void {
    this.pausada = false;
    this.scene.resume();
  }

  private xDaFaixa(faixa: number): number {
    return (this.scale.width * (faixa + 0.5)) / FAIXAS;
  }

  private yFormiga(): number {
    return this.scale.height * 0.82;
  }

  private atualizarTextos(): void {
    this.textoVidas.setText(`${historia.fase2.vidas} ${this.vidas}`);
    this.textoGolpes.setText(`${historia.fase2.golpes} ${this.golpes}/${chefe.golpes}`);
  }
}
