import { pendente } from '../src/textos';

// Textos escritos pela cliente. Ficam isolados para revisão separada.
// Enquanto não forem enviados, aparecem marcados como [PENDENTE].

export const textosDaIrma = {
  // Tela 2.3: uma versão para cada vida perdida (até três vezes).
  bronca: [
    pendente('bronca 1 de 3 (tela 2.3)'),
    pendente('bronca 2 de 3 (tela 2.3)'),
    pendente('bronca 3 de 3 (tela 2.3)'),
  ],

  // Tela 2.4: frase de apoio, uma frase curta.
  fraseDeApoio: pendente('frase de apoio (tela 2.4)'),

  // Tela 3.2: alerta da guardiã, um para cada alerta (até três).
  alertas: [
    pendente('alerta 1 de 3 (tela 3.2)'),
    pendente('alerta 2 de 3 (tela 3.2)'),
    pendente('alerta 3 de 3 (tela 3.2)'),
  ],

  // Tela 4.2: mensagem final, duas a três frases.
  mensagemFinal: pendente('mensagem final (tela 4.2)'),
};
