import Phaser from 'phaser';
import { historia } from '../../config/story';

// Tela 3.1 — chegada ao Vale dos Timbiras. Mostra o texto e segue para a casa.
// É também o ponto em que a fase 3 recomeça depois de três alertas.
export class ValeScene extends Phaser.Scene {
  constructor() {
    super('Vale');
  }

  create(): void {
    this.scene.launch('Interludio', {
      paginas: [historia.fase3.chegada],
      comPeteca: false,
      aoContinuar: () => this.scene.start('Casa'),
    });
  }
}
