// Teste de ponta a ponta no navegador real (Edge/Chrome): joga a aventura inteira.
// Uso: npm run build && npx vite preview --port 4173   (em outro terminal)  ->  node tests/e2e/jogo.e2e.mjs
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const URL = process.env.URL ?? 'http://localhost:4173/';
const SAIDA = process.env.SAIDA ?? path.resolve('tests/e2e/capturas');
const EXEC = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
fs.mkdirSync(SAIDA, { recursive: true });

const aventura = fs.readFileSync('adventures/formiga-leite/aventura.ts', 'utf8');
const puzzlesSrc = fs.readFileSync('adventures/formiga-leite/puzzles-calcudoku.ts', 'utf8');

const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'OK  ' : 'FALHA'} ${msg}`);
  if (!cond) falhas++;
};

const browser = await puppeteer.launch({ executablePath: EXEC, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const erros = [];
page.on('pageerror', (e) => erros.push(String(e)));
page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
await page.goto(URL, { waitUntil: 'networkidle0' });
const foto = (n) => page.screenshot({ path: path.join(SAIDA, `${n}.png`) });

const texto = () => page.evaluate(() => document.getElementById('palco').innerText);
async function clicarBotao(rotulo, timeout = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const feito = await page.evaluate((r) => {
      const b = [...document.querySelectorAll('#palco button')].find((x) => x.textContent.trim() === r && !x.disabled);
      if (b) b.click();
      return !!b;
    }, rotulo);
    if (feito) return true;
    await sleep(100);
  }
  throw new Error(`Botão não apareceu: ${rotulo}\nTela:\n${await texto()}`);
}
async function esperarTexto(trecho, timeout = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if ((await texto()).includes(trecho)) return;
    await sleep(100);
  }
  throw new Error(`Texto não apareceu: ${trecho}\nTela:\n${await texto()}`);
}
// Avança falas até aparecer um desafio ou o texto esperado.
async function passarDialogos(ate) {
  for (let i = 0; i < 12; i++) {
    const t = await texto();
    if (ate(t)) return;
    await page.evaluate(() => {
      const b = document.querySelector('#palco .dialogo .btn');
      b?.click();
    });
    await sleep(250);
  }
  throw new Error('Diálogo não chegou ao ponto esperado:\n' + (await texto()));
}

// ---- Abertura: título -> Jogar -> história completa -> Iniciar o jogo ----
await esperarTexto('A Saga da Formiga');
await foto('01-abertura');
ok(!(await texto()).includes('Você aceita ajudá-lo'), 'a história só aparece depois de clicar em Jogar');
await clicarBotao('Jogar');
await esperarTexto('Você aceita ajudá-lo');
const historia = await texto();
ok(historia.includes('lendário Leite') && historia.includes('colônia passa fome'), 'a história completa (missão e motivo) aparece numa tela só');
ok(!/rota|orçamento|barco/i.test(historia), 'não há mais escolha de rota');
await foto('02-historia');
await clicarBotao('Iniciar o jogo');

// ---- Partida: Peteca aparece no início da caminhada ----
await esperarTexto('Antes de partir', 8000);
ok((await texto()).includes('Felipe'), 'o protagonista se chama Felipe');
await passarDialogos((t) => t.includes('Vamos?'));
await foto('03-inicio-peteca');
// Botão de continuar fica no centro da tela, não na base.
const posBotao = await page.evaluate(() => {
  const b = document.querySelector('#palco .dialogo .btn').getBoundingClientRect();
  const p = document.getElementById('palco').getBoundingClientRect();
  return (b.top + b.height / 2 - p.top) / p.height;
});
ok(posBotao > 0.3 && posBotao < 0.7, `botão de continuar no meio da tela (${posBotao.toFixed(2)} da altura)`);
await clicarBotao('Toque para continuar');
await esperarTexto('margem do rio Parnaíba', 15000);
ok(!(await texto()).includes('Sou a Peteca'), 'a Peteca não é apresentada de novo no rio');
await clicarBotao('Toque para continuar');

// ---- Labirinto ----
await esperarTexto('labirinto de folhas', 15000);
await clicarBotao('Toque para continuar');
await esperarTexto('O labirinto da floresta');
await sleep(300);
await foto('04-labirinto');

// Ajuda da Peteca: aparece só quando acionada, e traz as regras.
ok(!(await texto()).includes('Peteca, como funciona'), 'regras da Peteca ocultas até serem pedidas');
await clicarBotao('Pergunte à Peteca');
ok((await texto()).includes('sem encostar nas paredes'), 'Peteca explica as regras do labirinto quando acionada');
await foto('05-peteca-regras');
await clicarBotao('Entendi');

const layout = (await page.$eval('.lab-canvas', (c) => c.dataset.layout)).split('|');
ok(layout.length === 17, `layout do labirinto lido do jogo (${layout.length} linhas)`);
const find = (ch) => {
  for (let l = 0; l < layout.length; l++) {
    const c = layout[l].indexOf(ch);
    if (c >= 0) return [c, l];
  }
};
const [sc, sl] = find('S');
const [ec, el] = find('E');
// BFS
const prev = new Map();
const fila = [[sc, sl]];
prev.set(`${sc},${sl}`, null);
while (fila.length) {
  const [c, l] = fila.shift();
  for (const [dc, dl] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nc = c + dc, nl = l + dl;
    if (layout[nl]?.[nc] === undefined || layout[nl][nc] === '#' || prev.has(`${nc},${nl}`)) continue;
    prev.set(`${nc},${nl}`, [c, l]);
    fila.push([nc, nl]);
  }
}
const caminho = [];
for (let n = [ec, el]; n; n = prev.get(`${n[0]},${n[1]}`)) caminho.unshift(n);
const rect = await page.evaluate(() => {
  const r = document.querySelector('.lab-canvas').getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
});
const px = (c, l) => [rect.x + ((c + 0.5) * rect.w) / layout[0].length, rect.y + ((l + 0.5) * rect.h) / layout.length];

// 1) Bater na parede: arrasta a formiga para a esquerda e confere o aviso.
{
  const [x0, y0] = px(sc, sl);
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  await page.mouse.move(x0 - 60, y0, { steps: 4 });
  await page.mouse.up();
  await sleep(100);
  ok(/Batidas: [1-9]/.test(await texto()), 'encostar na parede reinicia e conta uma batida');
  await foto('06-labirinto-batida');
}
// 2) Percorrer o caminho certo, mesmo com movimentos rápidos (poucos passos).
{
  const [x0, y0] = px(sc, sl);
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (const [c, l] of caminho.slice(1)) {
    const [x, y] = px(c, l);
    await page.mouse.move(x, y, { steps: 3 });
  }
  await page.mouse.up();
}
await esperarTexto('Saída encontrada');
ok(true, 'labirinto concluído pelo mouse/toque');
await esperarTexto('Saí! O caminho', 6000);
await clicarBotao('Seguir caminho');

// ---- Senha ----
await esperarTexto('passagem trancada', 15000);
await clicarBotao('Toque para continuar');
await esperarTexto('A passagem trancada');
await foto('07-senha');
const todos = [];
for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let c = 0; c < 10; c++) for (let d = 0; d < 10; d++) {
  const s = `${a}${b}${c}${d}`;
  if (new Set(s).size === 4) todos.push(s);
}
const avalia = (seg, p) => {
  let c = 0, d = 0;
  for (let i = 0; i < 4; i++) p[i] === seg[i] ? c++ : seg.includes(p[i]) && d++;
  return [c, d];
};
let senhaResolvida = false;
let broncasSenha = 0;
for (let rodada = 0; rodada < 4 && !senhaResolvida; rodada++) {
  let cand = [...todos];
  for (let t = 0; t < 7; t++) {
    const palpite = cand[Math.floor(Math.random() * cand.length)];
    for (const ch of palpite) await page.keyboard.press(ch);
    await page.keyboard.press('Enter');
    await sleep(60);
    const t_ = await texto();
    if (t_.includes('Senha correta')) { senhaResolvida = true; break; }
    const [c, d] = await page.evaluate(() => {
      const li = [...document.querySelectorAll('.senha-historico li')].pop();
      return [...li.querySelectorAll('.pino')].map((e) => Number(e.textContent.replace(/\D/g, '')));
    });
    cand = cand.filter((s) => avalia(s, palpite).join() === [c, d].join());
  }
  if (!senhaResolvida) {
    await esperarTexto('As tentativas acabaram');
    broncasSenha++;
    await foto('08-senha-derrota');
    await clicarBotao('Toque para continuar');
    await sleep(100);
    ok((await texto()).includes('Tentativas: 0 usadas, 7 restantes'), 'após a derrota da senha, recomeça com 7 tentativas');
  }
}
ok(senhaResolvida, `senha descoberta (derrotas com bronca no caminho: ${broncasSenha})`);
await foto('09-senha-vitoria');
await esperarTexto('Clique! A passagem', 6000);
await passarDialogos((t) => t.includes('Eu sabia'));
await clicarBotao('Seguir caminho');

// ---- Forca ----
await esperarTexto('Vale dos Timbiras', 15000);
await passarDialogos((t) => t.includes('três palavras'));
await clicarBotao('Toque para continuar');
await esperarTexto('O desafio dos guardiões');
await foto('10-forca');
const frasesForca = [...aventura.matchAll(/\{ palavra: '([^']+)', dica/g)].map((m) => m[1]);
ok(frasesForca.length >= 10, `banco com ${frasesForca.length} palavras`);
const ordemLetras = 'EAOSRINDMTCULPVGFBHQXZJKWY';
let acertadas = 0;
let derrotasForca = 0;
for (let guard = 0; guard < 12 && acertadas < 3; guard++) {
  // Resolve a frase atual usando o padrão exibido para identificar a candidata.
  while (true) {
    const estado = await page.evaluate(() => ({
      palavras: [...document.querySelectorAll('.forca-frase .palavra')].map((p) =>
        [...p.querySelectorAll('.casa')].map((c) => ({ t: c.textContent, letra: c.dataset.letra === '1' })),
      ),
      usadas: [...document.querySelectorAll('.teclado-letras button:disabled')].map((b) => b.textContent),
      aviso: document.querySelector('.aviso').textContent,
    }));
    if (estado.aviso.includes('Palavra descoberta')) { acertadas++; break; }
    if (estado.aviso.includes('Palavra perdida')) { derrotasForca++; break; }
    const padrao = estado.palavras;
    const candidatas = frasesForca.filter((f) => {
      const ws = f.split(' ');
      if (ws.length !== padrao.length) return false;
      return ws.every((w, i) => [...w].length === padrao[i].length && [...w].every((ch, j) => {
        const casa = padrao[i][j];
        return casa.letra ? (casa.t === '' ? !estado.usadas.includes(norm(ch)) : norm(casa.t) === norm(ch)) : true;
      }));
    });
    const frase = candidatas[0];
    const falta = frase ? [...norm(frase)].find((ch) => /[A-Z]/.test(ch) && !estado.usadas.includes(ch)) : ordemLetras.split('').find((l) => !estado.usadas.includes(l));
    await page.keyboard.press(falta.toLowerCase());
    await sleep(30);
  }
  if (acertadas >= 3) break;
  if ((await texto()).includes('Próxima palavra')) { await clicarBotao('Próxima palavra'); }
  else { await esperarTexto('Toque para continuar'); await clicarBotao('Toque para continuar'); }
}
ok(acertadas === 3, `forca: 3 palavras descobertas (derrotas no caminho: ${derrotasForca})`);
await foto('11-forca-vitoria');
await esperarTexto('As palavras foram descobertas', 6000);
await clicarBotao('Seguir caminho');

// ---- Calcudoku ----
await esperarTexto('porta', 15000);
await passarDialogos((t) => t.includes('enigma'));
await clicarBotao('Toque para continuar');
await esperarTexto('O enigma da porta');
await foto('12-calcudoku');
const puzzles = puzzlesSrc.split(/\r?\n  \{\r?\n/).slice(1).map((blk) =>
  [...blk.matchAll(/celulas: (\[\[.*?\]\]), op: '(.)', alvo: (\d+)/g)].map((m) => ({ celulas: JSON.parse(m[1]), op: m[2], alvo: Number(m[3]) })),
);
const rotulos = await page.evaluate(() => [...document.querySelectorAll('.calc-celula')].map((c) => c.querySelector('.calc-rotulo')?.textContent ?? ''));
const simb = { '+': '+', x: '×', '-': '−', '/': '÷', '=': '' };
const puzzle = puzzles.find((gs) => {
  const r = Array(25).fill('');
  for (const g of gs) {
    const [l, c] = [...g.celulas].sort((a, b) => a[0] - b[0] || a[1] - b[1])[0];
    r[l * 5 + c] = `${g.alvo}${simb[g.op]}`;
  }
  return r.join('|') === rotulos.join('|');
});
ok(!!puzzle, 'puzzle exibido identificado entre os 4 cadastrados');
const cumpre = (g, v) => g.op === '=' ? v[0] === g.alvo : g.op === '+' ? v.reduce((a, b) => a + b) === g.alvo : g.op === 'x' ? v.reduce((a, b) => a * b) === g.alvo : g.op === '-' ? Math.abs(v[0] - v[1]) === g.alvo : Math.max(...v) % Math.min(...v) === 0 && Math.max(...v) / Math.min(...v) === g.alvo;
const grade = Array.from({ length: 5 }, () => Array(5).fill(0));
const gDe = new Map();
puzzle.forEach((g, i) => g.celulas.forEach(([l, c]) => gDe.set(`${l},${c}`, i)));
const resolve = (k) => {
  if (k === 25) return true;
  const l = Math.floor(k / 5), c = k % 5;
  for (let v = 1; v <= 5; v++) {
    if (grade[l].slice(0, c).includes(v) || grade.slice(0, l).some((r) => r[c] === v)) continue;
    grade[l][c] = v;
    const g = puzzle[gDe.get(`${l},${c}`)];
    const vals = g.celulas.map(([a, b]) => grade[a][b]);
    if ((vals.includes(0) || cumpre(g, vals)) && resolve(k + 1)) return true;
    grade[l][c] = 0;
  }
  return false;
};
ok(resolve(0), 'solução do puzzle calculada');
// Erro proposital na primeira célula: confere sinalização, depois corrige.
const cels = await page.$$('.calc-celula');
await cels[0].click();
await page.keyboard.press(String(grade[0][0] === 1 ? 2 : 1));
await cels[1].click();
await page.keyboard.press(String(grade[0][0] === 1 ? 2 : 1));
ok(await page.evaluate(() => document.querySelectorAll('.conflito').length >= 2), 'repetição na linha é sinalizada');
await foto('13-calcudoku-conflito');
for (let i = 0; i < 25; i++) {
  await cels[i].click();
  await page.keyboard.press(String(grade[Math.floor(i / 5)][i % 5]));
}
await foto('14-calcudoku-resolvido');
await esperarTexto('A porta se abre', 8000);
ok(true, 'calcudoku concluído');
await passarDialogos((t) => t.includes('Chegamos'));
await clicarBotao('Seguir caminho');

// ---- Final ----
await esperarTexto('O lendário Leite', 15000).catch(() => {});
await passarDialogos((t) => t.includes('Missão cumprida') || t.includes('chocolate'));
for (let i = 0; i < 6 && !(await texto()).includes('Jogar de novo'); i++) {
  await page.evaluate(() => document.querySelector('#palco .dialogo .btn')?.click());
  await sleep(250);
}
await foto('15-final');
ok((await texto()).includes('Jogar de novo'), 'tela final com botão "Jogar de novo"');
ok(await page.evaluate(() => document.querySelector('.fim img').src.includes('katia_formiga_peteca_felizes')), 'tela final mostra Felipe, Kátia e Peteca felizes');
ok((await texto()).includes('família'), 'texto final fala da família');
await clicarBotao('Jogar de novo');
await page.waitForFunction(() => !document.querySelector('.fim') && !!document.querySelector('.abertura'), { timeout: 20000 });
ok(true, '"Jogar de novo" volta à abertura');

ok(erros.length === 0, `sem erros no console (${erros.length}) ${erros.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTODOS OS PASSOS PASSARAM');
process.exit(falhas ? 1 : 0);
