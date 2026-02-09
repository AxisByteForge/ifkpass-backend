import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: [
      'dist',
      '**/dist/**',
      '**/vitest.config.*',
      'src/**/*.interface.*'
    ],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      include: ['src'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/**/*.interface.*',
        '**/src/infra/**',
        '**/src/handlers/**',
        '**/src/shared/types/**',
        '**/src/shared/lib/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/test/**',
        '**/*.config.*',
        '**/*.spec.ts',
        '**/*.test.ts'
      ],
      all: true
    }
  },
  plugins: [tsconfigPaths(), swc.vite({ module: { type: 'es6' } })]
});
