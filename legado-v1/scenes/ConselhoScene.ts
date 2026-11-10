import Phaser from 'phaser';
import { historia } from '../../config/story';
import { criarTexto, type Texto } from '../textos';

// Telas 1.1 e 1.2: narração e conselho, avançam com um toque.
const PASSOS: Texto[] = [historia.fase1.narracao, historia.fase1.conselho];

export class ConselhoScene extends Phaser.Scene {
  private indice = 0;
  private texto: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('Conselho');
  }

  create(): void {
    const { width, height } = this.scale;
    this.indice = 0;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive()
      .on('pointerdown', () => this.avancar());

    this.add
      .text(width / 2, height * 0.9, historia.botoes.continuar, {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#c8b48a',
      })
      .setOrigin(0.5);

    this.mostrarPasso();
  }

  private mostrarPasso(): void {
    this.texto?.destroy();
    const { width, height } = this.scale;
    this.texto = criarTexto(this, width / 2, height / 2, PASSOS[this.indice], {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#f5e6c8',
    });
  }

  private avancar(): void {
    this.indice += 1;

    if (this.indice < PASSOS.length) {
      this.mostrarPasso();
    } else {
      this.scene.start('Orcamento');
    }
  }
}
