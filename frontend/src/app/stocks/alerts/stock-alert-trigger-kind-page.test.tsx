import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiOrNull } from '@/lib/api';
import StockAlertsPage from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'ko') }));
vi.mock('./alert-manager', () => ({ AlertManager: ({ events }: { events: unknown[] }) => <div>Verified events: {events.length}</div> }));

beforeEach(() => {
  vi.mocked(apiOrNull).mockReset();
  vi.mocked(apiOrNull).mockImplementation(async (path) => {
    if (String(path).includes('/events')) return { events: [] } as never;
    if (String(path).endsWith('/alerts')) return { alerts: [] } as never;
    return { stocks: [] } as never;
  });
});

describe('member stock alert trigger category UI', () => {
  it('selects price triggers only from latest 30, with accessible GET form', async () => {
    const html = renderToStaticMarkup(await StockAlertsPage({ searchParams: Promise.resolve({ kind: 'price' }) }));
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/stocks/alerts/events?limit=30&kind=price');
    expect(html).toContain('name="kind"');
    expect(html).toContain('value="price" selected=""');
    expect(html).toContain('최근 30건');
    expect(html).toContain('Verified events: 0');
  });
  it('uses the unfiltered legacy owner path by default', async () => {
    await StockAlertsPage({ searchParams: Promise.resolve({}) });
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/stocks/alerts/events?limit=30');
  });
});
