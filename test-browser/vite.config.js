import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'nexrad-level-2-data': path.resolve(__dirname, '../src/index.js')
    }
  },
  server: {
    open: true,
    publicDir: "../data"
  }
});
