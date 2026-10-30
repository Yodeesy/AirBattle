import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Essential for Electron file:// protocol relative asset loading
  server: {
    port: 3000,
    open: false
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: false
  }
});
