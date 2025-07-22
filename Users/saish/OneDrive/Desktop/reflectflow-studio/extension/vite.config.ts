
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  // By removing the manual `build.rollupOptions`, we let the crxjs plugin
  // automatically handle the entry points based on the manifest.json file,
  // which is the correct way to use this plugin.
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
