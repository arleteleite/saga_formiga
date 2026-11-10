# Plano de execução — A Aventura da Formiga (v2)

Base: `PRD-v2.md`. Stack: Phaser 4 + TypeScript + Vite (mapa) e HTML/CSS (desafios e diálogos), publicado no Cloudflare Pages com repositório privado.
O plano do v1 (telas encadeadas, floresta, lagarta, cômodos) foi substituído. O código antigo está em `legado-v1/`.

Comandos: `npm run dev` (jogar), `npm test` (unitários), `npm run build`, `npm run e2e` (jogo completo em navegador real; exige `npx vite preview --port 4173` aberto).

---

## E0 — Planejamento e validação do PRD
**Status:** concluída.
Diagnóstico do v1, inventário das imagens, três rodadas de decisões (história mantida, vertical, sem susto, sem lagarta, Peteca só explica regras, sem vidas extras, dificuldade média a difícil, Forca com frases).

## E1 — Estrutura narrativa e mapa
**Status:** concluída.
- `src/map/MapaScene.ts`: mapa vertical rolável, formiga caminhando entre paradas, Peteca acompanhando após o rio, cenário provisório em código.
- `src/core/palco.ts`: camada HTML com diálogos, escolha de rota, abertura de desafios e final.
- `adventures/formiga-leite/`: paradas, textos, frases, labirinto, puzzles.
- Imagens otimizadas em `public/img/` (ToH removida).
**Teste:** e2e percorre abertura, rota, rio e Peteca.

## E2 — Labirinto
**Status:** concluída. `src/challenges/labirinto/`
Controle relativo por mouse/toque e setas; colisão por varredura; reinício; contador de batidas; susto desligado e configurável.
**Testes:** unitários de colisão, varredura (movimento rápido não atravessa), solução existente e saída; e2e conclui o labirinto com o mouse e confere a batida.

## E3 — Senha
**Status:** concluída. `src/challenges/senha/`
4 dígitos distintos (zero inicial permitido), 7 tentativas, histórico, teclado na tela e físico, segredo oculto, bronca na derrota.
**Testes:** avaliação de posições, validação, geração, derrota e vitória na interface; e2e resolve por dedução e confere o recomeço.

## E4 — Forca
**Status:** concluída. `src/challenges/forca/`
3 frases sorteadas de 11, 6 erros por frase, acentos e cedilha, teclado, letras usadas, desenho progressivo, bronca na derrota.
**Testes:** normalização, letra repetida, vitória e derrota; e2e completa 3 frases.

## E5 — Calcudoku
**Status:** concluída. `src/challenges/calcudoku/`
Grade 5×5, 4 puzzles de solução única, gaiolas com borda e rótulo, conflitos e gaiola errada sinalizados, reiniciar.
**Testes:** cada operação; solver confirma solução única de cada puzzle; interface vence com a solução e sinaliza erro; e2e resolve no navegador.

## E6 — Progressão e desbloqueios
**Status:** concluída. `src/core/progresso.ts`
Ordem fixa pela aventura; não entra num desafio nem segue sem concluir o anterior.
**Testes:** unitários de bloqueio e reinício.

## E7 — Encerramento e surpresa final
**Status:** concluída com textos pendentes.
Encontro com o Leite, mensagem da cliente, chocolate, encerramento, "Jogar de novo".
**Pendente:** mensagem final da cliente e linha de encerramento (autora); ilustração da cliente em cartum.

## E8 — Textos e conteúdo (aguarda você e sua irmã)
**Status:** pendente.
- 3 broncas da cliente (`textos-cliente.ts`).
- Mensagem final da cliente.
- Linha de encerramento da tela final.
- Aprovar ou trocar as 6 frases rascunho da Forca e os textos novos de narração.

## E9 — Arte final
**Status:** pendente.
Substituir cenários provisórios (mapa, fundos dos desafios, destino), criar a cliente em cartum e, se necessário, quadros de caminhada da formiga. Troca por arquivo, sem mexer nos módulos.

## E10 — Qualidade e publicação
**Status:** parcialmente concluída.
Concluído:
- `npm run build:final` falha se sobrar texto [PENDENTE] (`scripts/checar-pendentes.mjs`). `npm run build` continua para desenvolvimento.
- Sons simples (acerto, erro, batida, vitória) gerados no navegador, desligados até o primeiro toque, com botão 🔊/🔇 que lembra a escolha.
- Caminhos relativos (`base: './'`): a pasta `dist/` funciona em qualquer hospedagem.
- `TEXTOS-PENDENTES.md`: folha para preencher com sua irmã.
Pendente:
- Teste em Android real.
- Publicar no Cloudflare Pages (repositório privado no GitHub; comando de build `npm run build:final`, pasta `dist`). Exige suas contas.
- Pacote do Phaser (~1,4 MB, 370 KB comprimido) é esperado e foi aceito.

---

## Decisões em aberto

| Decisão | Proposta atual |
|---|---|
| Frase perdida na Forca | Mantém as já acertadas; sorteia outra |
| Áudio | Efeitos simples implementados; música opcional, a definir |
| Caminhada da formiga | Imagem espelhada com balanço; gerar quadros se ficar fraco |

## Resumo de testes

| Camada | Cobertura |
|---|---|
| Unitários (`tests/engines.test.ts`) | Regras das 4 engines e progressão |
| Interface (`tests/ui.test.ts`) | Vitória, derrota, bronca e teclado dos desafios |
| Ponta a ponta (`tests/e2e/jogo.e2e.mjs`) | Jogo inteiro no Chrome (390×844), com capturas em `tests/e2e/capturas/` |

## Alteração (abertura)
A introdução em várias falas e a escolha de rota foram removidas. Fluxo atual: título com 'Jogar' -> tela única com a história e o motivo da missão -> 'Iniciar o jogo'. O texto da história é rascunho (adventures/formiga-leite/aventura.ts, objeto abertura).


## Alteração (Kátia, final e Forca por palavras)
- Imagens da Kátia integradas (`public/img/`, ToH removida nas fotos de grupo): brava/séria nas broncas, alegre na mensagem final, beijo no encerramento e família com a Peteca na tela "Missão cumprida".
- Broncas, mensagem final e linha de encerramento escritas como rascunho; `build:final` passa sem pendências.
- Forca agora usa 27 palavras (estatística, direito e universo da história), 3 por partida, 6 erros por palavra.
