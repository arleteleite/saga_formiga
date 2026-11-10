// Áudio do jogo. Começa desligado: só destrava depois do primeiro toque ou tecla.
//
// A música da batida é um PLACEHOLDER gerado no navegador (bateria e baixo de rock).
// Quando o rock real estiver pronto, troque tocarMusicaBatalha() por um arquivo
// tocado com Phaser (this.sound.add) e mantenha desbloquearAudio() como está.

const BPM = 140;
const PASSO = 60 / BPM / 4; // duração de uma semicolcheia
const PASSOS_POR_COMPASSO = 16;
const NOTAS_BAIXO = [55, 55, 73.42, 65.41]; // notas de Lá, Lá, Ré, Dó (Hz)

let contexto: AudioContext | null = null;
let ruido: AudioBuffer | null = null;
let pedidoBatalha = false;
let temporizador: number | undefined;
let proximoTempo = 0;
let passo = 0;

// Chamado no primeiro toque ou tecla (ver main.ts). Só este gesto destrava o áudio.
export function desbloquearAudio(): void {
  if (!contexto) {
    try {
      contexto = new AudioContext();
    } catch {
      // Sem suporte a áudio, o jogo continua sem música.
      return;
    }
  }

  if (contexto.state === 'suspended') void contexto.resume();
  if (pedidoBatalha) iniciarLoop();
}

export function tocarMusicaBatalha(): void {
  pedidoBatalha = true;
  if (contexto) iniciarLoop();
}

export function pararMusica(): void {
  pedidoBatalha = false;
  if (temporizador !== undefined) {
    window.clearInterval(temporizador);
    temporizador = undefined;
  }
}

function iniciarLoop(): void {
  if (!contexto || temporizador !== undefined) return;

  proximoTempo = contexto.currentTime + 0.05;
  passo = 0;
  temporizador = window.setInterval(agendar, 25);
}

// Agenda as notas um pouco à frente, para o ritmo não falhar com o navegador ocupado.
function agendar(): void {
  if (!contexto) return;

  while (proximoTempo < contexto.currentTime + 0.1) {
    tocarPasso(passo, proximoTempo);
    proximoTempo += PASSO;
    passo = (passo + 1) % PASSOS_POR_COMPASSO;
  }
}

function tocarPasso(p: number, quando: number): void {
  if (p % 4 === 0) bombo(quando);
  if (p % 4 === 2) caixa(quando);
  chimbal(quando);
  if (p % 2 === 0) baixo(NOTAS_BAIXO[(p / 2) % NOTAS_BAIXO.length], quando);
}

function bombo(quando: number): void {
  if (!contexto) return;
  const osc = contexto.createOscillator();
  const ganho = contexto.createGain();
  osc.frequency.setValueAtTime(150, quando);
  osc.frequency.exponentialRampToValueAtTime(40, quando + 0.12);
  ganho.gain.setValueAtTime(0.9, quando);
  ganho.gain.exponentialRampToValueAtTime(0.001, quando + 0.15);
  osc.connect(ganho).connect(contexto.destination);
  osc.start(quando);
  osc.stop(quando + 0.15);
}

function caixa(quando: number): void {
  ruidoFiltrado(quando, 1500, 0.4, 0.15);
}

function chimbal(quando: number): void {
  ruidoFiltrado(quando, 7000, 0.08, 0.04);
}

function ruidoFiltrado(quando: number, frequenciaCorte: number, volume: number, duracao: number): void {
  if (!contexto) return;
  if (!ruido) ruido = criarRuido(contexto);

  const fonte = contexto.createBufferSource();
  const filtro = contexto.createBiquadFilter();
  const ganho = contexto.createGain();
  fonte.buffer = ruido;
  filtro.type = 'highpass';
  filtro.frequency.value = frequenciaCorte;
  ganho.gain.setValueAtTime(volume, quando);
  ganho.gain.exponentialRampToValueAtTime(0.001, quando + duracao);
  fonte.connect(filtro).connect(ganho).connect(contexto.destination);
  fonte.start(quando);
  fonte.stop(quando + duracao);
}

function baixo(frequencia: number, quando: number): void {
  if (!contexto) return;
  const osc = contexto.createOscillator();
  const ganho = contexto.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = frequencia;
  ganho.gain.setValueAtTime(0.08, quando);
  ganho.gain.exponentialRampToValueAtTime(0.001, quando + PASSO * 1.8);
  osc.connect(ganho).connect(contexto.destination);
  osc.start(quando);
  osc.stop(quando + PASSO * 2);
}

function criarRuido(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
  return buffer;
}
