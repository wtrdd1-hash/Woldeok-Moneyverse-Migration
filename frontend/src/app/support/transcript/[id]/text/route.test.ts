import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiMock, memberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), memberMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: memberMock }));
import { GET } from './route';
const id = 'b0000000-0000-4000-8000-000000000002';
const ctx = (value: string) => ({ params: Promise.resolve({ id: value }) });
beforeEach(() => vi.clearAllMocks());
describe('private member support text download', () => {
  it('rejects malformed identifiers before backend access', async () => {
    const response = await GET(new Request('https://example.com/support/transcript/bad/text'), ctx('bad'));
    expect(response.status).toBe(400);
    expect(apiMock).not.toHaveBeenCalled();
  });
  it('requires membership and returns UTF-8 plain text with no-store, nosniff and noindex', async () => {
    apiMock.mockResolvedValue({ threadId: id, text: 'USER\n  | hello\n', truncated: false });
    const response = await GET(new Request(`https://example.com/support/transcript/${id}/text`), ctx(id));
    expect(memberMock).toHaveBeenCalledOnce();
    expect(apiMock).toHaveBeenCalledWith(`/api/v1/support/threads/${id}/transcript/text`);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-disposition')).toContain('.txt');
    expect(await response.text()).toContain('hello');
  });
  it('does not turn a backend ownership denial into a downloadable text file', async () => {
    apiMock.mockRejectedValue(new Error('forbidden'));
    await expect(GET(new Request(`https://example.com/support/transcript/${id}/text`), ctx(id))).rejects.toThrow('forbidden');
  });
  it('rejects mismatched upstream thread identity and malformed text', async () => {
    apiMock.mockResolvedValue({ threadId: 'a0000000-0000-4000-8000-000000000001', text: 'foreign', truncated: false });
    expect((await GET(new Request(`https://example.com/support/transcript/${id}/text`), ctx(id))).status).toBe(502);
    apiMock.mockResolvedValue({ threadId: id, text: null, truncated: false });
    expect((await GET(new Request(`https://example.com/support/transcript/${id}/text`), ctx(id))).status).toBe(502);
  });
});
