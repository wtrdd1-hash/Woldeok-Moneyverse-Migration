import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, revalidateMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  revalidateMock: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));

import { adminSupportReply, adminSupportStatus } from './actions';

const THREAD = 'c72e1198-a71e-459d-b112-c2eaa6a9d9ab';
const MESSAGE = 'ef8d57d4-8bc1-4f5b-994c-37b9281c7b24';
const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};

beforeEach(() => {
  apiMock.mockReset();
  revalidateMock.mockReset();
  apiMock.mockImplementation(async (path: string) => {
    if (path === '/api/v1/auth/session') return { csrfToken: 'csrf-test-token' };
    if (path.endsWith('/messages')) return {
      message: { message_id: MESSAGE, sender_kind: 'admin', body: '답변 완료', created_at: '2026-10-27T14:00:00.000Z' },
    };
    if (path.endsWith('/status')) return { status: 'waiting_user' };
    throw new Error(`unexpected route: ${path}`);
  });
});

describe('administrator support writes require verified server receipts', () => {
  it('accepts a matching persisted reply receipt and revalidates the inbox', async () => {
    await adminSupportReply(form({ threadId: THREAD, body: '답변 완료' }));
    expect(apiMock).toHaveBeenCalledWith(expect.stringContaining(`/threads/${THREAD}/messages`), expect.objectContaining({
      method: 'POST', csrfToken: 'csrf-test-token', body: expect.objectContaining({ body: '답변 완료' }),
    }));
    expect(revalidateMock).toHaveBeenCalledWith('/admin/support');
  });

  it.each([
    undefined,
    {},
    { message: { message_id: MESSAGE, sender_kind: 'user', body: '답변 완료', created_at: '2026-10-27T14:00:00.000Z' } },
    { message: { message_id: MESSAGE, sender_kind: 'admin', body: '다른 내용', created_at: '2026-10-27T14:00:00.000Z' } },
    { message: { message_id: 'not-a-uuid', sender_kind: 'admin', body: '답변 완료', created_at: '2026-10-27T14:00:00.000Z' } },
  ])('rejects absent or contradictory reply receipts instead of reporting success (%j)', async (receipt) => {
    apiMock.mockImplementation(async (path: string) => path === '/api/v1/auth/session' ? { csrfToken: 'csrf-test-token' } : receipt);
    await expect(adminSupportReply(form({ threadId: THREAD, body: '답변 완료' }))).rejects.toThrow();
    expect(revalidateMock).not.toHaveBeenCalled();
  });

  it('rejects invalid thread IDs and empty messages without calling the API', async () => {
    await expect(adminSupportReply(form({ threadId: 'not-a-uuid', body: '답변 완료' }))).rejects.toThrow();
    await expect(adminSupportReply(form({ threadId: THREAD, body: '   ' }))).rejects.toThrow();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('refuses a missing CSRF token instead of sending a reply', async () => {
    apiMock.mockResolvedValue({ csrfToken: '' });
    await expect(adminSupportReply(form({ threadId: THREAD, body: '답변 완료' }))).rejects.toThrow();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(revalidateMock).not.toHaveBeenCalled();
  });

  it('rejects oversized replies rather than silently truncating the administrator text', async () => {
    await expect(adminSupportReply(form({ threadId: THREAD, body: '가'.repeat(2001) }))).rejects.toThrow();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('accepts a matching status receipt and revalidates', async () => {
    await adminSupportStatus(form({ threadId: THREAD, status: 'waiting_user' }));
    expect(revalidateMock).toHaveBeenCalledWith('/admin/support');
  });

  it.each([undefined, {}, { status: 'open' }, { status: 'invalid' }])('rejects missing or mismatched status receipts (%j)', async (receipt) => {
    apiMock.mockImplementation(async (path: string) => path === '/api/v1/auth/session' ? { csrfToken: 'csrf-test-token' } : receipt);
    await expect(adminSupportStatus(form({ threadId: THREAD, status: 'waiting_user' }))).rejects.toThrow();
    expect(revalidateMock).not.toHaveBeenCalled();
  });

  it('rejects invalid status or thread IDs instead of silently returning success', async () => {
    await expect(adminSupportStatus(form({ threadId: 'invalid', status: 'waiting_user' }))).rejects.toThrow();
    await expect(adminSupportStatus(form({ threadId: THREAD, status: 'invalid' }))).rejects.toThrow();
    expect(apiMock).not.toHaveBeenCalled();
  });
});
