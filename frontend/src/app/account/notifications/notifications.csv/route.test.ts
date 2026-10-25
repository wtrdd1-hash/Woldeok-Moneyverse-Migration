import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';
const item = { id: '22222222-2222-4222-8222-222222222222', category: 'system', title: '=2+3', body: 'Hi,"world"', link: null, is_read: false, read_at: null, created_at: '2026-10-26T00:00:00.000Z' };

describe('private notification archive CSV', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); api.mockResolvedValue({ notifications: [item], complete: true }); });
  it('exports escaped CSV and private noindex headers', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(res.headers.get('content-disposition')).toContain('attachment;');
    expect(await res.text()).toContain("'=2+3");
    expect(api).toHaveBeenCalledWith('/api/v1/notifications/archive-snapshot');
  });
  it('fails closed on invalid records or incomplete snapshot', async () => {
    api.mockResolvedValueOnce({ notifications: [item], complete: false }).mockResolvedValueOnce({ notifications: [{ ...item, is_read: 'false' }], complete: true });
    expect((await GET()).status).toBe(503);
    expect((await GET()).status).toBe(503);
  });
  it('distinguishes logged-out and unavailable session', async () => {
    viewerOrUnknown.mockResolvedValueOnce({ signedIn: false }).mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
    expect((await GET()).status).toBe(503);
    expect(api).not.toHaveBeenCalled();
  });
  it('does not return a file on backend failure', async () => {
    api.mockRejectedValueOnce(new Error('database down'));
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get('content-disposition')).toBeNull();
  });
});
