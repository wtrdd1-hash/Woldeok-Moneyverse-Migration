import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    maxWorkers: 2,
    // Several disposable-PostgreSQL acceptance files (treasury dividend, NPS,
    // donation, stock league) write the same treasury ledger rows. Running
    // files in parallel intermittently raised `deadlock detected` in
    // treasury-dividend-ledger-v1420 on a fresh CI database (2026-11-24);
    // serial files removed it. Tests inside a file still run as before.
    fileParallelism: false,
  },
});
