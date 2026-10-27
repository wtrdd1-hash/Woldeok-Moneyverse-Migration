import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiMock, adminMock } = vi.hoisted(() => ({ apiMock: vi.fn(), adminMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: adminMock }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('./seo-client-view', () => ({
  SeoClientView: ({ initialData }: { initialData: { totalHits24h: number } }) =>
    <div data-testid="seo-verified">{initialData.totalHits24h} verified observations</div>,
}));
vi.mock('./seo-funnel-card', () => ({ SeoFunnelCard: () => <div>Funnel</div> }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header> }));
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

import AdminSeoPage, { metadata } from './page';

describe('admin SEO page authoritative data', () => {
  beforeEach(() => { vi.clearAllMocks(); adminMock.mockResolvedValue(undefined); });

  it('does not downgrade failed administrator authority to public fallback with fake live counters', async () => {
    apiMock.mockRejectedValue(new Error('admin status unavailable'));
    const html = renderToStaticMarkup(await AdminSeoPage());
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(apiMock).toHaveBeenCalledWith('/api/v1/seo/status/admin');
    expect(html).toContain('관리자 SEO 데이터를 불러올 수 없습니다');
    expect(html).not.toContain('seo-verified');
    expect(html).not.toContain('moneyverse-indexnow-key-2026');
  });

  it('rejects a malformed administrator response and shows accessible failure instead of zero observations', async () => {
    apiMock.mockResolvedValue({ totalHits24h: '123', recentLogs: [] });
    const html = renderToStaticMarkup(await AdminSeoPage());
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('seo-verified');
  });

  it('keeps the administrator dashboard noindexed', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
