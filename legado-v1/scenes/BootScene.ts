import Phaser from 'phaser';
import { historia } from '../../config/story';
import { criarTexto } from '../textos';

// Carregamento. Nesta etapa não há arquivos a carregar; a cena só mostra
// um aviso e passa para a tela 0. Os assets entram nas próximas etapas.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const { width, height } = this.scale;

    criarTexto(this, width / 2, height / 2, historia.sistema.carregando, {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#f5e6c8',
    });

    this.scene.start('Inicio');
  }
}
