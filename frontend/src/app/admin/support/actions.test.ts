import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { adminSupportReply, adminSupportStatus } from './actions';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const threadId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const messageId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const receipt = {
  message_id: messageId,
  sender_kind: 'admin',
  body: 'Verified reply',
  created_at: '2026-10-28T01:00:00.000Z',
};
const mockApi = vi.mocked(api);

function replyForm(id = threadId, body = receipt.body) {
  const form = new FormData();
  form.set('threadId', id);
  form.set('body', body);
  return form;
}

function statusForm(id = threadId, status = 'resolved') {
  const form = new FormData();
  form.set('threadId', id);
  form.set('status', status);
  return form;
}

function mockReply(post: unknown = { message: receipt }, read: unknown = { messages: [receipt] }) {
  mockApi.mockImplementation(async (path, options) => {
    if (path === '/api/v1/auth/session') return { csrfToken: 'verified-csrf' } as never;
    if (options?.method === 'POST') return post as never;
    if (path.endsWith('/messages')) return read as never;
    throw new Error(`unexpected call ${path}`);
  });
}

function mockStatus(put: unknown = { status: 'resolved' }, read: unknown = {
  threads: [{ thread_id: threadId, status: 'resolved' }],
}) {
  mockApi.mockImplementation(async (path, options) => {
    if (path === '/api/v1/auth/session') return { csrfToken: 'verified-csrf' } as never;
    if (options?.method === 'PUT') return put as never;
    if (path === '/api/v1/admin/support/threads') return read as never;
    throw new Error(`unexpected call ${path}`);
  });
}

describe('admin support authoritative mutation receipts', () => {
  beforeEach(() => { mockApi.mockReset(); });

  it('rejects an invalid reply thread ID instead of reporting success', async () => {
    await expect(adminSupportReply(replyForm('not-a-uuid'))).rejects.toThrow();
    expect(mockApi).not.toHaveBeenCalled();
  });

  it('rejects an empty reply body instead of returning void success', async () => {
    await expect(adminSupportReply(replyForm(threadId, '  '))).rejects.toThrow();
    expect(mockApi).not.toHaveBeenCalled();
  });

  it('rejects a missing reply receipt', async () => {
    mockReply({ message: null });
    await expect(adminSupportReply(replyForm())).rejects.toThrow();
  });

  it('rejects a reply receipt whose persisted body does not match the submitted body', async () => {
    mockReply({ message: { ...receipt, body: 'different' } });
    await expect(adminSupportReply(replyForm())).rejects.toThrow();
  });

  it('accepts a verified DB reply receipt without relying on oldest-500 message history', async () => {
    mockReply(undefined, { messages: [] });
    await expect(adminSupportReply(replyForm())).resolves.toBeUndefined();
    expect(mockApi).not.toHaveBeenCalledWith(`/api/v1/admin/support/threads/${threadId}/messages`);
  });

  it('accepts a valid database-backed reply receipt', async () => {
    mockReply();
    await expect(adminSupportReply(replyForm())).resolves.toBeUndefined();
    expect(mockApi).toHaveBeenCalledWith(
      `/api/v1/admin/support/threads/${threadId}/messages`,
      expect.objectContaining({ method: 'POST', csrfToken: 'verified-csrf' }),
    );
  });

  it('forwards the same caller-provided idempotency key to the database', async () => {
    const form = replyForm();
    form.set('idempotencyKey', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc');
    mockReply();
    await adminSupportReply(form);
    expect(mockApi).toHaveBeenCalledWith(expect.stringContaining('/messages'), expect.objectContaining({
      body: expect.objectContaining({ idempotencyKey: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' }),
    }));
  });

  it('rejects a malformed idempotency key', async () => {
    const form = replyForm();
    form.set('idempotencyKey', 'not-a-uuid');
    await expect(adminSupportReply(form)).rejects.toThrow();
    expect(mockApi).not.toHaveBeenCalled();
  });

  it('rejects an invalid status without silently returning success', async () => {
    await expect(adminSupportStatus(statusForm(threadId, 'invalid'))).rejects.toThrow();
    expect(mockApi).not.toHaveBeenCalled();
  });

  it('rejects an invalid status mutation receipt', async () => {
    mockStatus({ status: 'open' });
    await expect(adminSupportStatus(statusForm())).rejects.toThrow();
  });

  it('trusts a verified DB status receipt even when the bounded inbox omits the thread', async () => {
    mockStatus(undefined, { threads: [] });
    await expect(adminSupportStatus(statusForm())).resolves.toBeUndefined();
    expect(mockApi).not.toHaveBeenCalledWith('/api/v1/admin/support/threads');
  });

  it('accepts a status only after a matching database-backed mutation receipt', async () => {
    mockStatus();
    await expect(adminSupportStatus(statusForm())).resolves.toBeUndefined();
    expect(mockApi).toHaveBeenCalledWith(expect.stringContaining('/status'), expect.objectContaining({ method: 'PUT' }));
  });
});
