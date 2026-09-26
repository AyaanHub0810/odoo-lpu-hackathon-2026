import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  css: {
    // This standalone landing uses plain CSS; don't inherit the parent Next.js PostCSS config.
    postcss: {
      plugins: [],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5174,
  },
});
