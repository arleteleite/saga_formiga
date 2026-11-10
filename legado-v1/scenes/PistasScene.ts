import Phaser from 'phaser';
import { historia } from '../../config/story';
import { sequencias } from '../../config/trials';
import { criarTexto } from '../textos';
import { criarBotao } from '../ui';

const MAX_DIGITOS = 4;

// Tela 3.3 — três sequências numéricas. Os botões funcionam em qualquer aparelho;
// no computador também dá para digitar a resposta e apertar Enter.
// Acerto libera o caminho. Erro mostra a dica, sem penalidade.
export class PistasScene extends Phaser.Scene {
  private indice = 0;
  private digitado = '';
  private conteudo: Phaser.GameObjects.GameObject[] = [];
  private textoProgresso!: Phaser.GameObjects.Text;
  private textoDigitado: Phaser.GameObjects.Text | null = null;
  private dica: Phaser.GameObjects.Text | null = null;

  private aoTeclar = (evento: KeyboardEvent): void => {
    if (/^[0-9]$/.test(evento.key)) {
      if (this.digitado.length < MAX_DIGITOS) this.digitado += evento.key;
      this.atualizarDigitado();
    } else if (evento.key === 'Backspace') {
      this.digitado = this.digitado.slice(0, -1);
      this.atualizarDigitado();
    } else if (evento.key === 'Enter' && this.digitado !== '') {
      this.responder(Number(this.digitado));
    }
  };

  constructor() {
    super('Pistas');
  }

  create(): void {
    const { width, height } = this.scale;

    this.indice = 0;
    this.digitado = '';
    this.conteudo = [];
    this.textoDigitado = null;
    this.dica = null;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1b1410);

    this.textoProgresso = this.add
      .text(width - 16, 16, '', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#f5e6c8',
      })
      .setOrigin(1, 0);
    this.atualizarProgresso();

    if (!this.game.device.input.touch) {
      criarTexto(this, width / 2, height * 0.1, historia.fase3.digitar, {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#c8b48a',
      });
      this.input.keyboard?.on('keydown', this.aoTeclar);
    }

    this.events.once('shutdown', () => {
      this.input.keyboard?.off('keydown', this.aoTeclar);
    });

    this.mostrarSequencia();
  }

  private mostrarSequencia(): void {
    this.limparConteudo();
    this.digitado = '';
    const { width, height } = this.scale;
    const sequencia = sequencias[this.indice];

    this.adicionar(
      criarTexto(this, width / 2, height * 0.3, `${sequencia.termos.join(', ')}, ?`, {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#f5e6c8',
      }),
    );

    this.textoDigitado = this.add
      .text(width / 2, height * 0.4, '_', {
        fontFamily: 'sans-serif',
        fontSize: '36px',
        color: '#f5e6c8',
      })
      .setOrigin(0.5);
    this.adicionar(this.textoDigitado);

    sequencia.opcoes.forEach((opcao, i) => {
      this.adicionar(
        criarBotao(this, width / 2, height * (0.52 + i * 0.1), String(opcao), () => this.responder(opcao), 260),
      );
    });

    this.dica = this.add
      .text(width / 2, height * 0.9, '', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#c8b48a',
      })
      .setOrigin(0.5);
    this.adicionar(this.dica);
  }

  private responder(valor: number): void {
    if (valor === sequencias[this.indice].resposta) {
      this.acertar();
    } else {
      this.errar();
    }
  }

  private acertar(): void {
    this.indice += 1;
    this.atualizarProgresso();
    this.limparConteudo();
    const { width, height } = this.scale;

    this.adicionar(
      criarTexto(this, width / 2, height * 0.4, historia.fase3.caminhoLiberado, {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#f5e6c8',
      }),
    );

    this.adicionar(
      criarBotao(this, width / 2, height * 0.6, historia.botoes.continuar, () => {
        if (this.indice < sequencias.length) {
          this.mostrarSequencia();
        } else {
          this.chegarAoLeite();
        }
      }, 440),
    );
  }

  private errar(): void {
    this.digitado = '';
    this.atualizarDigitado();
    this.dica?.setText(historia.fase3.pistaPenseNoPadrao);
  }

  // Tela 3.4: a última pista abre a porta. Depois, a fase 4 (ainda provisória).
  private chegarAoLeite(): void {
    this.scene.pause();
    this.scene.launch('Interludio', {
      paginas: [historia.fase3.chegadaLeite],
      comPeteca: false,
      aoContinuar: () => this.scene.start('Fase4Provisoria'),
    });
  }

  private atualizarDigitado(): void {
    this.textoDigitado?.setText(this.digitado === '' ? '_' : this.digitado);
  }

  private atualizarProgresso(): void {
    this.textoProgresso.setText(`${historia.fase3.pistasContador} ${this.indice}/${sequencias.length}`);
  }

  private adicionar(objeto: Phaser.GameObjects.GameObject): void {
    this.conteudo.push(objeto);
  }

  private limparConteudo(): void {
    this.conteudo.forEach((objeto) => objeto.destroy());
    this.conteudo = [];
    this.textoDigitado = null;
    this.dica = null;
  }
}
