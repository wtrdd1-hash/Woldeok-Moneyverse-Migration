import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiMock, adminMock } = vi.hoisted(() => ({ apiMock: vi.fn(), adminMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: adminMock }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header> }));
vi.mock('../admin-back', () => ({ AdminBack: () => <div>Back</div> }));
vi.mock('./analytics-client-view', () => ({
  AnalyticsClientView: ({ seoData, apiDomains, usersAvailable }: {
    seoData: unknown; apiDomains: unknown; usersAvailable: boolean;
  }) => <div data-testid="analytics-evidence">{seoData ? 'SEO_VERIFIED' : 'SEO_UNAVAILABLE'}
    {apiDomains ? 'API_VERIFIED' : 'API_UNAVAILABLE'}{usersAvailable ? 'USERS_AVAILABLE' : 'USERS_UNAVAILABLE'}</div>,
}));
import AdminAnalyticsPage, { metadata } from './page';

describe('admin analytics API evidence wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMock.mockResolvedValue(undefined);
    apiMock.mockResolvedValue(null);
  });

  it('requires the admin gate and queries authenticated backend evidence, not a public direct fetch', async () => {
    const html = renderToStaticMarkup(await AdminAnalyticsPage());
    expect(adminMock).toHaveBeenCalledWith('/admin/analytics');
    expect(apiMock).toHaveBeenCalledWith('/api/v1/seo/status/admin');
    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/api-health/status');
    expect(html).toContain('SEO_UNAVAILABLE');
    expect(html).toContain('API_UNAVAILABLE');
    expect(html).toContain('USERS_UNAVAILABLE');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('does not accept a malformed route status as live telemetry', async () => {
    apiMock.mockImplementation(async (path: string) => path.endsWith('api-health/status')
      ? { serverTime: new Date().toISOString(), totalDomains: 1, totalEndpoints: 1,
          domains: [{ id: 'auth', name: '인증', endpointCount: 1, measurementSource: 'NOT_MEASURED',
            measuredAt: null, latencyMs: 12, successRate: 100, status: 'OPERATIONAL' }] }
      : null);
    const html = renderToStaticMarkup(await AdminAnalyticsPage());
    expect(html).toContain('API_UNAVAILABLE');
  });
});
