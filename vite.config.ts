import { defineConfig } from 'vite';

// base './' mantém caminhos relativos (a pasta dist funciona em qualquer hospedagem).
// O Phaser sozinho tem cerca de 1,3 MB; o aviso de tamanho é esperado e foi elevado.
export default defineConfig({
  base: './',
  // Saída em `publicar/` (a pasta antiga `dist/` pode ficar travada no Windows por editor ou antivírus).
  build: { outDir: 'publicar', chunkSizeWarningLimit: 1500 },
});
