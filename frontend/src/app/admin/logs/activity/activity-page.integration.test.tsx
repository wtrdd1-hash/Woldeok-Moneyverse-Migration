import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  apiOrNull: vi.fn(),
  requireAdminConsole: vi.fn(),
}));
vi.mock('@/lib/api', () => ({
  api: mocks.api,
  apiOrNull: mocks.apiOrNull,
  ApiError: class ApiError extends Error { status = 403; },
}));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.requireAdminConsole }));
import Page from './page';

const alice = '850e7583-6589-4371-bffd-e76c3e9f8d31';
const bob = '999488db-d28e-4a53-9a10-7dca4eeabd1a';
const members = [
  { user_id: alice, display_name: 'Alice' },
  { user_id: bob, display_name: 'Alicia' },
];

async function visit(params: Record<string, string> = {}) {
  const element = await Page({ searchParams: Promise.resolve(params) });
  return renderToStaticMarkup(element);
}

describe('admin activity UI-to-authenticated-API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.apiOrNull.mockImplementation(async (path: string) => path.endsWith('/admin/users') ? { users: members } : null);
    mocks.api.mockResolvedValue([]);
  });
  it('resolves a nickname to a UUID before issuing the backend request and preserves pagination', async () => {
    const html = await visit({ userId: 'Alice', limit: '30', page: '2', eventType: 'page_view' });
    expect(mocks.requireAdminConsole).toHaveBeenCalledWith('/admin/logs/activity');
    expect(mocks.api).toHaveBeenCalledWith(expect.stringContaining(`userId=${alice}`));
    expect(mocks.api).toHaveBeenCalledWith(expect.stringContaining('offset=30'));
    expect(mocks.api).toHaveBeenCalledWith(expect.stringContaining('eventType=page_view'));
    expect(html).toContain('Alice');
  });
  it('never falls back to unfiltered logs for ambiguous nickname', async () => {
    const html = await visit({ userId: 'ali' });
    expect(mocks.api).not.toHaveBeenCalled();
    expect(html).toContain('여러 회원');
  });
  it('never falls back to unfiltered logs when member lookup is unavailable', async () => {
    mocks.apiOrNull.mockResolvedValue(null);
    const html = await visit({ userId: 'Alice' });
    expect(mocks.api).not.toHaveBeenCalled();
    expect(html).toContain('회원 목록');
  });
  it('can filter a known UUID even if member lookup is unavailable', async () => {
    mocks.apiOrNull.mockResolvedValue(null);
    await visit({ userId: alice });
    expect(mocks.api).toHaveBeenCalledWith(expect.stringContaining(`userId=${alice}`));
  });
  it('rejects malformed backend rows rather than reporting zero real events', async () => {
    mocks.api.mockResolvedValue({ logs: [] });
    const html = await visit();
    expect(html).toContain('활동 로그 조회 실패');
    expect(html).not.toContain('기록된 활동 로그가 없습니다');
  });
  it('does not broaden a rejected event type into all activity', async () => {
    const html = await visit({ eventType: 'unexpected' });
    expect(mocks.api).not.toHaveBeenCalled();
    expect(html).toContain('허용되지 않은 이벤트');
  });
  it('normalizes invalid pagination before calling the database API', async () => {
    await visit({ page: '1e99', limit: '1000000' });
    expect(mocks.api).toHaveBeenCalledWith(expect.stringContaining('limit=50&offset=0'));
  });
});
