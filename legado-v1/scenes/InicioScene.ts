import Phaser from 'phaser';
import { historia } from '../../config/story';
import { criarTexto } from '../textos';
import { criarBotao } from '../ui';

// Tela 0 — Início.
export class InicioScene extends Phaser.Scene {
  constructor() {
    super('Inicio');
  }

  create(): void {
    const { width, height } = this.scale;

    criarTexto(this, width / 2, height * 0.3, historia.inicio.titulo, {
      fontFamily: 'sans-serif',
      fontSize: '40px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    });

    criarTexto(this, width / 2, height * 0.5, historia.inicio.missao, {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      color: '#f5e6c8',
    });

    criarBotao(this, width / 2, height * 0.72, historia.botoes.comecar, () => {
      this.scene.start('Conselho');
    });
  }
}
