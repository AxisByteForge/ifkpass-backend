import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node24',
  platform: 'node',
  minify: true,
  splitting: false,
  sourcemap: false,
  dts: true,
  clean: true,
  noExternal: [/.*/],
  external: [/^@aws-sdk\//],
  tsconfig: './tsconfig.json',
  onSuccess: 'tsc --noEmit'
});
