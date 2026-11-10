import Phaser from 'phaser';
import { historia } from '../../config/story';
import { settings } from '../../config/settings';
import { textosDaIrma } from '../../config/client-texts';
import { criarTexto } from '../textos';

const { fase2 } = settings;

const FAIXAS = 3;
const FAIXA_CENTRAL = 1;
const TAMANHO_FORMIGA = 60;

// Tipos de obstáculo. Cor e tamanho são provisórios, até as imagens chegarem.
const TIPOS_OBSTACULO = [
  { cor: 0x8b5a2b, largura: 56, altura: 56 }, // coco
  { cor: 0x5b3a1a, largura: 120, altura: 36 }, // galho
  { cor: 0x7a7a7a, largura: 80, altura: 64 }, // pedra
];

interface Obstaculo {
  objeto: Phaser.GameObjects.Rectangle;
  altura: number;
  faixa: number;
  // Cada obstáculo conta uma única vez, mesmo que a formiga fique sobre ele.
  jaTocou: boolean;
}

// Tela 2.2 — floresta com três faixas. Toque na metade esquerda ou direita,
// ou use as setas, para mudar de faixa. Cada batida abre a bronca (2.3); ao
// perder as três vidas, a Peteca resgata a formiga (2.4) e a floresta recomeça.
export class FlorestaScene extends Phaser.Scene {
  private formiga!: Phaser.GameObjects.Rectangle;
  private faixa = FAIXA_CENTRAL;
  private vidas = fase2.vidas;
  private perdasNoCiclo = 0;
  private invulneravelMs = 0;
  private progresso = 0;
  private progressoNaBatida = 0;
  private tempoDesdeSpawn = 0;
  private obstaculos: Obstaculo[] = [];
  private encerrada = false;
  private pausada = false;
  private textoVidas!: Phaser.GameObjects.Text;
  private barra!: Phaser.GameObjects.Rectangle;
  private larguraBarra = 0;

  private aoApertar = (pointer: Phaser.Input.Pointer): void => {
    this.mover(pointer.x < this.scale.width / 2 ? -1 : 1);
  };
  private aoSeta = (direcao: number) => (): void => this.mover(direcao);
  private aoSetaEsquerda = this.aoSeta(-1);
  private aoSetaDireita = this.aoSeta(1);

  constructor() {
    super('Floresta');
  }

  create(): void {
    const { width, height } = this.scale;

    this.comecarDoZero();

    this.add.rectangle(width / 2, height / 2, width, height, 0x2d4a1e);
    for (let i = 1; i < FAIXAS; i++) {
      this.add.rectangle((width * i) / FAIXAS, height / 2, 2, height, 0x3d5f2a);
    }

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
    this.atualizarVidas();

    this.larguraBarra = width - 32;
    this.add.rectangle(16, 56, this.larguraBarra, 8, 0x1b1410).setOrigin(0, 0.5);
    this.barra = this.add.rectangle(16, 56, 0, 8, 0xc8702a).setOrigin(0, 0.5);

    const banner = criarTexto(this, width / 2, height * 0.14, historia.fase2.floresta, {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#f5e6c8',
      backgroundColor: '#1b1410cc',
      padding: { x: 10, y: 6 },
    });
    this.time.delayedCall(fase2.tempoBannerMs, () => banner.destroy());

    this.input.on('pointerdown', this.aoApertar);
    this.input.keyboard?.on('keydown-LEFT', this.aoSetaEsquerda);
    this.input.keyboard?.on('keydown-RIGHT', this.aoSetaDireita);

    // Solta os ouvintes ao sair da cena, para não acumular quando ela volta.
    this.events.once('shutdown', () => {
      this.input.off('pointerdown', this.aoApertar);
      this.input.keyboard?.off('keydown-LEFT', this.aoSetaEsquerda);
      this.input.keyboard?.off('keydown-RIGHT', this.aoSetaDireita);
    });
  }

  update(_time: number, delta: number): void {
    if (this.encerrada || this.pausada) return;

    const segundos = delta / 1000;
    this.progresso += fase2.velocidadeObstaculos * segundos;
    const fracao = Math.min(this.progresso / fase2.distanciaFloresta, 1);
    this.barra.width = this.larguraBarra * fracao;

    this.tempoDesdeSpawn += delta;
    if (this.tempoDesdeSpawn >= fase2.intervaloObstaculosMs) {
      this.tempoDesdeSpawn -= fase2.intervaloObstaculosMs;
      this.criarObstaculo();
    }

    this.invulneravelMs = Math.max(0, this.invulneravelMs - delta);
    this.formiga.alpha = this.invulneravelMs > 0 && Math.floor(this.time.now / 100) % 2 === 0 ? 0.3 : 1;

    for (const obstaculo of this.obstaculos) {
      obstaculo.objeto.y += fase2.velocidadeObstaculos * segundos;
      if (!obstaculo.jaTocou && this.encostaNaFormiga(obstaculo)) {
        obstaculo.jaTocou = true;
        if (this.invulneravelMs <= 0) {
          this.sofrerBatida();
          break;
        }
      }
    }

    this.removerForaDaTela();

    if (this.pausada) return;

    if (this.progresso >= fase2.distanciaFloresta) {
      this.encerrada = true;
      this.scene.start('Lagarta', { vidas: this.vidas, perdasNoCiclo: this.perdasNoCiclo });
    }
  }

