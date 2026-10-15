import { beforeEach, describe, expect, it, vi } from 'vitest';
import { safeFetch } from '../security/ssrf-defense';
import { SeoService } from './seo.service';

vi.mock('../security/ssrf-defense', () => ({
  safeFetch: vi.fn(),
}));

const fetchMock = vi.mocked(safeFetch);

describe('IndexNow submission truth and canonical boundaries', () => {
  beforeEach(() => fetchMock.mockReset());

  it('rejects URLs on other hosts before dispatching any request', async () => {
    const service = new SeoService();
    await expect(service.submitUrls(['https://outside.example/secret'])).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects malformed, protocol-relative, credentialed and non-HTTPS submissions', async () => {
    const service = new SeoService();
    for (const url of [
      'http://[invalid',
      '//outside.example/page',
      'https://u:p@easy-scraping.com/',
      'javascript:alert(1)',
    ]) {
      await expect(service.submitUrls([url])).rejects.toThrow();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects oversized batches to prevent mass-submission', async () => {
    const service = new SeoService();
    await expect(
      service.submitUrls(Array.from({ length: 101 }, (_, i) => '/article-' + i)),
    ).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns failure when no search engine accepts a notification', async () => {
    fetchMock.mockResolvedValue({ status: 503, ok: false } as Response);
    const result = await new SeoService().submitUrls(['/guide/stock-trading']);
    expect(result.success).toBe(false);
    expect(result.submittedUrls).toEqual(['https://easy-scraping.com/guide/stock-trading']);
    expect(result.indexNowResponses).toHaveLength(3);
    expect(result.indexNowResponses.every((response) => response.status === 503)).toBe(true);
  });

  it('accepts 202 as a pending notification, not completed indexing, and uses the served public key', async () => {
    fetchMock.mockResolvedValueOnce({ status: 500, ok: false } as Response);
    fetchMock.mockResolvedValueOnce({ status: 202, ok: true } as Response);
    fetchMock.mockResolvedValueOnce({ status: 422, ok: false } as Response);
    const result = await new SeoService().submitUrls(['/guide/stock-trading']);
    expect(result.success).toBe(true);
    expect(result.indexNowResponses.map(({ status }) => status)).toEqual([500, 202, 422]);
    const request = fetchMock.mock.calls[0]?.[1];
    const payload = JSON.parse(String(request?.body)) as {
      keyLocation: string;
      host: string;
      urlList: string[];
    };
    expect(payload).toMatchObject({
      host: 'easy-scraping.com',
      keyLocation: 'https://easy-scraping.com/.well-known/indexnow.key',
      urlList: ['https://easy-scraping.com/guide/stock-trading'],
    });
  });

  it('accepts an exact same-origin HTTPS URL and preserves its canonical path', async () => {
    fetchMock.mockResolvedValue({ status: 200, ok: true } as Response);
    const result = await new SeoService().submitUrls(['https://easy-scraping.com/stocks/CHIPS']);
    expect(result.success).toBe(true);
    expect(result.submittedUrls).toEqual(['https://easy-scraping.com/stocks/CHIPS']);
  });

  it('does not accept 204 as a valid IndexNow notification receipt', async () => {
    fetchMock.mockResolvedValue({ status: 204, ok: true } as Response);
    const result = await new SeoService().submitUrls(['/tools']);
    expect(result.success).toBe(false);
  });
});
