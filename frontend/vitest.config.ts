import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./src/testing/server-only.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['src/**/*.test.tsx', 'jsdom'],
      ['src/components/**/*.test.ts', 'jsdom'],
    ],
    setupFiles: ['./src/testing/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    maxWorkers: 2,
    minWorkers: 1,
  },
});
