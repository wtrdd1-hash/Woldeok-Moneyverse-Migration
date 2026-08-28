import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyPoint,
  readPoint,
  POINT_PREFERENCE_SCRIPT,
  POINT_PRESETS,
  POINT_STORAGE_KEY,
  normalisePoint,
} from './theme';

describe('normalisePoint', () => {
  it('accepts a six digit hex and lower-cases it', () => {
    expect(normalisePoint('#D36C45')).toBe('#d36c45');
  });

  it('expands the three digit shorthand a person types by hand', () => {
    expect(normalisePoint('#c30')).toBe('#cc3300');
  });

  it('adds the hash a person leaves off', () => {
    expect(normalisePoint('214b38')).toBe('#214b38');
  });

  it('rejects anything that is not a colour', () => {
    // The value reaches setProperty, so this is the gate that keeps arbitrary
    // text out of the document's styles.
    for (const value of ['', 'red', '#12345', '#1234567', 'url(x)', '#00ff00; }', null]) {
      expect(normalisePoint(value)).toBeNull();
    }
  });

  it('treats a half-typed colour as no colour', () => {
    expect(normalisePoint('#d3')).toBeNull();
  });
});

describe('POINT_PRESETS', () => {
  it('offers colours the normaliser accepts', () => {
    for (const preset of POINT_PRESETS) {
      expect(normalisePoint(preset.hex)).toBe(preset.hex);
    }
  });

  it('has no duplicate ids or colours', () => {
    expect(new Set(POINT_PRESETS.map((p) => p.id)).size).toBe(POINT_PRESETS.length);
    expect(new Set(POINT_PRESETS.map((p) => p.hex)).size).toBe(POINT_PRESETS.length);
  });
});

/**
 * This jsdom does not provide `localStorage`, so the tests below install one.
 * That is not papering over the gap: the absence is itself a case the module
 * has to survive, and `survives storage it cannot read` covers it directly.
 */
function installStorage(): Map<string, string> {
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => void entries.set(key, value),
      removeItem: (key: string) => void entries.delete(key),
      clear: () => entries.clear(),
    },
  });
  return entries;
}

function removeStorage(): void {
  Reflect.deleteProperty(globalThis, 'localStorage');
}

describe('POINT_PREFERENCE_SCRIPT', () => {
  let stored: Map<string, string>;

  beforeEach(() => {
    stored = installStorage();
    document.documentElement.removeAttribute('data-point');
    document.documentElement.style.removeProperty('--point');
  });

  afterEach(removeStorage);

  it('reads the key the rest of the module writes', () => {
    expect(POINT_PREFERENCE_SCRIPT).toContain(JSON.stringify(POINT_STORAGE_KEY));
  });

  it('applies a stored colour to the document element', () => {
    stored.set(POINT_STORAGE_KEY, '#2f5fa8');

    new Function(POINT_PREFERENCE_SCRIPT)();

    const root = document.documentElement;

    expect(root.dataset.point).toBe('');
    expect(root.style.getPropertyValue('--point')).toBe('#2f5fa8');
  });

  it('ignores a stored value that is not a colour', () => {
    stored.set(POINT_STORAGE_KEY, 'red; background: url(x)');

    new Function(POINT_PREFERENCE_SCRIPT)();

    const root = document.documentElement;

    expect(root.hasAttribute('data-point')).toBe(false);
    expect(root.style.getPropertyValue('--point')).toBe('');
  });

  it('survives storage it cannot read', () => {
    // A private window, or a browser set to block site data, throws on access
    // rather than returning null. The script runs before anything else on the
    // page, so an exception here would be an exception in the document head.
    removeStorage();
    expect(() => new Function(POINT_PREFERENCE_SCRIPT)()).not.toThrow();
    expect(document.documentElement.hasAttribute('data-point')).toBe(false);
  });
});

describe('applyPoint', () => {
  beforeEach(() => {
    installStorage();
    document.documentElement.removeAttribute('data-point');
    document.documentElement.style.removeProperty('--point');
  });

  afterEach(removeStorage);

  it('sets the attribute the stylesheet keys off and remembers the colour', () => {
    applyPoint('#8E4172');

    expect(document.documentElement.dataset.point).toBe('');
    expect(document.documentElement.style.getPropertyValue('--point')).toBe('#8e4172');
    expect(readPoint()).toBe('#8e4172');
  });

  it('clears both when the reader goes back to the default', () => {
    applyPoint('#8e4172');
    applyPoint(null);

    // Without the attribute the whole [data-point] block stops matching, so
    // the palette returns to the product's own rather than to a grey one.
    expect(document.documentElement.hasAttribute('data-point')).toBe(false);
    expect(document.documentElement.style.getPropertyValue('--point')).toBe('');
    expect(readPoint()).toBeNull();
  });

  it('refuses a value that is not a colour', () => {
    applyPoint('rgb(0,0,0); }');

    expect(document.documentElement.hasAttribute('data-point')).toBe(false);
    expect(readPoint()).toBeNull();
  });
});
