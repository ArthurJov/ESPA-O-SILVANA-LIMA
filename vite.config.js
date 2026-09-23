import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sobre: resolve(__dirname, 'sobre/index.html'),
        procedimentos: resolve(__dirname, 'procedimentos/index.html'),
        reducao360: resolve(__dirname, 'procedimentos/reducao-abdominal-360/index.html'),
        diastase: resolve(__dirname, 'procedimentos/diastase/index.html'),
        harmonizacao: resolve(__dirname, 'procedimentos/harmonizacao-abdominal/index.html'),
        massagens: resolve(__dirname, 'procedimentos/massagens-e-drenagem/index.html'),
        limpeza: resolve(__dirname, 'procedimentos/limpeza-de-pele/index.html'),
        resultados: resolve(__dirname, 'resultados/index.html'),
        avaliacao: resolve(__dirname, 'avaliacao/index.html'),
        mentoria: resolve(__dirname, 'mentoria/index.html'),
        contato: resolve(__dirname, 'contato/index.html'),
        privacidade: resolve(__dirname, 'politica-de-privacidade/index.html'),
      },
    },
  },
});
