import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { api } from '@/lib/api';
import SupportPage from './page';
vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));
const THREAD = '11111111-1111-4111-8111-111111111111';
beforeEach(() => {
  vi.mocked(api).mockReset();
  vi.mocked(api).mockImplementation(async path => {
    if (String(path).includes('/messages')) return { messages: [] } as never;
    if (String(path).includes('/summary')) return null as never;
    return { threads: [{ thread_id: THREAD, subject: '환불', status: 'open', created_at: '', last_message_at: '' }] } as never;
  });
});
describe('owner support message keyword search UI', () => {
  it('submits a labelled search within selected conversation and retains filters', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ thread: THREAD, status: 'open', messageQ: '환불 %_' }) }));
    expect(html).toContain('name="messageQ"');
    expect(html).toContain('value="환불 %_"');
    expect(html).toContain('처음 최대 200개');
    expect(api).toHaveBeenCalledWith(`/api/v1/support/threads/${THREAD}/messages?q=%ED%99%98%EB%B6%88+%25_`);
    expect(html).toContain('name="status"');
  });
  it('fails closed when the backend returns unrelated private messages for a keyword', async () => {
    vi.mocked(api).mockImplementation(async path => {
      if (String(path).includes('/messages')) return { messages: [
        { message_id: THREAD, sender_kind: 'user', body: '다른 내용', created_at: '2026-10-31T00:00:00Z' },
      ] } as never;
      if (String(path).includes('/summary')) return null as never;
      return { threads: [{ thread_id: THREAD, subject: '환불', status: 'open', created_at: '', last_message_at: '' }] } as never;
    });
    await expect(SupportPage({ searchParams: Promise.resolve({ messageQ: '환불' }) })).rejects.toThrow('unavailable');
  });
  it('does not search messages of a thread missing from the owner thread list', async () => {
    vi.mocked(api).mockImplementation(async () => ({ threads: [] }) as never);
    await SupportPage({ searchParams: Promise.resolve({ thread: THREAD, messageQ: '환불' }) });
    expect(vi.mocked(api).mock.calls.some(([path]) => String(path).includes('/messages'))).toBe(false);
  });
});
