import Phaser from 'phaser';
import { historia } from '../../config/story';
import { rotas, type Rota } from '../../config/route';
import { criarTexto } from '../textos';
import { criarBotao } from '../ui';

// Tela 1.3 — escolha da rota. Mostra a análise da opção e segue para a fase 2.
const ROTAS: Rota[] = ['A', 'B', 'C'];

export class OrcamentoScene extends Phaser.Scene {
  constructor() {
    super('Orcamento');
  }

  create(): void {
    const { width, height } = this.scale;

    criarTexto(this, width / 2, height * 0.25, historia.fase1.orcamento, {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#f5e6c8',
    });

    ROTAS.forEach((rota, i) => {
      criarBotao(
        this,
        width / 2,
        height * (0.45 + i * 0.13),
        rotas[rota].rotulo,
        () => this.escolher(rota),
        440,
      );
    });
  }

  private escolher(rota: Rota): void {
    // Tira os botões: a escolha vale uma vez só.
    this.children.removeAll(true);

    const { width, height } = this.scale;

    criarTexto(this, width / 2, height * 0.4, rotas[rota].analise, {
      fontFamily: 'sans-serif',
      fontSize: '26px',
      color: '#f5e6c8',
    });

    criarBotao(this, width / 2, height * 0.6, historia.botoes.continuar, () => {
      this.scene.start('Floresta');
    }, 360);
  }
}
