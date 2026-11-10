import type { Fase, Parada, Linha } from '../../src/core/tipos';
import { puzzlesCalcudoku } from './puzzles-calcudoku';
import { textosDaCliente } from './textos-cliente';

// Aventura "A Saga da Formiga". Tudo que muda de uma encomenda para outra está
// nesta pasta: textos, frases da Forca, puzzles, layout do labirinto e paradas do mapa.
// Textos marcados como (rascunho) foram escritos como proposta e precisam de aprovação.

export const titulo = 'A Saga da Formiga';
export const protagonista = 'Felipe';
export const abertura = {
  jogar: 'Jogar',
  iniciar: 'Iniciar o jogo',
  tituloHistoria: 'A missão do Felipe',
  // Texto completo da história (rascunho meu; aprove ou reescreva).
  historia: [
    'Na colônia, a comida está acabando. Os anciões se reuniram e escolheram a formiga mais corajosa, o Felipe, para uma missão: encontrar o lendário Leite, escondido além do rio Parnaíba, no Vale dos Timbiras, no Maranhão.',
    'No caminho, ele vai enfrentar um labirinto na floresta, uma passagem trancada, os guardiões do vale e uma porta com enigma. Cada obstáculo só se abre com raciocínio e atenção. A Peteca, uma cachorrinha que conhece todas as regras, vai acompanhá-lo.',
    'Se o Felipe não voltar com o Leite, a colônia passa fome. Você aceita ajudá-lo?',
  ],
};

// Palavras da Forca (3 por partida, sorteadas). Mistura do universo da história com
// vocabulário de estatística e de direito, quase todas com 9 letras ou mais.
// Para trocar, edite a lista: acentos e cedilha são aceitos.
const palavrasForca = [
  // Universo da história
  { palavra: 'Babaçu', dica: 'A palmeira da floresta' },
  { palavra: 'Parnaíba', dica: 'O rio da travessia' },
  { palavra: 'Teresina', dica: 'De onde vem o chocolate' },
  { palavra: 'Timbiras', dica: 'O vale do Leite' },
  { palavra: 'Chocolate', dica: 'O presente' },
  { palavra: 'Formigueiro', dica: 'A casa da colônia' },
  // Estatística
  { palavra: 'Distribuição', dica: 'Estatística' },
  { palavra: 'Probabilidade', dica: 'Estatística' },
  { palavra: 'Heterocedasticidade', dica: 'Estatística: variância não constante' },
  { palavra: 'Multicolinearidade', dica: 'Estatística: regressão' },
  { palavra: 'Significância', dica: 'Estatística: teste de hipóteses' },
  { palavra: 'Amostragem', dica: 'Estatística' },
  { palavra: 'Correlação', dica: 'Estatística' },
  { palavra: 'Estocástico', dica: 'Estatística: processo aleatório' },
  { palavra: 'Assimetria', dica: 'Estatística: forma da distribuição' },
  { palavra: 'Confiabilidade', dica: 'Estatística' },
  { palavra: 'Bayesiano', dica: 'Estatística: Thomas Bayes' },
  // Direito
  { palavra: 'Jurisprudência', dica: 'Direito' },
  { palavra: 'Contraditório', dica: 'Direito: princípio do processo' },
  { palavra: 'Litispendência', dica: 'Direito processual' },
  { palavra: 'Imprescritível', dica: 'Direito' },
  { palavra: 'Usucapião', dica: 'Direito: propriedade' },
  { palavra: 'Sucumbência', dica: 'Direito processual' },
  { palavra: 'Prescrição', dica: 'Direito' },
  { palavra: 'Inadimplemento', dica: 'Direito: contratos' },
  { palavra: 'Jurisdição', dica: 'Direito' },
  { palavra: 'Legitimidade', dica: 'Direito' },
];