  private comecarDoZero(): void {
    this.faixa = FAIXA_CENTRAL;
    this.vidas = fase2.vidas;
    this.perdasNoCiclo = 0;
    this.invulneravelMs = 0;
    this.progresso = 0;
    this.progressoNaBatida = 0;
    this.tempoDesdeSpawn = 0;
    this.obstaculos = [];
    this.encerrada = false;
    this.pausada = false;
  }

  private xDaFaixa(faixa: number): number {
    return (this.scale.width * (faixa + 0.5)) / FAIXAS;
  }

  private yFormiga(): number {
    return this.scale.height * 0.82;
  }

  private mover(direcao: number): void {
    if (this.encerrada || this.pausada) return;

    const nova = Phaser.Math.Clamp(this.faixa + direcao, 0, FAIXAS - 1);
    if (nova === this.faixa) return;

    this.faixa = nova;
    this.tweens.add({ targets: this.formiga, x: this.xDaFaixa(nova), duration: 120 });
  }

  private criarObstaculo(): void {
    const tipo = Phaser.Utils.Array.GetRandom(TIPOS_OBSTACULO);
    const faixa = Phaser.Math.Between(0, FAIXAS - 1);

    const objeto = this.add.rectangle(
      this.xDaFaixa(faixa),
      -tipo.altura,
      tipo.largura,
      tipo.altura,
      tipo.cor,
    );

    this.obstaculos.push({ objeto, altura: tipo.altura, faixa, jaTocou: false });
  }

  private encostaNaFormiga(obstaculo: Obstaculo): boolean {
    if (obstaculo.faixa !== this.faixa) return false;

    const topoObstaculo = obstaculo.objeto.y - obstaculo.altura / 2;
    const baseObstaculo = obstaculo.objeto.y + obstaculo.altura / 2;
    const topoFormiga = this.formiga.y - TAMANHO_FORMIGA / 2;
    const baseFormiga = this.formiga.y + TAMANHO_FORMIGA / 2;

    return baseObstaculo > topoFormiga && topoObstaculo < baseFormiga;
  }

  private sofrerBatida(): void {
    this.vidas -= 1;
    this.perdasNoCiclo += 1;
    this.invulneravelMs = fase2.invulnerabilidadeMs;
    this.progressoNaBatida = this.progresso;
    this.atualizarVidas();

    // Cada perda mostra uma bronca diferente, até três. Com as três vidas
    // perdidas, a tela 2.4 vem logo depois da última bronca.
    const bronca = textosDaIrma.bronca[this.perdasNoCiclo - 1];
    const semVidas = this.vidas <= 0;
    const paginas = semVidas
      ? [bronca, historia.fase2.retomadaFloresta, textosDaIrma.fraseDeApoio]
      : [bronca];

    this.pausada = true;
    this.scene.pause();
    this.scene.launch('Interludio', {
      paginas,
      aoContinuar: () => (semVidas ? this.recomecar() : this.retomar()),
    });
  }

  // Tela 2.3: a Peteca salva a formiga e a floresta volta um pouco antes da batida.
  private retomar(): void {
    this.progresso = Math.max(0, this.progressoNaBatida - fase2.recuoRetomada);
    this.destruirObstaculos();
    this.tempoDesdeSpawn = 0;
    this.continuar();
  }

  // Tela 2.4: a formiga volta ao início, com três vidas novas.
  private recomecar(): void {
    this.destruirObstaculos();
    this.faixa = FAIXA_CENTRAL;
    this.formiga.x = this.xDaFaixa(this.faixa);
    this.comecarDoZero();
    this.atualizarVidas();
    this.continuar();
  }

  private continuar(): void {
    this.pausada = false;
    this.scene.resume();
  }

  private atualizarVidas(): void {
    this.textoVidas.setText(`${historia.fase2.vidas} ${this.vidas}`);
  }

  private destruirObstaculos(): void {
    this.obstaculos.forEach((obstaculo) => obstaculo.objeto.destroy());
    this.obstaculos = [];
  }

  private removerForaDaTela(): void {
    const limite = this.scale.height + 100;
    this.obstaculos = this.obstaculos.filter((obstaculo) => {
      if (obstaculo.objeto.y <= limite) return true;
      obstaculo.objeto.destroy();
      return false;
    });
  }
}
