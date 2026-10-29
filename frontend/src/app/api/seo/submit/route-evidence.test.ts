import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { mutate } from '@/lib/mutate';
import { POST } from './route';

vi.mock('@/lib/mutate', () => ({ mutate: vi.fn() }));

afterEach(() => vi.resetAllMocks());
const request = () => new NextRequest('http://localhost/api/seo/submit', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
});

describe('SEO submission gateway receipt contract', () => {
  it('returns 503 instead of forwarding an unverified success object', async () => {
    vi.mocked(mutate).mockResolvedValue({ success: true, indexNowResponses: [] });
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect((await res.json()).success).toBe(false);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });
  it('returns only verified provider acceptance, not indexing confirmation', async () => {
    vi.mocked(mutate).mockResolvedValue({
      success: true, timestamp: new Date().toISOString(), googlePingStatus: 410,
      submittedUrls: ['https://easy-scraping.com/stocks/CHIPS'],
      indexNowResponses: [
        { endpoint: 'https://api.indexnow.org/indexnow', status: 200, message: 'Notification received' },
        { endpoint: 'https://searchadvisor.naver.com/indexnow', status: 503, message: 'Unavailable' },
        { endpoint: 'https://www.bing.com/indexnow', status: 503, message: 'Unavailable' },
      ],
    });
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, acceptedEndpoints: 1, totalEndpoints: 3, indexingConfirmed: false });
  });
});
