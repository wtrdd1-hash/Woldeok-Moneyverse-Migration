import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, directoryMock, gateMock } = vi.hoisted(() => ({
  apiMock: vi.fn(), directoryMock: vi.fn(), gateMock: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gateMock }));
vi.mock('@/lib/api', () => ({
  api: apiMock, apiOrNull: directoryMock,
  ApiError: class ApiError extends Error { constructor(readonly status: number) { super('API error'); } },
}));
import AdminLogsPage from './page';

const A = 'c091eab0-a4bc-4f2a-b8a8-16b5d2e5a099';
const B = '8c4b26a8-b27a-4cb2-8c9d-1669f3c4a003';
const directory = (hasMore = false) => ({
  users: [{ user_id: A, display_name: 'Alice', status: 'active' }, { user_id: B, display_name: 'ALICE', status: 'active' }],
  scope: { kind: 'WEALTH_ORDERED_SNAPSHOT', limit: 50, hasMore },
});
const page = (params: Record<string, string | string[] | undefined>) => AdminLogsPage({ searchParams: Promise.resolve(params) });

beforeEach(() => {
  vi.clearAllMocks();
  directoryMock.mockResolvedValue(directory());
  apiMock.mockResolvedValue({ events: [], nextCursor: null });
});

describe('admin audit search server-to-PostgreSQL contract', () => {
  it('denies ambiguous nickname instead of searching a first matching member', async () => {
    const result = await page({ member: 'alice' });
    expect(apiMock).not.toHaveBeenCalled();
    expect(renderToStaticMarkup(result)).toContain('여러 회원과 일치');
  });
  it('denies truncated nickname even if one displayed member matches', async () => {
    directoryMock.mockResolvedValue(directory(true));
    const result = await page({ administrator: 'Alice' });
    expect(apiMock).not.toHaveBeenCalled();
    expect(renderToStaticMarkup(result)).toContain('제한된 회원 목록');
  });
  it('allows UUID directly when the directory endpoint is unavailable', async () => {
    directoryMock.mockResolvedValue(null);
    await page({ member: A });
    expect(gateMock).toHaveBeenCalledWith('/admin/logs');
    expect(apiMock).toHaveBeenCalledExactlyOnceWith(`/api/v1/admin/audit/events?member=${A}&limit=30`);
  });
  it('blocks duplicate query parameters instead of silently dropping a filter', async () => {
    const result = await page({ member: [A, B] });
    expect(apiMock).not.toHaveBeenCalled();
    expect(renderToStaticMarkup(result)).toContain('중복된 검색 조건');
  });
  it('blocks invalid cursor rather than silently returning page one', async () => {
    const result = await page({ cursor: '0' });
    expect(apiMock).not.toHaveBeenCalled();
    expect(renderToStaticMarkup(result)).toContain('페이지 순서가 올바르지');
  });
  it('refuses malformed backend audit evidence rather than showing a verified empty result', async () => {
    apiMock.mockResolvedValue({ events: [{ sequence: '10' }], nextCursor: '10' });
    const result = await page({ member: A });
    expect(apiMock).toHaveBeenCalledOnce();
    expect(renderToStaticMarkup(result)).toContain('원장 항목이나 페이지 순서를 검증하지 못했습니다');
  });
});
