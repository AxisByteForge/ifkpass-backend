import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node20',
  platform: 'node',
  sourcemap: true,
  clean: true,
});
