import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, revalidateMock, redirectMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  revalidateMock: vi.fn(),
  redirectMock: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
}));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
vi.mock('next/navigation', () => ({ redirect: redirectMock }));

import { createSupportThread, replySupportThread } from './actions';

const KEY = 'd92451e0-334e-4dcb-887e-7b6f9327eac9';
const THREAD = 'df02b115-9a0e-4f93-a8f2-4dc8130d7d9a';
const MESSAGE = 'c66bde56-a49f-4b64-a127-97f85b5c1074';
const idle = { error: null };
const form = (entries: Record<string, string>) => {
  const data = new FormData();
  Object.entries(entries).forEach(([key, value]) => data.set(key, value));
  return data;
};

beforeEach(() => { vi.clearAllMocks(); apiMock.mockResolvedValue({ csrfToken: 'csrf' }); });

describe('support retry receipts', () => {
  it('uses the same submitted UUID across failures and retries without inventing success', async () => {
    const input = form({ idempotencyKey: KEY, subject: '결제 문의', body: '요청 확인' });
    apiMock.mockResolvedValueOnce({ csrfToken: 'csrf' }).mockRejectedValueOnce(new Error('upstream timeout'));
    const failed = await createSupportThread(idle, input);
    expect(failed.error).toMatch(/다시 시도/);
    expect(redirectMock).not.toHaveBeenCalled();
    apiMock.mockResolvedValueOnce({ csrfToken: 'csrf' }).mockResolvedValueOnce({ thread: { thread_id: THREAD } });
    await expect(createSupportThread(failed, input)).rejects.toThrow(`REDIRECT:/support?thread=${THREAD}`);
    expect(apiMock.mock.calls.filter(([url]) => url === '/api/v1/support/threads').map(([, request]) => request.body.idempotencyKey)).toEqual([KEY, KEY]);
  });

  it('does not reuse a lost-response create receipt for edited content', async () => {
    const input = form({ idempotencyKey: KEY, subject: '문의 A', body: '내용 A' });
    apiMock.mockResolvedValueOnce({ csrfToken: 'csrf' }).mockRejectedValueOnce(new Error('timeout'));
    const failed = await createSupportThread(idle, input);
    const changed = form({ idempotencyKey: KEY, subject: '문의 B', body: '내용 B' });
    const rejected = await createSupportThread(failed, changed);
    expect(rejected.error).toBeTruthy();
    expect(apiMock.mock.calls.filter(([url]) => url === '/api/v1/support/threads')).toHaveLength(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('rejects malformed UUID before API mutation', async () => {
    const result = await createSupportThread(idle, form({ idempotencyKey: 'bad', subject: '문의', body: '내용' }));
    expect(result.error).toBeTruthy();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('does not report a created thread when API returns a missing or invalid receipt', async () => {
    apiMock.mockResolvedValueOnce({ csrfToken: 'csrf' }).mockResolvedValueOnce({ thread: { status: 'open' } });
    const result = await createSupportThread(idle, form({ idempotencyKey: KEY, subject: '문의', body: '내용' }));
    expect(result.error).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('replies with the same key on retry and redirects only after a verified message receipt', async () => {
    const input = form({ idempotencyKey: KEY, threadId: THREAD, body: '답장' });
    apiMock.mockResolvedValueOnce({ csrfToken: 'csrf' }).mockRejectedValueOnce(new Error('timeout'));
    const failed = await replySupportThread(idle, input);
    expect(failed.error).toBeTruthy();
    apiMock.mockResolvedValueOnce({ csrfToken: 'csrf' }).mockResolvedValueOnce({ message: { message_id: MESSAGE, sender_kind: 'user', body: '답장' } });
    await expect(replySupportThread(failed, input)).rejects.toThrow(`REDIRECT:/support?thread=${THREAD}`);
    expect(apiMock.mock.calls.filter(([url]) => url.endsWith('/messages')).map(([, request]) => request.body.idempotencyKey)).toEqual([KEY, KEY]);
  });

  it('fails closed for invalid thread IDs and malformed reply receipts', async () => {
    const invalid = await replySupportThread(idle, form({ idempotencyKey: KEY, threadId: '../../admin', body: 'hello' }));
    expect(invalid.error).toBeTruthy();
    expect(apiMock).not.toHaveBeenCalled();
    apiMock.mockResolvedValueOnce({ csrfToken: 'csrf' }).mockResolvedValueOnce({ message: { body: 'hello' } });
    const malformed = await replySupportThread(idle, form({ idempotencyKey: KEY, threadId: THREAD, body: 'hello' }));
    expect(malformed.error).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
