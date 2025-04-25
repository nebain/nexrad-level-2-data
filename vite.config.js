import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'NexradLevel2Data',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs'], // ESM and CommonJS
    }
  }
});
