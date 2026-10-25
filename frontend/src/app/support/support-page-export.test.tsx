import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const { api, requireMember } = vi.hoisted(() => ({ api: vi.fn(), requireMember: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/session', () => ({ requireMember }));
import SupportPage, { metadata } from './page';

const thread = '22222222-2222-4222-8222-222222222222';

describe('member support export accessibility and SEO', () => {
  beforeEach(() => { vi.resetAllMocks(); api.mockImplementation(async (path: string) => path.endsWith('/messages') ? { messages: [] } : { threads: [{ thread_id: thread, subject: 'Hello', status: 'open', created_at: '', last_message_at: '' }] }); });
  it('is private and provides a keyboard-accessible CSV link with bounded notice', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ thread }) }));
    expect(requireMember).toHaveBeenCalledOnce();
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(html).toContain(`/support/threads/${thread}/export`);
    expect(html).toContain('min-h-11');
    expect(html).toContain('aria-describedby="support-export-limit"');
    expect(html).toContain('500개');
  });
});
