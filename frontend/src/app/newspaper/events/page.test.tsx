import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import MarketEventsPage from './page';
import { apiOrNull } from '@/lib/api';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
const event = { id: '11111111-1111-4111-8111-111111111111', stock_id: null, symbol: null, name: null,
  direction: 'up', strength: 2, headline: 'Verified event', body: 'Evidence', source: 'operator',
  starts_at: '2026-11-01T00:00:00Z', ends_at: '2026-11-01T06:00:00Z' };

beforeEach(() => vi.mocked(apiOrNull).mockReset());
describe('market event direction page', () => {
  it('requests the backend filtered source and renders verified events', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({ events: [event] });
    const page = await MarketEventsPage({ searchParams: Promise.resolve({ direction: 'up' }) });
    const html = renderToStaticMarkup(page);
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/stocks/market-events?direction=up');
    expect(html).toContain('Verified event');
    expect(html).toContain('aria-current="page"');
  });
  it('distinguishes source failure from verified empty', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const failed = renderToStaticMarkup(await MarketEventsPage({ searchParams: Promise.resolve({ direction: 'down' }) }));
    expect(failed).toContain('검증할 수 없습니다');
    vi.mocked(apiOrNull).mockResolvedValue({ events: [] });
    const empty = renderToStaticMarkup(await MarketEventsPage({ searchParams: Promise.resolve({ direction: 'down' }) }));
    expect(empty).toContain('해당하는 진행 중인 이벤트가 없습니다');
  });
  it('rejects duplicate filters before backend access', async () => {
    const invalid = renderToStaticMarkup(await MarketEventsPage({ searchParams: Promise.resolve({ direction: ['up', 'down'] }) }));
    expect(invalid).toContain('잘못된 이벤트 필터');
    expect(apiOrNull).not.toHaveBeenCalled();
  });
});
