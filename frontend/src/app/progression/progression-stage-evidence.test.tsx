import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull, api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember }));

vi.mock('./progression-forms', () => ({ RefreshButton: () => null, LoanBoard: () => null }));

import ProgressionPage, { metadata } from './page';

beforeEach(() => {
  vi.clearAllMocks();
  apiOrNull.mockResolvedValue(null);
});

describe('owner progression stage source-integrity UI', () => {
  it('requires the current member, keeps noindex, and offers a keyboard-accessible retry on malformed source', async () => {
    apiOrNull.mockImplementation(async (path: string) =>
      path === '/api/v1/progression'
        ? { progression: { stage_code: 'starter', reached_at: null } }
        : null,
    );
    const html = renderToStaticMarkup(await ProgressionPage());
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/progression');
    expect(html).toContain('성장 단계를 불러오지 못했어요');
    expect(html).toContain('성장 단계 다시 조회');
    expect(html).toContain('href="/progression"');
    expect(html).not.toContain('현재: 첫걸음');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('shows uncomputed only when the authenticated source explicitly returns null', async () => {
    apiOrNull.mockImplementation(async (path: string) =>
      path === '/api/v1/progression' ? { progression: null } : null,
    );
    const html = renderToStaticMarkup(await ProgressionPage());
    expect(html).toContain('아직 성장 단계가 계산되지 않았어요');
    expect(html).not.toContain('성장 단계를 불러오지 못했어요');
  });
});