export const fases: Record<'labirinto' | 'senha' | 'forca' | 'calcudoku', Fase> = {
  labirinto: {
    id: 'labirinto',
    tipo: 'labirinto',
    config: { gerar: { colunas: 6, linhas: 8, passosMin: 30, passosMax: 46 }, susto: { ativo: false } },
    regras: [
      'Encoste o dedo (ou o mouse) em qualquer lugar da tela e arraste: o Felipe acompanha o movimento.',
      'Leve o Felipe do INÍCIO até a SAÍDA sem encostar nas paredes.',
      'Se encostar numa parede, ela volta ao início. As setas do teclado também funcionam.',
    ],
  },
  senha: {
    id: 'senha',
    tipo: 'senha',
    config: { digitos: 4, tentativas: 7, codigo: null },
    regras: [
      'A senha tem 4 algarismos diferentes entre si. O primeiro pode ser zero.',
      'A cada palpite, mostro quantos algarismos estão na posição certa e quantos existem na senha, mas em outra posição.',
      'Você tem 7 tentativas. Se acabarem, a senha muda e você recomeça.',
    ],
  },
  forca: {
    id: 'forca',
    tipo: 'forca',
    config: { maxErros: 6, palavrasParaVencer: 3, palavras: palavrasForca },
    regras: [
      'Descubra a palavra escondida escolhendo uma letra por vez. A dica mostra o assunto.',
      'Letra certa aparece em todos os lugares dela. Letra errada completa o desenho da forca.',
      'Você pode errar até 6 vezes por palavra. Acentos e cedilha não contam: A vale para Á, Ã e Â.',
      'Para passar, descubra 3 palavras. Elas são sorteadas a cada partida.',
    ],
  },
  calcudoku: {
    id: 'calcudoku',
    tipo: 'calcudoku',
    config: { puzzles: puzzlesCalcudoku },
    regras: [
      'Preencha a grade 5×5 com os números de 1 a 5, sem repetir na mesma linha nem na mesma coluna.',
      'Cada gaiola (região com borda grossa) mostra um alvo e uma operação: some, multiplique, subtraia (diferença) ou divida (quociente exato).',
      'Dentro da gaiola o número pode repetir, desde que não esteja na mesma linha ou coluna.',
    ],
  },
};

const F = (texto: string, pose: Linha['pose'] = 'formiga'): Linha => ({ quem: 'formiga', pose, texto });
const N = (texto: string): Linha => ({ quem: 'narrador', texto });
const P = (texto: string, pose: Linha['pose'] = 'peteca3'): Linha => ({ quem: 'peteca', pose, texto });

// Paradas ao longo do mapa vertical, da colônia (embaixo) ao Leite (em cima).
export const paradas: Parada[] = [
  {
    id: 'colonia',
    x: 356,
    y: 5560,
    petecaSeJunta: true,
    antes: [
      N('Antes de partir, uma cachorrinha corre até o Felipe, abanando o rabo.'),
      P('Sou a Peteca. Sei todas as regras por aqui. Se precisar, é só me chamar!'),
      F('Bem-vinda à missão, Peteca! Vamos?', 'formiga4'),
    ],
  },
  {
    id: 'rio',
    x: 411,
    y: 4560,
    antes: [N('O Felipe e a Peteca chegam à margem do rio Parnaíba. Do outro lado fica a floresta de babaçu.')],
  },
  {
    id: 'floresta',
    x: 260,
    y: 3630,
    antes: [N('A floresta de babaçu é um labirinto de folhas. Um passo em falso e o Felipe volta ao começo.')],
    fase: fases.labirinto,
    depois: [F('Saí! O caminho está livre.', 'formiga4')],
  },
  {
    id: 'travessia',
    x: 258,
    y: 2340,
    antes: [N('Uma passagem trancada para o Maranhão. Só abre com uma senha de quatro algarismos.')],
    fase: fases.senha,
    depois: [N('Clique! A passagem se abriu.'), P('Eu sabia que você conseguia!')],
  },
  {
    id: 'vale',
    x: 275,
    y: 1780,
    antes: [
      N('O Vale dos Timbiras. Aqui é o território da Leite. Cada canto tem uma regra, e os guardiões estão atentos.'),
      N('Para passar, é preciso descobrir três palavras.'),
    ],
    fase: fases.forca,
    depois: [N('As palavras foram descobertas. O vale abre caminho.')],
  },
  {
    id: 'porta',
    x: 207,
    y: 1080,
    antes: [N('A última pista aponta para uma porta. Do outro lado está o lendário Leite. Mas a porta tem um enigma.')],
    fase: fases.calcudoku,
    depois: [N('A porta se abre devagar.'), F('Chegamos!', 'formiga4')],
  },
  {
    id: 'destino',
    x: 270,
    y: 250,
    final: true,
    antes: [
      N('O Felipe abre a porta e encontra o Leite.'),
      { quem: 'cliente', pose: 'katia', texto: textosDaCliente.mensagemFinal },
      N('Uma barra de chocolate ao leite, direto de Teresina.'),
      { quem: 'cliente', pose: 'katia_formiga', texto: 'A Kátia dá um beijo no Felipe. A Peteca late de felicidade.' },
    ],
  },
];

// Encerramento (rascunho escrito a pedido da autora).
export const linhaFinal = 'O Felipe, a Kátia e a Peteca viraram uma família, com muito chocolate.';

export const bronca = textosDaCliente.bronca;
