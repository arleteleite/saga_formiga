import Phaser from 'phaser';
import type { Palco } from '../core/palco';
import { Progresso } from '../core/progresso';
import type { Parada } from '../core/tipos';
import { abertura, titulo, linhaFinal } from '../../adventures/formiga-leite/aventura';
import { TRILHA } from './trilha';

export const MUNDO_ALTURA = 5760;
export const LARGURA = 540;

const reduzirMovimento = (): boolean => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Zonas do mapa, de cima (y pequeno) para baixo.
const ZONAS: { ate: number; cor: number; nome: string }[] = [
  { ate: 700, cor: 0xe9d9a8, nome: 'destino' },
  { ate: 1500, cor: 0xb9a07a, nome: 'porta' },
  { ate: 2400, cor: 0x8fae6a, nome: 'vale' },
  { ate: 3300, cor: 0x4f8a45, nome: 'travessia' },
  { ate: 4200, cor: 0x2f6b34, nome: 'floresta' },
  { ate: 4950, cor: 0x4a90c8, nome: 'rio' },
  { ate: 5760, cor: 0x9bbf6a, nome: 'colonia' },
];

// Mapa contínuo vertical. O fundo é a arte final em 6 faixas (public/img/mapa_0..5.webp,
// de cima para baixo, cada uma 540x960 no jogo). Se as imagens faltarem, cai no cenário
// provisório desenhado em código. A trilha andável está em ./trilha.ts.
const FAIXAS = 6;
const FAIXA_ALTURA = MUNDO_ALTURA / FAIXAS;
export class MapaScene extends Phaser.Scene {
  private formiga!: Phaser.GameObjects.Image;
  private peteca?: Phaser.GameObjects.Image;
  private trilha: { x: number; y: number }[] = [];

  constructor(
    private readonly palco: Palco,
    private readonly paradas: Parada[],
    private readonly progresso: Progresso,
  ) {
    super('Mapa');
  }

  preload(): void {
    const base = import.meta.env.BASE_URL;
    for (const n of ['formiga', 'peteca3']) {
      this.load.image(n, `${base}img/${n}.png`);
    }
    for (let i = 0; i < FAIXAS; i++) this.load.image(`mapa_${i}`, `${base}img/mapa_${i}.webp`);
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, LARGURA, MUNDO_ALTURA);
    this.desenharCenario();

    const inicio = this.paradas[0]!;
    this.formiga = this.add.image(inicio.x, inicio.y, 'formiga').setOrigin(0.5, 1).setDepth(10);
    this.formiga.setScale(120 / this.formiga.height);
    this.cameras.main.scrollY = inicio.y - 700;
    this.cameras.main.startFollow(this.formiga, true, 0.1, 0.1, 0, 180);

