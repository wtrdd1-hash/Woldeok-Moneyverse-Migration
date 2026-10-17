import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
  headers: vi.fn(async () => new Headers({ 'x-moneyverse-locale': 'ja' })),
}));

import { getServerLocale } from './locale-server';
import { cookies, headers } from 'next/headers';

function firstVisit(country: string, cookie?: string, url = 'https://easy-scraping.com/') {
  return proxy(new NextRequest(url, {
    headers: {
      'cf-ipcountry': country,
      'accept-language': 'en-US,en;q=0.9',
      ...(cookie ? { cookie } : {}),
    },
  }));
}

describe('GeoIP locale first-request propagation', () => {
  it.each([['KR', 'ko'], ['JP', 'ja'], ['CN', 'zh'], ['US', 'en']] as const)(
    'forwards %s -> %s to same-request server components', (country, expected) => {
      const res = firstVisit(country);
      expect(res.headers.get('x-moneyverse-locale')).toBe(expected);
      expect(res.headers.get('x-middleware-request-x-moneyverse-locale')).toBe(expected);
      expect(res.cookies.get('wdmv_detected_locale')).toBeUndefined();
      expect(res.cookies.get('wdmv_locale')).toBeUndefined();
    },
  );

  it('does not convert a crawled /ja route into a permanent manual language preference', () => {
    const response = firstVisit('US', undefined, 'https://easy-scraping.com/ja/stocks');
    expect(response.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('ja');
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('keeps an existing manual preference unchanged on a different-language link', () => {
    const response = firstVisit('JP', 'wdmv_locale=ko', 'https://easy-scraping.com/en/stocks');
    expect(response.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('en');
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('preserves prefixed route locale through the internal rewrite even for visitors in a different country', () => {
    const first = firstVisit('US', undefined, 'https://easy-scraping.com/ja/stocks?sort=recent');
    const internalRewrite = first.headers.get('x-middleware-rewrite');
    expect(internalRewrite).toBe('https://easy-scraping.com/stocks?sort=recent&__mv_path_locale=ja');
    const second = proxy(new NextRequest(internalRewrite!, {
      headers: { 'cf-ipcountry': 'US', 'accept-language': 'en-US,en;q=0.9' },
    }));
    expect(second.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('ja');
    expect(second.headers.get('set-cookie')).toBeNull();
  });

  it('retains the locale URL over a conflicting query during internal rewrite', () => {
    const first = firstVisit('US', undefined, 'https://easy-scraping.com/ja/stocks?lang=ko');
    const target = first.headers.get('x-middleware-rewrite');
    const second = proxy(new NextRequest(target!, {
      headers: { 'cf-ipcountry': 'US', 'accept-language': 'en-US,en;q=0.9' },
    }));
    expect(second.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('ja');
    expect(second.headers.get('set-cookie')).toBeNull();
  });

  it('does not persist auto-detection as a cookie on each public request', () => {
    const res = firstVisit('US');
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('en');
  });

  it('ignores a stale previously auto-detected cookie when location changes', () => {
    const res = firstVisit('JP', 'wdmv_detected_locale=en');
    expect(res.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('ja');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('preserves manually selected language over IP inference', () => {
    const res = firstVisit('JP', 'wdmv_locale=ko');
    expect(res.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('ko');
    expect(res.cookies.get('wdmv_locale')).toBeUndefined();
  });

  it('prefers explicit locale URL to cookie and IP while internally rewriting', () => {
    const res = firstVisit('JP', 'wdmv_locale=ko', 'https://easy-scraping.com/en/stocks');
    expect(res.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('en');
  });

  it('reads forwarded server locale on a first visit with no cookies', async () => {
    vi.mocked(headers).mockResolvedValueOnce(new Headers({ 'x-moneyverse-locale': 'ja' }) as never);
    expect(await getServerLocale()).toBe('ja');
  });

  it('keeps an explicit URL language over an older manual cookie at SSR', async () => {
    vi.mocked(headers).mockResolvedValueOnce(new Headers({ 'x-moneyverse-locale': 'en' }) as never);
    vi.mocked(cookies).mockResolvedValueOnce({ get: () => ({ value: 'ko' }) } as never);
    expect(await getServerLocale()).toBe('en');
  });

  it('ignores a forged incoming locale request header', () => {
    const response = proxy(new NextRequest('https://easy-scraping.com/', {
      headers: { 'cf-ipcountry': 'KR', 'x-moneyverse-locale': 'ja' },
    }));
    expect(response.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('ko');
  });

  it('does not change public crawler locale based on IP', () => {
    const response = proxy(new NextRequest('https://easy-scraping.com/', {
      headers: { 'cf-ipcountry': 'JP', 'user-agent': 'Googlebot/2.1' },
    }));
    expect(response.headers.get('x-middleware-request-x-moneyverse-locale')).toBe('ko');
    expect(response.cookies.get('wdmv_detected_locale')).toBeUndefined();
  });

});
