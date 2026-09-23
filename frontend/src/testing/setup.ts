/* eslint-disable @typescript-eslint/no-explicit-any, no-empty */
import * as React from 'react';
import * as ReactDOM from 'react-dom';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const actFn = (callback: any) => {
  if (ReactDOM && typeof (ReactDOM as any).flushSync === 'function') {
    let result: any;
    try {
      (ReactDOM as any).flushSync(() => {
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
  (React as any).act = actFn;
} catch {}
try {
  (ReactDOM as any).act = actFn;
} catch {}
try {
  (globalThis as any).act = actFn;
} catch {}

if (typeof window !== 'undefined') {
  if (!window.CSS) {
    (window as any).CSS = {};
  }
  if (!window.CSS.supports) {
    window.CSS.supports = () => true;
  }
}
