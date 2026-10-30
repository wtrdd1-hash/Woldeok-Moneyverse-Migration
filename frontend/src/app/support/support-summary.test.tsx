import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import SupportPage from './page';

const api = vi.fn(async (path: string) => {
  if (path === '/api/v1/support/threads/summary') return {
    open: 2, waitingUser: 1, resolved: 3, scanned: 6, mayBeIncomplete: false,
  };
  if (path === '/api/v1/support/threads') return { threads: [] };
  throw new Error('unexpected API request');
});
vi.mock('@/lib/api', () => ({ api: (...args: unknown[]) => api(...args as [string]) }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));

describe('support owner status summary', () => {
  it('renders server-confirmed bounded counts and never labels them as all-time totals', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({}) }));
    expect(api).toHaveBeenCalledWith('/api/v1/support/threads/summary');
    expect(html).toContain('최근 최대 100건');
    expect(html).toContain('관리자 답변 대기');
    expect(html).toContain('내 답변 대기');
    expect(html).toContain('처리 완료');
    expect(html).toContain('2건');
    expect(html).toContain('1건');
    expect(html).toContain('3건');
  });
});
