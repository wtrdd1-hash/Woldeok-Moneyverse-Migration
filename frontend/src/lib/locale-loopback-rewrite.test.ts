import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

function localized(path: string, origin = 'https://localhost:4205') {
  return proxy(new NextRequest(new URL(path, origin), {
    headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
  }));
}

describe('localized public routes behind TLS-terminating ingress', () => {
  it.each(['/en/tools', '/ja/tools', '/zh/tools', '/en/stocks', '/en/roadmap'])(
    'rewrites %s to the HTTP loopback listener without downgrading the visitor URL',
    (path) => {
      const response = localized(`${path}?source=guide`);
      const locale = path.split('/')[1];
      const rewrite = new URL(response.headers.get('x-middleware-rewrite') ?? '');
      expect(rewrite.protocol).toBe('http:');
      expect(rewrite.host).toBe('localhost:4205');
      expect(rewrite.pathname).toBe(path.slice(locale.length + 1));
      expect(rewrite.searchParams.get('source')).toBe('guide');
      expect(rewrite.searchParams.get('__mv_path_locale')).toBe(locale);
      expect(response.headers.get('x-moneyverse-locale')).toBe(locale);
    },
  );

  it('never downgrades a public HTTPS rewrite destination', () => {
    const response = localized('/en/tools?source=guide', 'https://easy-scraping.com');
    const rewrite = new URL(response.headers.get('x-middleware-rewrite') ?? '');
    expect(rewrite.protocol).toBe('https:');
    expect(rewrite.hostname).toBe('easy-scraping.com');
  });

  it('does not rewrite physical localized blog routes', () => {
    const response = localized('/en/blog');
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get('x-moneyverse-locale')).toBe('en');
  });
});
