import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { api } from '@/lib/api';
import SupportPage, { metadata } from './page';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));

const THREADS = [
  { thread_id: '11111111-1111-4111-8111-111111111111', subject: '결제 문의', status: 'open', created_at: '', last_message_at: '' },
  { thread_id: '22222222-2222-4222-8222-222222222222', subject: '일반 문의', status: 'resolved', created_at: '', last_message_at: '' },
];

beforeEach(() => {
  vi.mocked(api).mockReset();
  vi.mocked(api).mockImplementation(async (path) => {
    if (String(path).includes('/messages')) return { messages: [] } as never;
    return { threads: THREADS } as never;
  });
});

describe('member support recent-subject search UI', () => {
  it('keeps authenticated support history out of search indexes', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('submits a GET search, preserves q in links and discloses the latest-100 limit', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ q: '결제' }) }));
    expect(html).toContain('name="q"');
    expect((html.match(/min-h-11/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('value="결제"');
    expect(html).toContain('최근 100건');
    expect(html).toContain('q=%EA%B2%B0%EC%A0%9C');
    expect(api).toHaveBeenCalledWith('/api/v1/support/threads?q=%EA%B2%B0%EC%A0%9C', expect.anything());
  });

  it('does not fetch a hidden/foreign selected thread when filtered results exclude it', async () => {
    vi.mocked(api).mockImplementation(async () => ({ threads: [] }) as never);
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ q: '없는 문의', thread: '33333333-3333-4333-8333-333333333333' }) }));
    expect(html).toContain('검색 결과가 없습니다');
    expect(vi.mocked(api).mock.calls.some(([path]) => String(path).includes('/messages'))).toBe(false);
  });
  it('combines status with literal search and preserves both filters in conversation links', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ status: 'resolved', q: '100%_' }) }));
    expect(api).toHaveBeenCalledWith('/api/v1/support/threads?status=resolved&q=100%25_', expect.anything());
    expect(html).toContain('status=resolved');
    expect(html).toContain('q=100%25_');
  });

});
