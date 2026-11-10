import type Phaser from 'phaser';

// Botão padrão do jogo: retângulo com rótulo centralizado, que responde ao toque.
// Devolve um contêiner único, para a cena poder remover o botão inteiro.
export function criarBotao(
  cena: Phaser.Scene,
  x: number,
  y: number,
  rotulo: string,
  aoClicar: () => void,
  largura = 260,
): Phaser.GameObjects.Container {
  const fundo = cena.add
    .rectangle(0, 0, largura, 72, 0xc8702a)
    .setStrokeStyle(4, 0x3a1f0c)
    .setInteractive({ useHandCursor: true });

  const texto = cena.add
    .text(0, 0, rotulo, {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#1b1410',
    })
    .setOrigin(0.5);

  fundo.on('pointerdown', aoClicar);

  return cena.add.container(x, y, [fundo, texto]);
}
