import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { GET } from './route';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: vi.fn() }));

const record = {
  requestId: '22222222-2222-4222-8222-222222222222', requestType: 'access',
  status: 'received', detail: null, createdAt: '2026-10-26T00:00:00.000Z',
};

beforeEach(() => { vi.resetAllMocks(); });

describe('private privacy request receipt download', () => {
  it('rejects unsigned members without requesting private data', async () => {
    vi.mocked(viewerOrUnknown).mockResolvedValue({ signedIn: false } as never);
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(api).not.toHaveBeenCalled();
  });

  it('returns only verified intake CSV with private attachment headers', async () => {
    vi.mocked(viewerOrUnknown).mockResolvedValue({ signedIn: true } as never);
    vi.mocked(api).mockResolvedValue({ scope: 'recent_intake_receipts', limit: 30, requests: [record] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain(record.requestId);
    expect(api).toHaveBeenCalledWith('/api/v1/privacy/requests/snapshot');
  });

  it('fails closed on incomplete or unverified data', async () => {
    vi.mocked(viewerOrUnknown).mockResolvedValue({ signedIn: true } as never);
    vi.mocked(api).mockResolvedValue({ scope: 'all_history', limit: 30, requests: [record] });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});
