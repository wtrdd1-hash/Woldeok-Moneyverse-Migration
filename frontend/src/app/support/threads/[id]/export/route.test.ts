import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error { constructor(readonly status: number) { super('api error'); } } }));
import { ApiError } from '@/lib/api';
import { GET } from './route';

const thread = '22222222-2222-4222-8222-222222222222';
const ctx = { params: Promise.resolve({ id: thread }) };

describe('support CSV private download', () => {
  beforeEach(() => vi.resetAllMocks());

  it('uses backend session owner lookup and private download headers', async () => {
    api.mockResolvedValue({ limit: 500, truncated: false, messages: [] });
    const response = await GET(new Request(`https://example.com/support/threads/${thread}/export`), ctx);
    expect(api).toHaveBeenCalledWith(`/api/v1/support/threads/${thread}/transcript`);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('.csv');
  });

  it('never returns a successful file when authentication or the database fails', async () => {
    api.mockRejectedValueOnce(new ApiError(401));
    expect((await GET(new Request('https://example.com'), ctx)).status).toBe(401);
    api.mockRejectedValueOnce(new Error('database unavailable'));
    expect((await GET(new Request('https://example.com'), ctx)).status).toBe(503);
  });

  it('rejects malformed thread identifiers without contacting the API', async () => {
    const response = await GET(new Request('https://example.com'), { params: Promise.resolve({ id: '../../x' }) });
    expect(response.status).toBe(404);
    expect(api).not.toHaveBeenCalled();
  });
});
