import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const { read } = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => ({})) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'ko') }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('./alert-manager', () => ({ AlertManager: ({ stocks, alerts, events, initialStockId }: {
  stocks: unknown[]; alerts: unknown[]; events: unknown[]; initialStockId?: string;
}) => <div data-testid="verified-alert-manager" data-stocks={stocks.length} data-alerts={alerts.length}
  data-events={events.length} data-selected={initialStockId ?? ''} /> }));
import StockAlertsPage from './page';
const stockId = '4b2c3f54-12c3-48b1-83a4-1ddc941ddc8d';
const render = async () => renderToStaticMarkup(await StockAlertsPage({ searchParams: Promise.resolve({ stock: 'WDG' }) }));
beforeEach(() => { vi.clearAllMocks(); });
describe('stock alerts real page owner source integration', () => {
  it('shows an accessible retry and blocks write controls when an upstream response is malformed', async () => {
    read.mockResolvedValueOnce({ stocks: [{ id: stockId, symbol: 'WDG', name: 'Virtual Stock' }] })
      .mockResolvedValueOnce({ alerts: 'not-an-array' }).mockResolvedValueOnce({ events: [] });
    const html = await render();
    expect(html).toContain('role="alert"');
    expect(html).toContain('다시 조회');
    expect(html).toContain('알림이 0개라는 뜻이 아닙니다');
    expect(html).not.toContain('data-testid="verified-alert-manager"');
  });
  it('renders verified empty lists without treating them as a source error', async () => {
    read.mockResolvedValueOnce({ stocks: [] }).mockResolvedValueOnce({ alerts: [] }).mockResolvedValueOnce({ events: [] });
    const html = await render();
    expect(html).toContain('data-testid="verified-alert-manager"');
    expect(html).toContain('data-alerts="0"');
    expect(html).not.toContain('다시 조회');
  });
  it('preserves the verified stock deeplink for the member alert form', async () => {
    read.mockResolvedValueOnce({ stocks: [{ id: stockId, symbol: 'WDG', name: 'Virtual Stock' }] })
      .mockResolvedValueOnce({ alerts: [] }).mockResolvedValueOnce({ events: [] });
    const html = await render();
    expect(html).toContain(`data-selected="${stockId}"`);
    expect(read).toHaveBeenCalledTimes(3);
  });
});
