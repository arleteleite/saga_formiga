import Phaser from 'phaser';
import { historia } from '../../config/story';
import { criarTexto } from '../textos';
import { criarBotao } from '../ui';

// Cena provisória da fase 4. Será substituída pelo encontro com o Leite na etapa E9.
export class Fase4ProvisoriaScene extends Phaser.Scene {
  constructor() {
    super('Fase4Provisoria');
  }

  create(): void {
    const { width, height } = this.scale;

    criarTexto(this, width / 2, height * 0.45, historia.fase4.provisoria, {
      fontFamily: 'sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    });

    // Sem este botão a tela seria um beco sem saída (RF6).
    criarBotao(this, width / 2, height * 0.6, historia.botoes.voltar, () => {
      this.scene.start('Inicio');
    });
  }
}
