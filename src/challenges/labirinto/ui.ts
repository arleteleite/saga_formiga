import { h, botao } from '../../core/dom';
import type { LabirintoConfig, Montar } from '../../core/tipos';
import { tocar } from '../../core/audio';
import { centroInicio, criarLabirinto, gerarLayout, mover, type Labirinto } from './engine';

const CELULA = 28; // pixels internos por célula
const RAIO = 0.26; // raio da formiga em células (corredor = 1 célula)

export const montarLabirinto: Montar<LabirintoConfig> = (host, cfg, ctx) => {
  // Layout novo a cada partida (ou fixo, se a aventura definir `layout`).
  const layout = cfg.layout ?? gerarLayout(ctx.rng, cfg.gerar ?? { colunas: 6, linhas: 8, passosMin: 30, passosMax: 46 });
  const lab: Labirinto = criarLabirinto(layout);
  const largura = lab.colunas * CELULA;
  const altura = lab.linhas * CELULA;

  const canvas = h('canvas', { class: 'lab-canvas', width: String(largura), height: String(altura) });
  canvas.dataset.layout = layout.join('|');
  canvas.style.aspectRatio = `${largura} / ${altura}`;
  const aviso = h('div', { class: 'aviso', role: 'status' });
  const contador = h('div', { class: 'lab-contador' });
  const g = canvas.getContext('2d');

  const formigaImg = new Image();
  formigaImg.src = `${import.meta.env?.BASE_URL ?? '/'}img/formiga.png`;

  let pos = centroInicio(lab);
  let batidas = 0;
  let flash = 0;
  let acabou = false;
  let ultimo: { x: number; y: number } | null = null;
  let animacao = 0;

  function resultado(r: 'ok' | 'bateu' | 'saida'): void {
    if (r === 'bateu') {
      batidas++;
      tocar('bateu');
      flash = 1;
      aviso.textContent = 'Encostou na parede! De volta ao início.';
      contador.textContent = `Batidas: ${batidas}`;
    } else if (r === 'saida' && !acabou) {
      acabou = true;
      aviso.textContent = 'Saída encontrada!';
      window.setTimeout(() => ctx.concluir(), 1200);
    }
  }

  function deslocar(dx: number, dy: number): void {
    if (acabou) return;
    const r = mover(lab, pos, dx, dy, RAIO);
    pos = r.pos;
    resultado(r.resultado);
  }

  // Controle relativo: o dedo/mouse pode ficar longe da formiga, para não cobri-la.
  const aoApertar = (e: PointerEvent): void => {
    ultimo = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture?.(e.pointerId);
    aviso.textContent = '';
  };
  const aoMover = (e: PointerEvent): void => {
    if (!ultimo) return;
    const caixa = canvas.getBoundingClientRect();
    const escala = caixa.width ? lab.colunas / caixa.width : 0;
    // getCoalescedEvents devolve todos os pontos intermediários, evitando saltos.
    const eventos = e.getCoalescedEvents?.() ?? [];
    for (const ev of eventos.length ? eventos : [e]) {
      deslocar((ev.clientX - ultimo.x) * escala, (ev.clientY - ultimo.y) * escala);
      ultimo = { x: ev.clientX, y: ev.clientY };
    }
  };
  const aoSoltar = (): void => {
    ultimo = null;
  };
  canvas.addEventListener('pointerdown', aoApertar);
  canvas.addEventListener('pointermove', aoMover);
  canvas.addEventListener('pointerup', aoSoltar);
  canvas.addEventListener('pointercancel', aoSoltar);

  const aoTeclar = (e: KeyboardEvent): void => {
    const passo = 0.12;
    const m: Record<string, [number, number]> = {
      ArrowUp: [0, -passo],
      ArrowDown: [0, passo],
      ArrowLeft: [-passo, 0],
      ArrowRight: [passo, 0],
    };
    const d = m[e.key];
    if (!d) return;
    e.preventDefault();
    deslocar(d[0], d[1]);
  };
  document.addEventListener('keydown', aoTeclar);

  function reiniciar(): void {
    pos = centroInicio(lab);
    ultimo = null;
    aviso.textContent = '';
  }

  function desenhar(): void {
    if (!g) return;
    g.clearRect(0, 0, largura, altura);
    g.fillStyle = '#d9c18f';
    g.fillRect(0, 0, largura, altura);
    for (let l = 0; l < lab.linhas; l++) {
      for (let c = 0; c < lab.colunas; c++) {
        if (!lab.paredes[l]![c]) continue;
        g.fillStyle = (l + c) % 2 ? '#2f5d2a' : '#356b30';
        g.fillRect(c * CELULA, l * CELULA, CELULA, CELULA);
      }
    }
    // início e saída
    g.font = `bold ${CELULA * 0.34}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(70,160,70,.6)';
    g.fillRect(lab.inicio.c * CELULA, lab.inicio.l * CELULA, CELULA, CELULA);
    g.fillStyle = 'rgba(230,150,40,.75)';
    g.fillRect(lab.saida.c * CELULA, lab.saida.l * CELULA, CELULA, CELULA);
    g.fillStyle = '#1b1410';
    g.fillText('INÍCIO', (lab.inicio.c + 0.5) * CELULA, (lab.inicio.l + 0.5) * CELULA);
    g.fillText('SAÍDA', (lab.saida.c + 0.5) * CELULA, (lab.saida.l + 0.5) * CELULA);

    // formiga
    const px = pos.x * CELULA;
    const py = pos.y * CELULA;
    if (formigaImg.complete && formigaImg.naturalWidth) {
      // Desenho maior que o corredor, só visual: a colisão usa o círculo de RAIO.
      const alt = CELULA * 2.4;
      const larg = (alt * formigaImg.naturalWidth) / formigaImg.naturalHeight;
      g.drawImage(formigaImg, px - larg / 2, py - alt * 0.85, larg, alt);
    }
    g.beginPath();
    g.arc(px, py, RAIO * CELULA, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(255,255,255,.7)';
    g.lineWidth = 1.5;
    g.stroke();

    if (flash > 0) {
      g.fillStyle = `rgba(220,40,40,${flash * 0.45})`;
      g.fillRect(0, 0, largura, altura);
      flash = Math.max(0, flash - 0.06);
    }
    animacao = requestAnimationFrame(desenhar);
  }

  host.append(
    h('h2', { class: 'titulo-desafio' }, 'O labirinto da floresta'),
    canvas,
    aviso,
    contador,
    botao('Reiniciar labirinto', reiniciar, 'btn secundario'),
  );
  contador.textContent = 'Batidas: 0';
  if (g) animacao = requestAnimationFrame(desenhar);

  return () => {
    cancelAnimationFrame(animacao);
    document.removeEventListener('keydown', aoTeclar);
  };
};
