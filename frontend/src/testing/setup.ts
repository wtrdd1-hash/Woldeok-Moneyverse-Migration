import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

const globalRecord = globalThis as unknown as Record<string, unknown>;
globalRecord.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});

// Use React 19's native async act implementation in NODE_ENV=test.
// Replacing it with flushSync suppresses promised updates and breaks race tests.

if (typeof window !== 'undefined') {
  const win = window as unknown as Record<string, unknown>;
  if (!win.CSS) {
    win.CSS = {};
  }
  if (!window.CSS?.supports) {
    (win.CSS as Record<string, unknown>).supports = () => true;
  }
}
