// Efeitos sonoros simples gerados no navegador (sem arquivos de áudio).
// Começam desligados: só soam depois do primeiro toque ou tecla, e o botão
// de som permite silenciar. A preferência é lembrada quando o navegador permite.

export type Som = 'ok' | 'erro' | 'bateu' | 'vitoria' | 'clique';

const CHAVE = 'formiga-som';
let contexto: AudioContext | null = null;
let ligado = true;

try {
  ligado = localStorage.getItem(CHAVE) !== 'off';
} catch {
  // Sem armazenamento: segue com o padrão.
}

export function somLigado(): boolean {
  return ligado;
}

export function alternarSom(): boolean {
  ligado = !ligado;
  try {
    localStorage.setItem(CHAVE, ligado ? 'on' : 'off');
  } catch {
    // ignora
  }
  return ligado;
}

// Chamado no primeiro gesto do jogador (ver main.ts); só então o áudio é criado.
export function destravarAudio(): void {
  if (!contexto) {
    try {
      contexto = new AudioContext();
    } catch {
      return;
    }
  }
  if (contexto.state === 'suspended') void contexto.resume();
}

function nota(freq: number, inicio: number, dur: number, tipo: OscillatorType = 'sine', vol = 0.12): void {
  if (!contexto) return;
  const o = contexto.createOscillator();
  const g = contexto.createGain();
  o.type = tipo;
  o.frequency.value = freq;
  const t = contexto.currentTime + inicio;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(contexto.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function tocar(som: Som): void {
  if (!ligado || !contexto || contexto.state !== 'running') return;
  switch (som) {
    case 'clique':
      nota(660, 0, 0.05, 'triangle', 0.06);
      break;
    case 'ok':
      nota(660, 0, 0.1);
      nota(880, 0.08, 0.14);
      break;
    case 'erro':
      nota(220, 0, 0.18, 'sawtooth', 0.07);
      break;
    case 'bateu':
      nota(150, 0, 0.12, 'square', 0.07);
      break;
    case 'vitoria':
      [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.11, 0.2, 'triangle', 0.12));
      break;
  }
}
