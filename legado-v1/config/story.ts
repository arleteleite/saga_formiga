import { pendente } from '../src/textos';

// Textos de todas as telas, exceto os da cliente (ver client-texts.ts).
// Para trocar um texto, edite aqui e recarregue a página.
// Textos ainda não escritos usam pendente(), e aparecem marcados no jogo.

export const historia = {
  sistema: {
    carregando: 'Carregando...',
  },

  botoes: {
    comecar: 'Começar',
    continuar: 'Toque para continuar',
    voltar: 'Voltar',
    jogarDeNovo: 'Jogar de novo',
  },

  inicio: {
    titulo: 'A Saga da Formiga',
    missao: 'A colônia está ameaçada pela fome. Só um herói pode encontrar o lendário Leite.',
  },

  fase1: {
    narracao: 'Na colônia, a comida está acabando. Os anciões se reúnem para decidir quem vai buscar o Leite.',
    conselho: 'A conselheira convoca a formiga. A missão é encontrar o Leite antes que a colônia passe fome.',
    orcamento: 'A colônia tem um orçamento limitado. Escolha a rota.',
  },

  fase2: {
    vidas: 'Vidas:',
    golpes: 'Golpes:',
    chegadaRio: 'A formiga chega à margem do rio Parnaíba. A Peteca aparece e se junta a ele.',
    floresta: 'A floresta de babaçu é cheia de perigos. Desvie dos obstáculos e chegue ao fim do caminho.',
    retomadaFloresta: 'A Peteca resgata a formiga, e ele volta ao início da floresta.',
    lagarta: 'Uma lagarta gigante bloqueia a passagem. É maior do que parece.',
    chefeDicaToque: 'Fuja das faixas vermelhas. Quando a lagarta ficar amarela, toque nela.',
    chefeDicaTeclado: 'Fuja das faixas vermelhas. Quando a lagarta ficar amarela, aperte espaço.',
    vitoria: 'A lagarta recua. O caminho até o Maranhão está livre.',
  },

  fase3: {
    pistasProvisoria: 'Pistas (provisória)',
    alertas: 'Alertas:',
    pistasContador: 'Pistas:',
    caminhoLiberado: 'Caminho liberado.',
    digitar: 'Digite a resposta e aperte Enter.',
    comodos: {
      sala: 'Sala',
      banheiro: 'Banheiro',
      cozinha: 'Cozinha',
      panela: 'Panela',
    },
    chegada: 'O Vale dos Timbiras. Aqui é o território da Leite. Cada canto tem uma regra, e os guardiões estão atentos.',
    infiltracao: 'Antes de entrar na casa, é preciso usar o objeto certo em cada cômodo.',
    pistas: 'Três pistas levam ao Leite. Cada uma é uma sequência de números.',
    pistaPenseNoPadrao: 'Pense no padrão.',
    chegadaLeite: 'A última pista aponta para uma porta. Do outro lado está o lendário Leite.',
  },

  fase4: {
    provisoria: 'Fase 4 (provisória)',
    encontro: 'A formiga abre a porta e encontra o Leite.',
    presente: 'Uma barra de chocolate ao leite, direto de Teresina.',
    encerramento: 'A missão foi cumprida. A colônia está salva.',
    linhaFinal: pendente('linha de encerramento da tela 4.4 (autora)'),
  },
};
