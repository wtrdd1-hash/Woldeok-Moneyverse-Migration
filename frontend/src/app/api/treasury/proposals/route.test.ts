import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST, PUT } from './route';
import { api } from '@/lib/api';
import { isLoggedInMember } from '@/lib/session';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ isLoggedInMember: vi.fn() }));

beforeEach(() => {
  vi.mocked(api).mockReset();
  vi.mocked(isLoggedInMember).mockResolvedValue(true);
});

describe('treasury citizen proposals require authoritative ledger-backed records', () => {
  it('GET refuses synthetic proposals and provides a non-cacheable unavailable response', async () => {
    vi.mocked(api).mockRejectedValue(new Error('no verified treasury proposal store'));
    const response = await GET();
    const body = await response.json();
    expect(api).toHaveBeenCalledWith('/api/v1/treasury/citizen-proposals');
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(body).toMatchObject({ ok: false, verified: false, proposals: [] });
    expect(JSON.stringify(body)).not.toContain('prop-101');
  });

  it('does not trust an upstream HTTP 200 with invented vote counts', async () => {
    vi.mocked(api).mockResolvedValue({ verified: true, proposals: [{ id: 'prop-101', votesCount: 842 }] });
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).proposals).toEqual([]);
  });

  it('requires a signed-in member even for disabled proposal mutations', async () => {
    vi.mocked(isLoggedInMember).mockResolvedValue(false);
    const response = await POST(new Request('https://easy-scraping.com/api/treasury/proposals', { method: 'POST' }));
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it.each(['POST', 'PUT'] as const)('%s never records an unverified proposal or vote', async (method) => {
    const request = new Request('https://easy-scraping.com/api/treasury/proposals', {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Fake approval', proposalId: 'prop-101' }),
    });
    const response = method === 'POST' ? await POST(request) : await PUT(request);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({ ok: false, verified: false });
    expect(api).not.toHaveBeenCalled();
  });
});
