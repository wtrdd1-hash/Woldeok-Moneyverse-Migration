import { describe, expect, it } from 'vitest';
import { AuthBootstrapPrivateResponseMiddleware } from './auth.module';

// Middleware runs before guards and must protect even rejected responses.
describe('auth bootstrap response privacy', () => {
  it('sets private no-store and noindex before continuing', () => {
    const headers = new Map<string, string>();
    let called = false;
    new AuthBootstrapPrivateResponseMiddleware().use(
      {} as never,
      { setHeader: (key: string, value: string) => { headers.set(key, value); } } as never,
      (() => { called = true; }) as never,
    );
    expect(called).toBe(true);
    expect(headers.get('Cache-Control')).toBe('private, no-store');
    expect(headers.get('X-Robots-Tag')).toBe('noindex');
    expect(headers.get('Referrer-Policy')).toBe('no-referrer');
  });
});
