// Falha se ainda existir texto marcado como pendente em adventures/ ou src/.
// Usado por `npm run build:final`. A build de desenvolvimento (`npm run build`) não roda isto.
import fs from 'node:fs';
import path from 'node:path';

const pendentes = [];
function varrer(dir) {
  for (const nome of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, nome.name);
    if (nome.isDirectory()) varrer(p);
    else if (/\.ts$/.test(nome.name) && nome.name !== 'textos.ts') {
      fs.readFileSync(p, 'utf8').split(/\r?\n/).forEach((linha, i) => {
        if (/\bpendente\(/.test(linha) && !linha.trim().startsWith('//')) pendentes.push(`${p}:${i + 1}  ${linha.trim()}`);
      });
    }
  }
}
['adventures', 'src'].forEach((d) => fs.existsSync(d) && varrer(d));

if (pendentes.length) {
  console.error(`\nBuild final bloqueada: ${pendentes.length} texto(s) pendente(s):\n`);
  pendentes.forEach((l) => console.error('  - ' + l));
  console.error('\nEscreva os textos (ver TEXTOS-PENDENTES.md) e rode de novo.\n');
  process.exit(1);
}
console.log('Nenhum texto pendente.');
