import Phaser from 'phaser';
import { historia } from '../../config/story';
import { criarTexto, type Texto } from '../textos';

interface DadosInterludio {
  paginas: Texto[];
  aoContinuar: () => void;
  // A vitória sobre a lagarta não tem a Peteca na cena.
  comPeteca?: boolean;
}

// Telas 2.3 (bronca) e 2.4 (resgate): aparecem por cima da floresta pausada.
// A Peteca fica na tela enquanto o texto passa, e cada toque avança a página.
export class InterludioScene extends Phaser.Scene {
  private paginas: Texto[] = [];
  private aoContinuar: () => void = () => {};
  private indice = 0;
  private comPeteca = true;
  private texto: Phaser.GameObjects.Text | null = null;
  // O toque que abriu a tela não pode avançar a página na mesma hora.
  private prontaParaAvancar = false;

  constructor() {
    super('Interludio');
  }

  init(dados: DadosInterludio): void {
    this.paginas = dados.paginas;
    this.aoContinuar = dados.aoContinuar;
    this.comPeteca = dados.comPeteca ?? true;
    this.indice = 0;
  }

  create(): void {
    const { width, height } = this.scale;
    this.texto = null;
    this.prontaParaAvancar = false;
    this.time.delayedCall(250, () => {
      this.prontaParaAvancar = true;
    });

    this.add.rectangle(width / 2, height / 2, width, height, 0x1b1410);

    if (this.comPeteca) this.desenharPeteca();

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

    this.mostrarPagina();
  }

  private desenharPeteca(): void {
    const { width, height } = this.scale;

    // Peteca provisória, até o desenho dela chegar.
    this.add.rectangle(width / 2, height * 0.3, 160, 96, 0x3b2a1e);
    this.add.rectangle(width / 2, height * 0.3 + 26, 56, 34, 0xe88ab0);

    this.add
      .text(width / 2, height * 0.42, 'Peteca', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#c8b48a',
      })
      .setOrigin(0.5);
  }

  private mostrarPagina(): void {
    this.texto?.destroy();
    const { width, height } = this.scale;
    this.texto = criarTexto(this, width / 2, height * 0.62, this.paginas[this.indice], {
      fontFamily: 'sans-serif',
      fontSize: '26px',
      color: '#f5e6c8',
    });
  }

  private avancar(): void {
    if (!this.prontaParaAvancar) return;

    this.indice += 1;

    if (this.indice < this.paginas.length) {
      this.mostrarPagina();
      return;
    }

    const continuar = this.aoContinuar;
    this.scene.stop();
    continuar();
  }
}
