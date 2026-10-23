import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => { throw new Error(`NEXT_REDIRECT:${path}`); }),
}));
vi.mock('@/lib/api', () => ({ api: vi.fn() }));

import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { createSupportThread, replySupportThread } from './actions';

const mockedApi = vi.mocked(api);
const key = '11111111-1111-4111-8111-111111111111';
const threadId = '22222222-2222-4222-8222-222222222222';

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) data.set(name, value);
  return data;
}

describe('member support durable submit receipts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.mockImplementation(async (path) => {
      if (path === '/api/v1/auth/session') return { csrfToken: 'csrf' } as never;
      if (path === '/api/v1/support/threads') return { thread: { thread_id: threadId } } as never;
      if (path === `/api/v1/support/threads/${threadId}/messages`)
        return { message: { message_id: '33333333-3333-4333-8333-333333333333' } } as never;
      throw new Error('Unexpected endpoint');
    });
  });

  it('forwards the same form idempotency key on retries and opens the actual created conversation', async () => {
    const data = form({ subject: 'Account issue', body: 'Please help', idempotencyKey: key });
    await expect(createSupportThread(data)).rejects.toThrow(`NEXT_REDIRECT:/support?thread=${threadId}`);
    await expect(createSupportThread(data)).rejects.toThrow(`NEXT_REDIRECT:/support?thread=${threadId}`);
    const writes = mockedApi.mock.calls.filter(([path]) => path === '/api/v1/support/threads');
    expect(writes).toHaveLength(2);
    for (const [, request] of writes) {
      expect(request).toMatchObject({
        method: 'POST',
        csrfToken: 'csrf',
        body: { subject: 'Account issue', body: 'Please help', idempotencyKey: key },
      });
    }
    expect(revalidatePath).toHaveBeenCalledWith('/support');
  });

  it('forwards the same reply key to the existing owner-scoped endpoint on retries', async () => {
    const data = form({ threadId, body: 'Any update?', idempotencyKey: key });
    await expect(replySupportThread(data)).rejects.toThrow(`NEXT_REDIRECT:/support?thread=${threadId}`);
    await expect(replySupportThread(data)).rejects.toThrow(`NEXT_REDIRECT:/support?thread=${threadId}`);
    const writes = mockedApi.mock.calls.filter(([path]) => path === `/api/v1/support/threads/${threadId}/messages`);
    expect(writes).toHaveLength(2);
    expect(writes[0]?.[1]).toMatchObject({ body: { body: 'Any update?', idempotencyKey: key } });
    expect(writes[1]?.[1]).toMatchObject({ body: { body: 'Any update?', idempotencyKey: key } });
  });

  it('rejects invalid or missing idempotency keys before requesting CSRF or writing data', async () => {
    for (const invalid of ['', 'not-a-uuid', '11111111-1111-1111-1111-111111111111']) {
      await expect(createSupportThread(form({ subject: 'Help', body: 'Details', idempotencyKey: invalid })))
        .rejects.toThrow('Invalid support submission');
      await expect(replySupportThread(form({ threadId, body: 'Reply', idempotencyKey: invalid })))
        .rejects.toThrow('Invalid support submission');
    }
    expect(mockedApi).not.toHaveBeenCalled();
  });

  it('rejects invalid thread identifiers before writing a reply', async () => {
    await expect(replySupportThread(form({ threadId: '../admin', body: 'Hello', idempotencyKey: key })))
      .rejects.toThrow('Invalid support submission');
    expect(mockedApi).not.toHaveBeenCalled();
  });

  it('does not redirect or report success when the backend rejects the write', async () => {
    mockedApi.mockRejectedValue(new Error('Service unavailable'));
    await expect(createSupportThread(form({ subject: 'Help', body: 'Details', idempotencyKey: key })))
      .rejects.toThrow('Service unavailable');
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('renders stable per-form keys and accessible support labels without indexing private threads', async () => {
    const { readFileSync } = await import('node:fs');
    const page = readFileSync('src/app/support/page.tsx', 'utf8');
    expect(page).toContain('randomUUID()');
    expect(page).toContain('name="idempotencyKey"');
    expect(page).toContain('name="threadId"');
    expect(page).toContain('aria-label="문의 제목"');
    expect(page).toContain('aria-label="문의 내용"');
    expect(page).toContain('aria-label="답장 내용"');
    expect(page).toContain('robots: { index: false, follow: false }');
  });
});
