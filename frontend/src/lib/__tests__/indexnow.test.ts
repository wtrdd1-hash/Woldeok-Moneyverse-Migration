import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  submitToIndexNow,
  INDEXNOW_HOST,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
} from '@/lib/indexnow';

describe('IndexNow Protocol Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles empty URL list gracefully without network request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await submitToIndexNow([]);

    expect(result.success).toBe(true);
    expect(result.submittedCount).toBe(0);
    expect(result.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('submits URLs correctly with proper RFC payload structure and headers', async () => {
    const mockResponse = new Response('OK', { status: 200 });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const urls = [
      'https://easy-scraping.com/',
      'https://easy-scraping.com/tools/stock-calculator',
    ];

    const result = await submitToIndexNow(urls);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: INDEXNOW_HOST,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList: urls,
      }),
    });

    expect(result.success).toBe(true);
    expect(result.submittedCount).toBe(2);
    expect(result.status).toBe(200);
  });

  it('accepts HTTP 202 (Accepted) as success according to IndexNow RFC', async () => {
    const mockResponse = new Response('Accepted', { status: 202 });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const result = await submitToIndexNow(['https://easy-scraping.com/feed.xml']);

    expect(result.success).toBe(true);
    expect(result.status).toBe(202);
  });

  it('handles HTTP error responses accurately', async () => {
    const mockResponse = new Response('Bad Request: Invalid Key', { status: 400 });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const result = await submitToIndexNow(['https://easy-scraping.com/test']);

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.responseText).toBe('Bad Request: Invalid Key');
  });

  it('catches network exceptions without throwing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));

    const result = await submitToIndexNow(['https://easy-scraping.com/test']);

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toContain('Network offline');
  });
});
