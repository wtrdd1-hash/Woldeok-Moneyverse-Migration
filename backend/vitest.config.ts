import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// unplugin-swc is required, not optional. Vitest's default esbuild transform
// does not emit the design:type metadata Nest's dependency injection reads,
// so without it every constructor injection fails at runtime.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.test.ts'],
    globals: false,
    maxWorkers: 2,
    minWorkers: 1,
  },
});
