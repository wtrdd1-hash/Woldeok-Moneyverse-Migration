import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as contributePost } from './contribute/route';
import { POST as liquidatePost } from './liquidate/route';
import { mutate } from '@/lib/mutate';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate: vi.fn() }));

const endpoints = [
  { name: 'contribute', post: contributePost, body: { amountWld: '100' }, upstream: '/api/v1/pension/contribute' },
  { name: 'liquidate', post: liquidatePost, body: undefined, upstream: '/api/v1/pension/liquidate' },
] as const;

function browserPost(path: string, origin: string | null, site: string | null, body?: object): Request {
  const headers: Record<string, string> = {};
  if (origin !== null) headers.origin = origin;
  if (site !== null) headers['sec-fetch-site'] = site;
  if (body !== undefined) headers['content-type'] = 'application/json';
  return new Request(`https://easy-scraping.com/api/pension/${path}`, {
    method: 'POST', headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe('Pension financial mutation browser gateways', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mutate).mockResolvedValue({ ok: true });
  });
  for (const endpoint of endpoints) {
    it(`${endpoint.name} rejects cross-origin, missing-origin and cross-site requests before upstream`, async () => {
      for (const [origin, site] of [
        ['https://evil.example', 'cross-site'],
        [null, 'same-origin'],
        ['https://easy-scraping.com', 'cross-site'],
      ] as const) {
        const response = await endpoint.post(browserPost(endpoint.name, origin, site, endpoint.body));
        expect(response.status).toBe(403);
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
      }
      expect(mutate).not.toHaveBeenCalled();
      expect(api).not.toHaveBeenCalled();
    });
    it(`${endpoint.name} keeps upstream failures private and does not report success`, async () => {
      vi.mocked(mutate).mockRejectedValueOnce({ status: 503, message: 'temporarily unavailable' });
      const response = await endpoint.post(browserPost(endpoint.name, 'https://easy-scraping.com', 'same-origin', endpoint.body));
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
      expect(mutate).toHaveBeenCalledOnce();
    });
    it(`${endpoint.name} uses server-side session CSRF for same-origin financial mutation`, async () => {
      const response = await endpoint.post(browserPost(endpoint.name, 'https://easy-scraping.com', 'same-origin', endpoint.body));
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
      expect(mutate).toHaveBeenCalledExactlyOnceWith(endpoint.upstream, {
        method: 'POST', ...(endpoint.body === undefined ? {} : { body: endpoint.body }),
      });
      expect(api).not.toHaveBeenCalled();
    });
  }
});
