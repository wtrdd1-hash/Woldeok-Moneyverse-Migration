import { describe, expect, it, vi, beforeEach } from 'vitest';

const { apiMock, memberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), memberMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: memberMock }));

import { GET } from './route';
const threadId = 'b0000000-0000-4000-8000-000000000002';

beforeEach(() => { vi.clearAllMocks(); });

describe('member support CSV route', () => {
  it('rejects malformed ids without calling the backend', async () => {
    const response = await GET(new Request('https://example.com/support/transcript/invalid'), { params: Promise.resolve({ id: 'invalid' }) });
    expect(response.status).toBe(400);
    expect(apiMock).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('requires membership and downloads only the selected owner-scoped transcript', async () => {
    apiMock.mockResolvedValue({ threadId, messages: [{ message_id: 'm1', sender_kind: 'admin', body: '=SUM(1)', created_at: '2026-10-28T00:00:00Z' }], truncated: false });
    const response = await GET(new Request(`https://example.com/support/transcript/${threadId}`), { params: Promise.resolve({ id: threadId }) });
    expect(memberMock).toHaveBeenCalledTimes(1);
    expect(apiMock).toHaveBeenCalledWith(`/api/v1/support/threads/${threadId}/transcript`);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain("'=SUM(1)");
  });

  it('does not turn an upstream ownership denial into a downloadable CSV', async () => {
    apiMock.mockRejectedValue(new Error('forbidden'));
    await expect(GET(new Request(`https://example.com/support/transcript/${threadId}`), { params: Promise.resolve({ id: threadId }) })).rejects.toThrow('forbidden');
  });
});
