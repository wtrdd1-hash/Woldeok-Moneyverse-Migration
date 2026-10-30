import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { api } from '@/lib/api';
import SupportPage from './page';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));

beforeEach(() => vi.mocked(api).mockImplementation(async (path) => String(path).includes('/messages') ? { messages: [] } as never : { threads: [{
  thread_id: '11111111-1111-4111-8111-111111111111', subject: 'Support', status: 'resolved',
  created_at: '2026-10-30T10:00:00Z', last_message_at: '2026-10-30T10:00:00Z',
}] } as never));

describe('owner support date search UI', () => {
  it('shows accessible KST start/end inputs and preserves both filters in owner links', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({
      from: '2026-10-30', to: '2026-10-31', status: 'resolved',
    }) }));
    expect(html).toContain('name="from"');
    expect(html).toContain('name="to"');
    expect(html).toContain('type="date"');
    expect(html).toContain('2026-10-30');
    expect(html).toContain('2026-10-31');
    expect(html).toContain('최근 100건');
    expect(html).toContain('from=2026-10-30');
    expect(html).toContain('to=2026-10-31');
    expect(api).toHaveBeenCalledWith('/api/v1/support/threads?status=resolved&from=2026-10-30&to=2026-10-31');
  });
});
