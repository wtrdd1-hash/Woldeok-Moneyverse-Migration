import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

describe('localized route internal rewrite scheme', () => {
  function rewritten(url: string) {
    const request = new NextRequest(url, {
      headers: { host: new URL(url).host, 'x-forwarded-proto': 'https', 'user-agent': 'Mozilla/5.0' },
    });
    return proxy(request).headers.get('x-middleware-rewrite');
  }

  it('uses loopback HTTP for a localized route behind HTTPS TLS termination', () => {
    expect(rewritten('https://localhost:4165/en/login?ref=abc'))
      .toBe('http://localhost:4165/login?ref=abc&__mv_path_locale=en');
  });

  it('preserves a real public HTTPS origin', () => {
    expect(rewritten('https://easy-scraping.com/ja/wallet'))
      .toBe('https://easy-scraping.com/wallet?__mv_path_locale=ja');
  });

  it('preserves HTTP loopback and rejects lookalike hosts', () => {
    expect(new URL(rewritten('http://127.0.0.1:4165/ko/login')!).protocol)
      .toBe('http:');
    expect(rewritten('https://localhost.evil.test/en/login'))
      .toBe('https://localhost.evil.test/login?__mv_path_locale=en');
  });
});