    void this.executar();
  }

  update(): void {
    if (this.peteca) {
      const alvo = this.trilha[Math.max(0, this.trilha.length - 14)] ?? { x: this.formiga.x, y: this.formiga.y };
      this.peteca.x += (alvo.x + 50 - this.peteca.x) * 0.15;
      this.peteca.y += (alvo.y - this.peteca.y) * 0.15;
    }
  }

  private desenharCenario(): void {
    const arte = Array.from({ length: FAIXAS }, (_, i) => this.textures.exists(`mapa_${i}`)).every(Boolean);
    if (arte) {
      for (let i = 0; i < FAIXAS; i++) {
        this.add.image(0, i * FAIXA_ALTURA, `mapa_${i}`).setOrigin(0, 0).setDisplaySize(LARGURA, FAIXA_ALTURA + 1).setDepth(0);
      }
    } else {
      this.desenharCenarioProvisorio();
    }
    this.desenharMarcos(!arte);
  }

  private desenharCenarioProvisorio(): void {
    let topo = 0;
    for (const z of ZONAS) {
      this.add.rectangle(LARGURA / 2, (topo + z.ate) / 2, LARGURA, z.ate - topo + 2, z.cor).setDepth(0);
      topo = z.ate;
    }
    const g = this.add.graphics().setDepth(1);

    // Trilha de terra ligando as paradas.
    g.lineStyle(46, 0xd9b77a, 1);
    g.beginPath();
    const pts = this.paradas.map((p) => ({ x: p.x, y: p.y }));
    g.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      g.lineTo(a.x, (a.y + b.y) / 2);
      g.lineTo(b.x, (a.y + b.y) / 2);
      g.lineTo(b.x, b.y);
    }
    g.strokePath();
    g.lineStyle(4, 0xb08a4a, 1);
    g.strokePath();

    // Rio: faixa de ondas e ponte de pedra na trilha.
    g.lineStyle(3, 0xffffff, 0.5);
    for (let y = 4220; y < 4940; y += 36) {
      for (let x = 20; x < LARGURA; x += 90) {
        g.beginPath();
        g.arc(x + ((y / 36) % 2) * 40, y, 14, Math.PI, 0);
        g.strokePath();
      }
    }

    // Decoração pseudo-aleatória estável (semente fixa).
    const rnd = new Phaser.Math.RandomDataGenerator(['formiga']);
    const prox = (zona: string, qtd: number, desenhar: (x: number, y: number) => void): void => {
      const i = ZONAS.findIndex((z) => z.nome === zona);
      const t = i === 0 ? 0 : ZONAS[i - 1]!.ate;
      for (let k = 0; k < qtd; k++) {
        const x = rnd.between(10, LARGURA - 10);
        const y = rnd.between(t + 20, ZONAS[i]!.ate - 20);
        // Evita cobrir a trilha (perto das paradas).
        if (this.paradas.some((p) => Math.abs(p.x - x) < 55 && Math.abs(p.y - y) < 160)) continue;
        desenhar(x, y);
      }
    };
    const palmeira = (x: number, y: number): void => {
      g.fillStyle(0x6b4a2b, 1);
      g.fillRect(x - 5, y - 70, 10, 70);
      g.fillStyle(0x1f7a3a, 1);
      for (const a of [-60, -20, 20, 60]) {
        g.fillTriangle(x, y - 70, x + Math.cos(((a - 90) * Math.PI) / 180) * 55, y - 70 + Math.sin(((a - 90) * Math.PI) / 180) * 55, x + Math.cos(((a - 70) * Math.PI) / 180) * 45, y - 70 + Math.sin(((a - 70) * Math.PI) / 180) * 45);
      }
    };
    const touceira = (x: number, y: number): void => {
      g.fillStyle(0x2f7a38, 0.9);
      g.fillCircle(x, y, 16);
      g.fillCircle(x + 14, y + 4, 12);
    };
    const pedra = (x: number, y: number): void => {
      g.fillStyle(0x8a8a8a, 1);
      g.fillEllipse(x, y, 34, 22);
    };
    prox('floresta', 40, palmeira);
    prox('travessia', 26, palmeira);
    prox('vale', 30, touceira);
    prox('colonia', 22, touceira);
    prox('porta', 20, pedra);
    prox('destino', 10, touceira);

  }

  private desenharMarcos(comTitulo: boolean): void {
    const g = this.add.graphics().setDepth(1);
    // Marcos nas paradas.
    const marco = (p: Parada, rotulo: string, cor: number): void => {
      g.fillStyle(cor, 1);
      g.fillRoundedRect(p.x - 70, p.y - 18, 140, 36, 10);
      this.add.text(p.x, p.y, rotulo, { fontFamily: 'sans-serif', fontSize: '18px', color: '#1b1410', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2);
    };
    const nomes: Record<string, [string, number]> = {
      colonia: ['Colônia · Teresina', 0xf2c879],
      rio: ['Rio Parnaíba', 0xbfe0f5],
      floresta: ['Floresta de babaçu', 0xa5d68a],
      travessia: ['Passagem trancada', 0xd8b0a0],
      vale: ['Vale dos Timbiras', 0xe0e0a0],
      porta: ['Porta do Leite', 0xf0c8a0],
      destino: ['O lendário Leite', 0xffffff],
    };
    for (const p of this.paradas) {
      const [r, c] = nomes[p.id] ?? [p.id, 0xffffff];
      marco({ ...p, y: p.y + 70 }, r, c);
    }
    if (comTitulo) this.add.text(LARGURA / 2, MUNDO_ALTURA - 60, titulo, { fontFamily: 'sans-serif', fontSize: '30px', color: '#1b1410', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2);
  }

  private caminhar(para: Parada): Promise<void> {
    return new Promise((resolve) => {
      const de = { x: this.formiga.x, y: this.formiga.y };
      // Segue a linha central da trilha desenhada no mapa (sempre subindo).
      const meio = TRILHA.filter(([, y]) => y < de.y - 10 && y > para.y + 10)
        .sort((a, b) => b[1] - a[1])
        .map(([x, y]) => ({ x, y }));
      const pontos = [de, ...meio, { x: para.x, y: para.y }];
      const reduzido = reduzirMovimento();
      let i = 1;
      const bob = reduzido
        ? null
        : this.tweens.add({ targets: this.formiga, angle: { from: -4, to: 4 }, duration: 160, yoyo: true, repeat: -1 });
      const passo = (): void => {
        if (i >= pontos.length) {
          bob?.stop();
          this.formiga.setAngle(0);
          resolve();
          return;
        }
        const alvo = pontos[i]!;
        const dist = Phaser.Math.Distance.Between(this.formiga.x, this.formiga.y, alvo.x, alvo.y);
        if (Math.abs(alvo.x - this.formiga.x) > 3) this.formiga.setFlipX(alvo.x < this.formiga.x);
        i++;
        this.tweens.add({
          targets: this.formiga,
          x: alvo.x,
          y: alvo.y,
          duration: Math.max(50, dist / (reduzido ? 0.9 : 0.45)),
          onUpdate: () => this.trilha.push({ x: this.formiga.x, y: this.formiga.y }),
          onComplete: passo,
        });
      };
      passo();
    });
  }

  private async executar(): Promise<void> {
    const p = this.palco;
    await p.abertura(titulo, abertura);
    for (let i = 0; i < this.paradas.length; i++) {
      const parada = this.paradas[i]!;
      if (i > 0) {
        // Só segue se o desafio da parada anterior foi concluído.
        const anterior = this.paradas[i - 1]!;
        if (!this.progresso.podeSeguir(anterior.fase?.id)) throw new Error('Progresso bloqueado');
        await this.caminhar(parada);
      }
      if (parada.petecaSeJunta) {
        this.peteca = this.add.image(this.formiga.x + 50, this.formiga.y, 'peteca3').setOrigin(0.5, 1).setDepth(9);
        this.peteca.setScale(75 / this.peteca.height);
      }
      await p.dialogo(parada.final ? parada.antes.slice(0, 1) : parada.antes);
      if (parada.fase) {
        if (!this.progresso.podeEntrar(parada.fase.id)) throw new Error('Desafio fora de ordem');
        await p.desafio(parada.fase);
        this.progresso.concluir(parada.fase.id);
        if (parada.depois) await p.dialogo(parada.depois, 'Seguir caminho');
      }
      if (parada.final) {
        if (!this.progresso.todosConcluidos()) throw new Error('Final antes da hora');
        await p.dialogo(parada.antes.slice(1), 'Continuar');
        p.fim('Missão cumprida', linhaFinal, 'Jogar de novo', () => window.location.reload(), 'katia_formiga_peteca_felizes');
      }
    }
  }
}
