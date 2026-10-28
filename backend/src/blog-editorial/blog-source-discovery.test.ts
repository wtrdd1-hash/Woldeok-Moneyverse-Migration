import { describe, expect, it, vi } from 'vitest';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';
import { discoverPrimaryCandidates, isAllowedSourceDocument } from './blog-source-discovery';
import { retrievePrimarySource, sourceUrlFor } from './blog-primary-sources';

const slots = Array.from({ length: 24 }, (_, hour) =>
  selectTwoHourBlogSlot(new Date(Date.parse('2026-10-27T04:00:00+09:00') + hour * 3600000)),
).filter((slot) => slot !== null);
const kr = slots.find((s) => s.country === 'KR' && s.topic === 'ECONOMY')!;
const us = slots.find((s) => s.country === 'US' && s.topic === 'ECONOMY')!;
const coding = slots.find((s) => s.topic === 'CODING')!;

function response(body: string, type: string): Response {
  return new Response(body, { status: 200, headers: { 'content-type': type } });
}

describe('v1414 automated official source search', () => {
  it('rejects attacker hosts, port/userinfo and cross-topic links', () => {
    const seed = sourceUrlFor(coding);
    expect(isAllowedSourceDocument(seed, seed, coding)).toBe(true);
    expect(isAllowedSourceDocument('https://developer.mozilla.org.evil.test/ko/docs/Web/JavaScript', seed, coding)).toBe(false);
    expect(isAllowedSourceDocument('http://developer.mozilla.org/en-US/docs/Web/JavaScript', seed, coding)).toBe(false);
    expect(isAllowedSourceDocument('https://person@developer.mozilla.org/en-US/docs/Web/JavaScript', seed, coding)).toBe(false);
    expect(isAllowedSourceDocument('https://developer.mozilla.org:8443/en-US/docs/Web/JavaScript', seed, coding)).toBe(false);
    expect(isAllowedSourceDocument('https://developer.mozilla.org/en-US/docs/Web/HTTP', seed, coding)).toBe(coding.topic === 'COMPUTER');
  });

  it('discovers and fetches an official BOK article, not the fixed homepage', async () => {
    const seed = sourceUrlFor(kr);
    const trusted = 'https://www.bok.or.kr/portal/bbs/B0000552/view.do?nttId=1001';
    const rss = `<rss><channel><item><title>물가와 경제 분석</title><link>${trusted.replaceAll('&', '&amp;')}</link></item></channel></rss>`;
    const longArticle = '<article>' + '검증 가능한 물가 정책 기초 설명 '.repeat(120) + '</article>';
    const fetcher = vi.fn(async (url: RequestInfo | URL, _init?: RequestInit) => {
      if (String(url).includes('/news.rss')) return response(rss, 'application/rss+xml');
      if (String(url) === trusted) return response(longArticle, 'text/html');
      return response('<html>fallback</html>', 'text/html');
    });
    const found = await retrievePrimarySource(kr, fetcher as typeof fetch);
    expect(found.url).toBe(trusted);
    expect(found.excerpt).toContain('물가');
    expect(found.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(fetcher).toHaveBeenCalledWith(trusted, expect.objectContaining({ redirect: 'manual' }));
    expect(fetcher.mock.calls.every(([, options]) => (options as RequestInit).redirect === 'manual')).toBe(true);
    expect(seed).not.toBe(trusted);
  });

  it('filters malicious RSS entries and falls back when discovery cannot be verified', async () => {
    const seed = sourceUrlFor(us);
    const malicious = '<rss><item><title>monetary policy</title><link>https://federalreserve.gov.evil.test/steal</link></item></rss>';
    const fetcher = vi.fn(async (url: RequestInfo | URL) =>
      String(url).includes('/feeds/') ? response(malicious, 'application/xml')
        : response('<html>' + 'Federal Reserve educational reference '.repeat(70) + '</html>', 'text/html'));
    const found = await retrievePrimarySource(us, fetcher as typeof fetch);
    expect(found.url).toBe(seed);
    expect(fetcher.mock.calls.some(([url]) => String(url).includes('evil.test'))).toBe(false);
  });

  it('searches localised MDN index links and bounds candidate count', async () => {
    const seed = sourceUrlFor(coding);
    const page = '<html>' + Array.from({length: 30}, (_, i) =>
      `<a href="/${coding.locale === 'ko-KR' ? 'ko' : coding.locale === 'en-US' ? 'en-US' : coding.locale === 'ja-JP' ? 'ja' : 'zh-CN'}/docs/Web/JavaScript/Reference/Global_Objects/Object${i}">JavaScript programming reference</a>`).join('') + '</html>';
    const fetcher = vi.fn().mockResolvedValue(response(page, 'text/html'));
    const urls = await discoverPrimaryCandidates(coding, seed, fetcher);
    expect(urls[urls.length - 1]).toBe(seed);
    expect(urls.length).toBeLessThanOrEqual(6);
    expect(urls[0]).toMatch(/^https:\/\/developer\.mozilla\.org\//);
  });

  it('never accepts feed redirect, non-XML body or unsafe external link as verified evidence', async () => {
    const seed = sourceUrlFor(us);
    const fetcher = vi.fn(async (url: RequestInfo | URL) =>
      String(url).includes('/feeds/') ? new Response('outside', {status: 302, headers: {'content-type':'text/html'}})
        : response('<p>' + 'Official economic principles '.repeat(100) + '</p>', 'text/html'));
    const result = await retrievePrimarySource(us, fetcher as typeof fetch);
    expect(result.url).toBe(seed);
  });
});
