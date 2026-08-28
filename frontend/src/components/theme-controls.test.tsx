import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import { POINT_PREFERENCE_SCRIPT } from '@/lib/theme';
import { ThemeProvider } from './theme-provider';
import { ThemeMenu, ThemePanel } from './theme-controls';

/**
 * jsdom has no matchMedia and next-themes needs one for `enableSystem`. A
 * real browser always has it, so stubbing it here is restoring the browser
 * rather than papering over a failure.
 */
function stubMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  stubMatchMedia();
  // React only allows act() when told it is a test environment.
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});
afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-point');
  document.documentElement.removeAttribute('class');
  document.documentElement.style.removeProperty('--point');
});

/**
 * These mount for real rather than asserting on markup, because the failure
 * they guard against is a throw at mount: the masthead renders ThemeMenu on
 * every page, so anything that dies here takes the whole site with it and
 * shows the reader Next's client-exception screen instead.
 */
describe('ThemeMenu', () => {
  it('mounts inside the provider without throwing', () => {
    expect(() =>
      render(
        <ThemeProvider>
          <ThemeMenu />
        </ThemeProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByLabelText('화면 설정')).toBeTruthy();
  });

  it('mounts with no provider above it', () => {
    expect(() => render(<ThemeMenu />)).not.toThrow();
  });
});

describe('ThemePanel', () => {
  it('offers every preset plus the way back to the default', () => {
    render(
      <ThemeProvider>
        <ThemePanel />
      </ThemeProvider>,
    );
    for (const label of ['숲', '흙', '바다', '자두', '이끼', '밤']) {
      expect(screen.getByTitle(label)).toBeTruthy();
    }
    expect(screen.getByText('기본')).toBeTruthy();
    for (const base of ['시스템', '라이트', '다크']) {
      expect(screen.getByText(base)).toBeTruthy();
    }
  });

  it('survives a browser with no CSS.supports', () => {
    const original = Reflect.getOwnPropertyDescriptor(globalThis, 'CSS');
    Reflect.deleteProperty(globalThis, 'CSS');
    expect(() => render(<ThemePanel />)).not.toThrow();
    if (original) Object.defineProperty(globalThis, 'CSS', original);
  });
});

/**
 * The sequence a real page load runs, in order: the server's HTML, then the
 * pre-paint script writing to the document element, then hydration on top.
 *
 * This is the shape of failure that only shows in production - React downgrades
 * a mismatch to a warning in development and throws the minified error behind
 * "Application error: a client-side exception has occurred" in a built app.
 */
describe('hydration', () => {
  it('hydrates the masthead control after the pre-paint script has run', async () => {
    const tree = (
      <ThemeProvider>
        <ThemeMenu />
      </ThemeProvider>
    );
    const html = renderToString(tree);

    // This jsdom provides no localStorage, so the script is given one.
    const entries = new Map<string, string>([['wdmv.point', '#2f5fa8']]);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: (key: string) => entries.get(key) ?? null },
    });
    new Function(POINT_PREFERENCE_SCRIPT)();
    Reflect.deleteProperty(globalThis, 'localStorage');
    expect(document.documentElement.dataset.point).toBe('');

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const errors: unknown[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args));

    await act(async () => {
      hydrateRoot(container, tree, { onRecoverableError: (error) => errors.push(error) });
    });

    spy.mockRestore();
    expect(errors).toEqual([]);
  });
});
