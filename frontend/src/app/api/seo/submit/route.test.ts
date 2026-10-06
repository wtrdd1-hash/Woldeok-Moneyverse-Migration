import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('SEO submission BFF', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fails closed instead of fabricating submission success when the backend is unavailable', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('backend unavailable')) as typeof fetch;

    try {
      const request = new NextRequest('http://localhost/api/seo/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(503);
      expect(payload.success).toBe(false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
