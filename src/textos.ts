import type Phaser from 'phaser';

// Texto que ainda não foi escrito. Aparece marcado como [PENDENTE] na tela.
export interface Pendente {
  pendente: string;
}

export type Texto = string | Pendente;

export const MAX_LINHAS = 3;

const MARGEM_LATERAL = 64;

export function pendente(descricao: string): Pendente {
  return { pendente: descricao };
}

export function resolverTexto(texto: Texto): string {
  return typeof texto === 'string' ? texto : `[PENDENTE] ${texto.pendente}`;
}

// Cria um texto centralizado, quebrado na largura da tela, e avisa no console
// se passar do limite de três linhas.
export function criarTexto(
  cena: Phaser.Scene,
  x: number,
  y: number,
  texto: Texto,
  estilo: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  const objeto = cena.add
    .text(x, y, resolverTexto(texto), {
      ...estilo,
      align: 'center',
      wordWrap: { width: cena.scale.width - MARGEM_LATERAL },
    })
    .setOrigin(0.5);

  const linhas = objeto.getWrappedText().length;
  if (linhas > MAX_LINHAS) {
    console.warn(`Texto com ${linhas} linhas (máximo ${MAX_LINHAS}): ${resolverTexto(texto)}`);
  }

  return objeto;
}
