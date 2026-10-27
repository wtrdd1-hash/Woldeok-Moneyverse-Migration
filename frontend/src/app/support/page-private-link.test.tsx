import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';

const apiMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => ({})) }));
vi.mock('./actions', () => ({ createSupportThread: vi.fn(), replySupportThread: vi.fn() }));

import SupportPage from './page';

const owned = '11111111-1111-4111-8111-111111111111';
const foreign = '22222222-2222-4222-8222-222222222222';

beforeEach(() => apiMock.mockReset());

describe('support private deep-link integration', () => {
  it('does not request foreign or deleted conversation messages from the private API', async () => {
    apiMock.mockImplementation(async (path: string) => path === '/api/v1/support/threads'
      ? { threads: [{ thread_id: owned, subject: 'My thread', status: 'open' }] }
      : { messages: [] });
    const page = await SupportPage({ searchParams: Promise.resolve({ thread: foreign }) });
    expect(apiMock.mock.calls.map(([path]) => path)).toEqual([
      '/api/v1/support/threads', `/api/v1/support/threads/${owned}/messages`,
    ]);
    const firstSection = (page.props.children as ReactElement[])[0]!;
    const notice = (firstSection.props as { children: ReactElement[] }).children[0]!;
    expect((notice.props as { children: string }).children).toContain('요청한 문의를 확인할 수 없어');
  });

  it('does not query messages when the member has no owned threads', async () => {
    apiMock.mockResolvedValue({ threads: [] });
    await SupportPage({ searchParams: Promise.resolve({ thread: foreign }) });
    expect(apiMock).toHaveBeenCalledOnce();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/support/threads');
  });
});
