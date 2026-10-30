import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { api } from '@/lib/api';
import SupportPage from './page';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));

beforeEach(() => {
  vi.mocked(api).mockReset();
  vi.mocked(api).mockImplementation(async (path) => String(path).includes('/messages')
    ? { messages: [] } as never : { threads: [{ thread_id: '11111111-1111-4111-8111-111111111111', subject: '문의', status: 'resolved', created_at: '', last_message_at: '' }] } as never);
});

describe('member support order UI', () => {
  it('preserves owner status and literal search while selecting oldest within recent 100', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ status: 'resolved', q: '결제', sort: 'oldest' }) }));
    expect(html).toContain('name="sort"');
    expect(html).toContain('value="oldest" selected=""');
    expect(html).toContain('최근 100건');
    expect(html).toContain('sort=oldest');
    expect(api).toHaveBeenCalledWith('/api/v1/support/threads?status=resolved&q=%EA%B2%B0%EC%A0%9C&sort=oldest', expect.anything());
  });
});
