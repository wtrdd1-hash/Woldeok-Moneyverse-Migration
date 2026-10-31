import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiOrNull, requireMember } = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireMember: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('./alert-manager', () => ({
  AlertManager: ({ alerts }: { alerts: readonly unknown[] }) => <div data-testid="verified-alert-manager">{alerts.length} verified alerts</div>,
}));

import StockAlertsPage from './page';

async function html() {
  return renderToStaticMarkup(await StockAlertsPage({ searchParams: Promise.resolve({}) }));
}

describe('stock alerts member server page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    requireMember.mockResolvedValue(undefined);
  });

  it('fails closed on malformed 200 response, with a keyboard retry and no form', async () => {
    apiOrNull.mockResolvedValueOnce({ stocks: [] })
      .mockResolvedValueOnce({ alerts: [{ alert_id: 'invalid' }] })
      .mockResolvedValueOnce({ events: [] });
    const page = await html();
    expect(requireMember).toHaveBeenCalledOnce();
    expect(page).toContain('role="alert"');
    expect(page).toContain('알림 다시 조회');
    expect(page).toContain('href="/stocks/alerts"');
    expect(page).not.toContain('verified-alert-manager');
  });

  it('renders verified empty lists without inventing existing rules', async () => {
    apiOrNull.mockResolvedValueOnce({ stocks: [] })
      .mockResolvedValueOnce({ alerts: [] })
      .mockResolvedValueOnce({ events: [] });
    const page = await html();
    expect(page).toContain('data-testid="verified-alert-manager"');
    expect(page).toContain('0 verified alerts');
    expect(page).not.toContain('role="alert"');
  });

  it('does not render a stale alert manager when an upstream request fails', async () => {
    apiOrNull.mockResolvedValueOnce(null).mockResolvedValueOnce({ alerts: [] }).mockResolvedValueOnce({ events: [] });
    const page = await html();
    expect(page).toContain('role="alert"');
    expect(page).not.toContain('verified-alert-manager');
  });
});
