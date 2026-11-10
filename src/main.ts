import Phaser from 'phaser';
import './estilo.css';
import { destravarAudio } from './core/audio';
import { Palco } from './core/palco';
import { Progresso } from './core/progresso';
import { MapaScene, LARGURA } from './map/MapaScene';
import { paradas, bronca, protagonista } from '../adventures/formiga-leite/aventura';

// Textos de interface (botões e rótulos), separados da lógica.
const textosInterface = {
  continuar: 'Toque para continuar',
  seguir: 'Seguir caminho',
  nomeProtagonista: protagonista,
  petecaPergunta: `${protagonista}: Peteca, como funciona este desafio?`,
  petecaBotao: 'Pergunte à Peteca',
  fechar: 'Entendi',
};

const raiz = document.getElementById('palco')!;
const ordemDesafios = paradas.flatMap((p) => (p.fase ? [p.fase.id] : []));
const progresso = new Progresso(ordemDesafios);
const palco = new Palco(raiz, textosInterface, bronca, Math.random);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1b1410',
  width: LARGURA,
  height: 960,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [new MapaScene(palco, paradas, progresso)],
});

document.addEventListener('pointerdown', destravarAudio, { once: true });
document.addEventListener('keydown', destravarAudio, { once: true });
