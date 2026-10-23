// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyReadingScale, normaliseReadingScale, readReadingScale, READING_SCALE_KEY, READING_SCALE_SCRIPT } from './reading-scale';

function storage(): Map<string, string> {
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (k: string) => entries.get(k) ?? null, setItem: (k: string, v: string) => { entries.set(k, v); }, removeItem: (k: string) => { entries.delete(k); } },
  });
  return entries;
}

describe('local reading scale', () => {
  let values: Map<string, string>;
  beforeEach(() => { values = storage(); document.documentElement.style.removeProperty('font-size'); });
  afterEach(() => { Reflect.deleteProperty(globalThis, 'localStorage'); document.documentElement.style.removeProperty('font-size'); });

  it('accepts only enumerated 100–200 percent choices', () => {
    for (const value of ['100', '125', '150', '175', '200']) expect(normaliseReadingScale(value)).toBe(Number(value));
    for (const value of [null, '', '99', '201', '100px', '100; color:red', 'Infinity', '1e2', '150.0']) expect(normaliseReadingScale(value)).toBeNull();
  });

  it('applies a choice immediately and stores only that local device preference', () => {
    expect(applyReadingScale(150)).toBe(true);
    expect(document.documentElement.style.fontSize).toBe('150%');
    expect(values.get(READING_SCALE_KEY)).toBe('150');
    expect(readReadingScale()).toBe(150);
    expect(applyReadingScale(100)).toBe(true);
    expect(document.documentElement.style.fontSize).toBe('');
    expect(values.has(READING_SCALE_KEY)).toBe(false);
  });

  it('rejects invalid changes without modifying the active preference', () => {
    applyReadingScale(125);
    expect(applyReadingScale(999)).toBe(false);
    expect(document.documentElement.style.fontSize).toBe('125%');
    expect(values.get(READING_SCALE_KEY)).toBe('125');
  });

  it('applies the stored choice before paint and ignores injected storage values', () => {
    expect(READING_SCALE_SCRIPT).toContain(JSON.stringify(READING_SCALE_KEY));
    values.set(READING_SCALE_KEY, '175');
    new Function(READING_SCALE_SCRIPT)();
    expect(document.documentElement.style.fontSize).toBe('175%');
    values.set(READING_SCALE_KEY, '200%;color:red');
    new Function(READING_SCALE_SCRIPT)();
    expect(document.documentElement.style.fontSize).toBe('175%');
  });

  it('does not crash if browser storage is blocked', () => {
    Reflect.deleteProperty(globalThis, 'localStorage');
    expect(() => new Function(READING_SCALE_SCRIPT)()).not.toThrow();
    expect(() => applyReadingScale(125)).not.toThrow();
    expect(document.documentElement.style.fontSize).toBe('125%');
  });
});
