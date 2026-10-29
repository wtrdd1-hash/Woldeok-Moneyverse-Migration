import { beforeEach, describe, expect, it, vi } from 'vitest';

const { read, revalidate } = vi.hoisted(() => ({ read: vi.fn(), revalidate: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: read }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));

import { createSupportThread, replySupportThread } from './actions';

const threadId = '4bb16d4d-6d18-4fb6-b581-1d5a716c1e3a';
const messageId = '17e798e0-3c69-4f48-80b0-66cf3c6f130b';
const created = '2026-10-29T03:00:00.000Z';
const thread = { thread_id: threadId, status: 'open', created_at: created };
const message = { message_id: messageId, sender_kind: 'user', body: '문의 내용', created_at: created };

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}
const newThread = () => form({ subject: '문의 제목', body: '문의 내용' });
const reply = () => form({ threadId, body: '문의 내용' });

beforeEach(() => {
  vi.clearAllMocks();
  read.mockImplementation((path: string, options?: { method?: string }) => {
    if (path === '/api/v1/auth/session') return Promise.resolve({ csrfToken: 'csrf' });
    if (path === '/api/v1/support/threads' && options?.method === 'POST') return Promise.resolve({ thread });
    if (path === '/api/v1/support/threads') return Promise.resolve({ threads: [{ ...thread, subject: '문의 제목' }] });
    if (path === `/api/v1/support/threads/${threadId}/messages` && options?.method === 'POST') return Promise.resolve({ message });
    if (path === `/api/v1/support/threads/${threadId}/messages`) return Promise.resolve({ messages: [message] });
    throw new Error(`Unexpected request: ${path}`);
  });
});

describe('member support verified delivery', () => {
  it('does not claim a new thread was sent from a 2xx without a thread receipt', async () => {
    read.mockImplementationOnce(() => Promise.resolve({ csrfToken: 'csrf' })).mockImplementationOnce(() => Promise.resolve({}));
    const result = await createSupportThread({ status: 'idle' }, newThread());
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a new thread with a contradictory owner readback', async () => {
    read.mockImplementationOnce(() => Promise.resolve({ csrfToken: 'csrf' }))
      .mockImplementationOnce(() => Promise.resolve({ thread }))
      .mockImplementationOnce(() => Promise.resolve({ threads: [{ ...thread, subject: '다른 문의' }] }));
    const result = await createSupportThread({ status: 'idle' }, newThread());
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('requires the original message to appear in owner readback before confirming a new thread', async () => {
    read.mockImplementationOnce(() => Promise.resolve({ csrfToken: 'csrf' }))
      .mockImplementationOnce(() => Promise.resolve({ thread }))
      .mockImplementationOnce(() => Promise.resolve({ threads: [{ ...thread, subject: '문의 제목' }] }))
      .mockImplementationOnce(() => Promise.resolve({ messages: [] }));
    const result = await createSupportThread({ status: 'idle' }, newThread());
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('confirms a new thread only after owner thread and first-message readbacks', async () => {
    const result = await createSupportThread({ status: 'idle' }, newThread());
    expect(result.status).toBe('ok');
    expect(result.threadId).toBe(threadId);
    expect(revalidate).toHaveBeenCalledWith('/support');
  });

  it('does not confirm a reply with no message receipt', async () => {
    read.mockImplementationOnce(() => Promise.resolve({ csrfToken: 'csrf' })).mockImplementationOnce(() => Promise.resolve({}));
    const result = await replySupportThread({ status: 'idle' }, reply());
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a reply receipt with a different body or sender', async () => {
    read.mockImplementationOnce(() => Promise.resolve({ csrfToken: 'csrf' }))
      .mockImplementationOnce(() => Promise.resolve({ message: { ...message, sender_kind: 'admin' } }));
    const result = await replySupportThread({ status: 'idle' }, reply());
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('does not confirm a reply when owner readback lacks the message', async () => {
    read.mockImplementationOnce(() => Promise.resolve({ csrfToken: 'csrf' }))
      .mockImplementationOnce(() => Promise.resolve({ message }))
      .mockImplementationOnce(() => Promise.resolve({ messages: [] }));
    const result = await replySupportThread({ status: 'idle' }, reply());
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('confirms a reply only after the owner sees the matching message', async () => {
    const result = await replySupportThread({ status: 'idle' }, reply());
    expect(result.status).toBe('ok');
    expect(revalidate).toHaveBeenCalledWith('/support');
  });

  it('rejects malformed thread ids before any network request', async () => {
    const result = await replySupportThread({ status: 'idle' }, form({ threadId: 'not-a-uuid', body: '문의 내용' }));
    expect(result.status).toBe('error');
    expect(read).not.toHaveBeenCalled();
  });
});
