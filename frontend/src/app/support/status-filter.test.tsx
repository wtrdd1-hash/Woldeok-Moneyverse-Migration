import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import SupportPage from './page';

const api = vi.fn(async (path: string) => {
  if (path.startsWith('/api/v1/support/threads?')) return { threads: [
    { thread_id: 'own-resolved', subject: '처리된 문의', status: 'resolved', created_at: '', last_message_at: '' },
  ] };
  if (path === '/api/v1/support/threads') return { threads: [] };
  if (path.endsWith('/messages')) return { messages: [] };
  throw new Error(`unexpected request: ${path}`);
});
vi.mock('@/lib/api', () => ({ api: (...args: unknown[]) => api(...args as [string]) }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));

describe('member support status filter web flow', () => {
  it('forwards the selected status and preserves it in thread links', async () => {
    api.mockClear();
    const markup = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ status: 'resolved' }) }));
    expect(api).toHaveBeenCalledWith('/api/v1/support/threads?status=resolved');
    expect(markup).toContain('name="status"');
    expect(markup).toContain('status=resolved');
    expect(markup).toContain('own-resolved');
  });

  it('does not fetch messages for a thread excluded by the active status filter', async () => {
    api.mockClear();
    await SupportPage({ searchParams: Promise.resolve({ status: 'resolved', thread: 'other-thread' }) });
    expect(api).not.toHaveBeenCalledWith('/api/v1/support/threads/other-thread/messages');
    expect(api).toHaveBeenCalledWith('/api/v1/support/threads/own-resolved/messages');
  });
});
