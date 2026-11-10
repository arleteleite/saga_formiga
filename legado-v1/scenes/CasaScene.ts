import Phaser from 'phaser';
import { historia } from '../../config/story';
import { settings } from '../../config/settings';
import { comodos, type Comodo } from '../../config/trials';
import { textosDaIrma } from '../../config/client-texts';
import { criarTexto, type Texto } from '../textos';
import { criarBotao } from '../ui';

const { fase3 } = settings;

// Tela 3.2 — infiltração. Quatro cômodos em ordem. Acerto dá pista e avança;
// erro sobe o alerta da guardiã, com tremor. Três alertas reiniciam a fase 3.
export class CasaScene extends Phaser.Scene {
  private indice = 0;
  private alertas = 0;
  private conteudo: Phaser.GameObjects.GameObject[] = [];
  private textoAlertas!: Phaser.GameObjects.Text;

  constructor() {
    super('Casa');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x2d1f14);
    this.indice = 0;
    this.alertas = 0;
    this.conteudo = [];

    this.textoAlertas = this.add
      .text(width - 16, 16, '', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#f5e6c8',
      })
      .setOrigin(1, 0);
    this.atualizarAlertas();

    this.mostrarComodo();
  }

  private mostrarComodo(): void {
    this.limparConteudo();
    const { width, height } = this.scale;
    const comodo = comodos[this.indice];

    this.adicionar(
      this.add
        .text(width / 2, height * 0.22, historia.fase3.comodos[comodo.id], {
          fontFamily: 'sans-serif',
          fontSize: '40px',
          fontStyle: 'bold',
          color: '#f5e6c8',
        })
        .setOrigin(0.5),
    );

    comodo.opcoes.forEach((opcao, i) => {
      this.adicionar(
        criarBotao(this, width / 2, height * (0.42 + i * 0.13), opcao, () => this.escolher(i), 360),
      );
    });
  }

  private escolher(opcao: number): void {
    const comodo = comodos[this.indice];

    if (opcao === comodo.correta) {
      this.acertar(comodo);
    } else {
      this.errar();
    }
  }

  private acertar(comodo: Comodo): void {
    this.limparConteudo();
    const { width, height } = this.scale;

    this.adicionar(this.textoCentral(height * 0.4, comodo.pista));

    this.adicionar(
      criarBotao(this, width / 2, height * 0.6, historia.botoes.continuar, () => {
        this.indice += 1;
        if (this.indice < comodos.length) {
          this.mostrarComodo();
        } else {
          this.scene.start('Pistas');
        }
      }, 440),
    );
  }

  private errar(): void {
    this.alertas += 1;
    this.atualizarAlertas();
    this.cameras.main.shake(fase3.tremorMs, fase3.tremorIntensidade);

    this.limparConteudo();
    const { width, height } = this.scale;
    const alerta: Texto = textosDaIrma.alertas[this.alertas - 1];

    this.adicionar(this.textoCentral(height * 0.4, alerta));

    const reiniciar = this.alertas >= fase3.alertasMaximos;
    this.adicionar(
      criarBotao(this, width / 2, height * 0.6, historia.botoes.continuar, () => {
        // Três alertas: a fase 3 recomeça desde a chegada ao vale.
        if (reiniciar) {
          this.scene.start('Vale');
        } else {
          this.mostrarComodo();
        }
      }, 440),
    );
  }

  private textoCentral(y: number, texto: Texto): Phaser.GameObjects.Text {
    return criarTexto(this, this.scale.width / 2, y, texto, {
      fontFamily: 'sans-serif',
      fontSize: '26px',
      color: '#f5e6c8',
    });
  }

  private adicionar(objeto: Phaser.GameObjects.GameObject): void {
    this.conteudo.push(objeto);
  }

  private limparConteudo(): void {
    this.conteudo.forEach((objeto) => objeto.destroy());
    this.conteudo = [];
  }

  private atualizarAlertas(): void {
    this.textoAlertas.setText(`${historia.fase3.alertas} ${this.alertas}/${fase3.alertasMaximos}`);
  }
}
