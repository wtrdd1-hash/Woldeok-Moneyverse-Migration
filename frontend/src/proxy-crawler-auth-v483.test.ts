import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

const originalToken = process.env.INTERNAL_API_TOKEN;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalToken === undefined) delete process.env.INTERNAL_API_TOKEN;
  else process.env.INTERNAL_API_TOKEN = originalToken;
});

describe('trusted crawler telemetry transport', () => {
  it('does not send crawler telemetry when the internal API token is unavailable', () => {
    delete process.env.INTERNAL_API_TOKEN;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    proxy(new NextRequest('https://easy-scraping.com/entry/old', {
      headers: { 'user-agent': 'Googlebot/2.1' },
    }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('authenticates crawler writes with the server-only internal API token', () => {
    process.env.INTERNAL_API_TOKEN = 'test-internal-token-'.padEnd(40, 'x');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const request = new NextRequest('https://easy-scraping.com/entry/old', {
      headers: { 'user-agent': 'Googlebot/2.1' },
    });

    proxy(request);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/seo/log'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-internal-token': process.env.INTERNAL_API_TOKEN,
        }),
      }),
    );
  });
});
