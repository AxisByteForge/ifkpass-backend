import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/presentation/handlers/**/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: false,
  dts: false,
  clean: true,
  external: [/^@aws-sdk\//],
});
