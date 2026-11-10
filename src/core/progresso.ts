// Progresso da aventura. A formiga só pode seguir além de uma parada de desafio
// depois que o desafio foi concluído.
export class Progresso {
  private concluidos = new Set<string>();
  indice = 0;

  constructor(private readonly desafiosEmOrdem: string[]) {}

  concluir(id: string): void {
    if (!this.desafiosEmOrdem.includes(id)) throw new Error(`Desafio desconhecido: ${id}`);
    this.concluidos.add(id);
  }

  estaConcluido(id: string): boolean {
    return this.concluidos.has(id);
  }

  // Só libera o desafio N se todos os anteriores foram concluídos.
  podeEntrar(id: string): boolean {
    const i = this.desafiosEmOrdem.indexOf(id);
    if (i < 0) return false;
    return this.desafiosEmOrdem.slice(0, i).every((d) => this.concluidos.has(d));
  }

  // Só pode sair da parada de desafio se concluiu.
  podeSeguir(id: string | undefined): boolean {
    return id === undefined || this.concluidos.has(id);
  }

  todosConcluidos(): boolean {
    return this.desafiosEmOrdem.every((d) => this.concluidos.has(d));
  }

  reiniciar(): void {
    this.concluidos.clear();
    this.indice = 0;
  }
}
