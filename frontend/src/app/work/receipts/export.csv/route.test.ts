import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiMock, memberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), memberMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: memberMock }));
import { GET } from './route';

const envelope = { scope: 'recent_20', currency: 'WLD', receipts: [] };
beforeEach(() => { vi.clearAllMocks(); memberMock.mockResolvedValue(undefined); apiMock.mockResolvedValue(envelope); });
describe('member Work receipt CSV route', () => {
  it('requires membership, returns private CSV, and never uses an unscoped API', async () => {
    const response = await GET();
    expect(memberMock).toHaveBeenCalledOnce();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/work/receipts/export');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(Array.from(new Uint8Array(await response.arrayBuffer()).slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
  });
  it('refuses to download unverified source data', async () => {
    apiMock.mockResolvedValueOnce({ receipts: [] });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('never calls upstream without a member session', async () => {
    memberMock.mockRejectedValueOnce(new Error('auth required'));
    await expect(GET()).rejects.toThrow('auth required');
    expect(apiMock).not.toHaveBeenCalled();
  });
});
