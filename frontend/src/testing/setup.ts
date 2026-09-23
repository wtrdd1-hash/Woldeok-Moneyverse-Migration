import * as React from 'react';
import * as ReactDOM from 'react-dom';

const globalRecord = globalThis as unknown as Record<string, unknown>;
globalRecord.IS_REACT_ACT_ENVIRONMENT = true;

const actFn = (callback?: () => unknown) => {
  const rDom = ReactDOM as unknown as { flushSync?: (fn: () => void) => void };
  if (rDom && typeof rDom.flushSync === 'function') {
    let result: unknown;
    try {
      rDom.flushSync(() => {
        if (callback) result = callback();
      });
      return result;
    } catch {
      return callback ? callback() : undefined;
    }
  }
  return callback ? callback() : undefined;
};

try {
  (React as unknown as Record<string, unknown>).act = actFn;
} catch {
  /* ignore */
}
try {
  (ReactDOM as unknown as Record<string, unknown>).act = actFn;
} catch {
  /* ignore */
}
try {
  globalRecord.act = actFn;
} catch {
  /* ignore */
}

if (typeof window !== 'undefined') {
  const win = window as unknown as Record<string, unknown>;
  if (!win.CSS) {
    win.CSS = {};
  }
  if (!window.CSS?.supports) {
    (win.CSS as Record<string, unknown>).supports = () => true;
  }
}
