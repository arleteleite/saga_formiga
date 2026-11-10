# PRD — A Saga da Formiga

Versão: 1.0 (rascunho para aprovação)
Base: `brief-saga-da-formiga.md` (raiz e `docs/`) e imagens em `assets-originais/`.

## 1. Escopo

Jogo web curto, interativo e personalizado, feito por encomenda para o marido da cliente. O jogador controla uma formiga que sai da colônia para buscar o lendário Leite, atravessa o Piauí e o Maranhão, enfrenta desafios e termina com uma mensagem final e um presente da cliente.

- **Jogador:** uma única pessoa, que recebe o link.
- **Duração alvo:** 5 a 8 minutos.
- **Plataformas:** mobile-first (foco em Android), compatível com computador.
- **Publicação:** aplicação estática, publicada por link.

## 2. Decisões já tomadas

| Tema | Decisão | Origem |
|---|---|---|
| Estilo visual | Cartunesco de traço grosso, como nas imagens de referência. Não é pixel art 16 bits. | Autora, confirmado |
| Personagens | Formiga e Peteca conforme `assets-originais/`. Os demais personagens seguem o mesmo estilo. | Imagens enviadas |
| Peteca | Cachorrinha companheira (dachshund preto e caramelo, peitoral rosa). | Autora + imagem |
| Foto da cliente (4.2) | Não será foto real. Será uma releitura em cartum, no mesmo estilo dos demais personagens. | Autora |
| Hospedagem | Cloudflare Pages, com repositório privado no GitHub. | Autora |
| Visibilidade do link | Link listado, sem proteção por senha e sem bloqueio de indexação. | Autora |
| Áudio | Desligado até o primeiro toque do usuário, com botão para ligar e desligar. Rock na batalha da lagarta. | Brief (padrão) |
| Stack | Phaser 4 (API do Phaser) com TypeScript e Vite. Escolhido pela autora para aprender uma ferramenta nova e para reaproveitar o projeto em outros jogos. | Autora, confirmado |

### Propostas para os pontos ambíguos (aguardando confirmação)

Adotadas como padrão até a autora confirmar:

1. **Tela 1.3:** elogiar as opções A (mais rápida) e C (sem custo); mostrar a consequência de B.
2. **Tela 2.3:** texto diferente a cada vida perdida, com três versões curtas escritas pela cliente.
3. **Tela 2.5:** golpes errados não custam nada; só contam os três acertos.
4. **Telas 3.2 e 3.3:** são dois sistemas separados. A 3.2 libera a passagem para a casa; a 3.3 libera a porta do Leite.

## 3. Fases do jogo

### Tela 0 — Início
- Texto de missão e botão "Começar", que leva à fase 1.

### Fase 1 — O Conselho das Formigas (Teresina/PI)
- Narração (1.1) e conselho (1.2), ambos com clique para continuar.
- Decisão de orçamento (1.3): três rotas (A, B, C). Cada escolha mostra uma análise curta com humor. Nenhuma bloqueia; todas seguem para a fase 2.

### Fase 2 — Travessia e Floresta de Babaçu (Rio Parnaíba → MA)
- **2.1:** chegada à margem do Parnaíba; a Peteca se junta à formiga.
- **2.2:** floresta em movimento lateral. Desviar de cocos, galhos e pedras. Ao chegar ao fim, avança para a lagarta. Ao bater num obstáculo, perde uma vida.
- **2.3:** bronca da cliente, a cada vida perdida (até três vezes). A Peteca salva a formiga e reabre o caminho do ponto em que ele parou.
- **2.4:** ao perder as três vidas, a Peteca resgata a formiga e ele volta ao início da floresta, com três vidas novas. Inclui uma frase de apoio da cliente.
- **2.5:** chefe, lagarta gigante. Desviar do ataque lateral e tocar para dar golpes. Vence com três golpes certos. Ser atingido custa uma vida, com as mesmas regras da 2.3.
- **2.6:** vitória; o caminho até o Maranhão está livre.

### Fase 3 — Vale dos Timbiras (MA)
- **3.1:** chegada ao território da Leite.
- **3.2:** infiltração em quatro cômodos, em sequência: sala (pano), banheiro (pano), cozinha (pano), panela (colher). Para cada cômodo, escolher entre três opções. Acerto avança e dá pista; erro aumenta o alerta da guardiã. Três alertas reiniciam a fase, com texto da guardiã.
- **3.3:** três pistas de sequência numérica (ex.: 3, 6, 12, ? → 24). Cada acerto libera um caminho; erro mostra a dica "pense no padrão".
- **3.4:** chegada à porta do Leite.

### Fase 4 — A Grande Descoberta
- **4.1:** encontro com o Leite.
- **4.2:** aparição da cliente, em cartum, com mensagem final de duas a três frases.
- **4.3:** presente: barra de chocolate ao leite, "direto de Teresina".
- **4.4:** encerramento e botão "Jogar de novo", que reinicia desde a tela 0.

