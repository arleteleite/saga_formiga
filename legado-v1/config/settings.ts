// Configurações de jogo: números que o designer pode ajustar sem mexer na lógica.

export const settings = {
  fase2: {
    vidas: 3,
    // Tempo em que a formiga fica invulnerável depois de uma batida.
    invulnerabilidadeMs: 1500,
    // Quanto a floresta volta, em pixels, ao retomar depois de uma batida.
    recuoRetomada: 600,
    // Distância percorrida na floresta até a lagarta, em pixels.
    distanciaFloresta: 12000,
    // Velocidade de descida dos obstáculos, em pixels por segundo.
    velocidadeObstaculos: 280,
    // Intervalo entre o surgimento de dois obstáculos, em milissegundos.
    intervaloObstaculosMs: 900,
    // Tempo em que a banner da tela 2.2 fica visível, em milissegundos.
    tempoBannerMs: 4000,
  },

  fase3: {
    // Alertas da guardiã que reiniciam a fase 3.
    alertasMaximos: 3,
    // Tremor da tela a cada alerta, em milissegundos e intensidade (0 a 1).
    tremorMs: 300,
    tremorIntensidade: 0.01,
  },

  chefe: {
    // Golpes certos necessários para vencer a lagarta.
    golpes: 3,
    // Duração de cada etapa do ataque, em milissegundos.
    pausaMs: 1000,
    avisoMs: 500,
    golpeMs: 350,
    // Janela em que a lagarta fica vulnerável depois de cada ataque.
    janelaMs: 1200,
  },
};