## 4. Requisitos funcionais

- RF1. Textos de todas as telas ficam em arquivos editáveis, separados da lógica (ver seção 9 do brief).
- RF2. Textos da cliente ficam isolados em arquivo próprio para revisão separada.
- RF3. Configurações de jogo (vidas, alertas, golpes, tempos) ficam em arquivo próprio.
- RF4. Textos pendentes aparecem marcados na versão de desenvolvimento e não podem ir para a versão final.
- RF5. Controles: toque na metade esquerda ou direita da tela para mover; toque para dar golpes; setas no computador; teclado para digitar respostas de pista, se for campo de texto.
- RF6. Nenhum botão sem função e nenhuma tela que possa travar por erro de interação.
- RF7. Movimento reduzido é respeitado quando o sistema pedir.

## 5. Requisitos não funcionais

- Sem instalação, cadastro, backend, banco de dados e progresso salvo.
- Textos de tela com no máximo três linhas.
- Caminhos relativos para imagens, sons e demais arquivos.
- Animações priorizam CSS e JavaScript antes de gerar novas imagens.
- Repositório de código privado; site publicado com link listado.

## 6. Personagens e recursos gráficos

| Item | Status |
|---|---|
| Formiga | Referência em `assets-originais/` (várias poses). Usar uma folha de referência para manter a aparência entre telas. |
| Peteca | Referência em `assets-originais/`. Descrição definida (cachorrinha, dachshund). |
| Conselheira | A gerar, no mesmo estilo. |
| Lagarta gigante | A gerar, no mesmo estilo. |
| Guardiã(s) | Confirmar se é personagem visível ou só texto. |
| Cliente (4.2) | A gerar em cartum, como releitura. |
| Leite (porta, objeto final) | A gerar. |
| Cenários | Conselho em Teresina; margem do Parnaíba; floresta de babaçu; arena da lagarta; Vale dos Timbiras; interior da casa (sala, banheiro, cozinha, panela); porta final. |
| Objetos | Pano, colher, barra de chocolate. |

## 7. Fora do escopo

- Cadastro, login, backend, banco de dados e salvamento de progresso.
- Versão em pixel art 16 bits.
- Foto real da cliente.
- Proteção por senha do link.
- Versões em outros idiomas.
- Multiplayer ou compartilhamento de progresso.
- Qualquer marca, personagem ou material de franquias existentes.

## 8. Pendências (bloqueiam a versão final, não a versão de desenvolvimento)

**Da cliente:**
1. Bronca da tela 2.3 (três versões, de três a quatro frases cada).
2. Frase de apoio da tela 2.4.
3. Respostas certas e alertas da tela 3.2.
4. Mensagem final da tela 4.2 (duas a três frases).

**Da autora:**
1. Frase de encerramento da tela 4.4.
2. Sequência de números da tela 3.3 (confirmar ou trocar).
3. Confirmar a proposta da seção 2 para os pontos ambíguos.
4. Confirmar se a marca "ToH" no peitoral da Peteca deve ficar ou sair.
5. Confirmar a stack (seção 10 abaixo).
6. Sons além do rock da batalha.
7. Aparência da conselheira, da lagarta, da guardiã e do Leite.

## 9. Critérios de aceitação

1. O jogo abre por link em celular e computador.
2. A tela 0 apresenta a missão e o botão "Começar" leva à fase 1.
3. A fase 1 tem três opções; nenhuma bloqueia o avanço.
4. Na fase 2, cada vida perdida mostra a bronca; ao perder as três, a formiga recomeça a floresta com três vidas.
5. O chefe é vencido com três golpes certos; ser atingido custa uma vida.
6. Na fase 3, os quatro cômodos são resolvidos em sequência; três alertas reiniciam a fase; cada pista certa libera o caminho.
7. A fase 4 mostra o encontro, a mensagem da cliente e o presente.
8. "Jogar de novo" reinicia o jogo desde a tela 0.
9. Nenhum texto marcado como pendente aparece na versão de entrega.
10. O áudio começa desligado e só toca após interação. Movimento reduzido é respeitado quando o sistema pedir.
11. O repositório de código é privado; o site publicado é acessível pelo link listado.

## 10. Stack

- **Motor:** Phaser 4 (API do Phaser). Cuida de cenas, loop de jogo, sprites, animações, colisão, toque e áudio.
- **Linguagem:** TypeScript.
- **Build:** Vite, gerando uma pasta estática (`dist/`) para publicação.
- **Publicação:** Cloudflare Pages, com repositório privado no GitHub.
- **Reaproveitamento:** a estrutura separa o motor reutilizável (cenas e mecânicas genéricas) do conteúdo do jogo (personagens, textos e configurações). Assim, um novo jogo troca personagens, textos e configurações, sem reescrever as mecânicas.
- **Pendente de aprovação:** a estrutura de pastas detalhada e as etapas de implementação (seções 3 e 8 da proposta técnica).
