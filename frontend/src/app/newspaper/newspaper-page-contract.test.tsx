import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import NewspaperPage from './page';
import { NewspaperView } from './newspaper-view';
import { apiOrNull } from '@/lib/api';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/seo', () => ({ canonicalUrl: (path: string) => path }));
vi.mock('./newspaper-view', () => ({ NewspaperView: vi.fn(() => <div>Market evidence view</div>) }));

beforeEach(() => { vi.mocked(apiOrNull).mockReset(); vi.mocked(NewspaperView).mockClear(); });

describe('newspaper backend integration contract', () => {
  it('uses real Nest stock endpoints and preserves unavailable source state', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    renderToStaticMarkup(await NewspaperPage());
    expect(vi.mocked(apiOrNull).mock.calls.map(([path]) => path)).toEqual([
      '/api/v1/stocks/market-events', '/api/v1/stocks', '/api/v1/newspaper/weekly-brief',
    ]);
    expect(vi.mocked(NewspaperView).mock.calls[0]?.[0]).toMatchObject({
      events: [], stocks: [], eventsAvailable: false, stocksAvailable: false,
    });
  });

  it('rejects malformed 200 stock prices while retaining valid empty event evidence', async () => {
    vi.mocked(apiOrNull)
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ stocks: [{ id: 'bad', symbol: 'WDT', name: 'Fake', current_price: 'NaN', day_open_price: '100' }] })
      .mockResolvedValueOnce(null);
    renderToStaticMarkup(await NewspaperPage());
    expect(vi.mocked(NewspaperView).mock.calls[0]?.[0]).toMatchObject({
      events: [], stocks: [], eventsAvailable: true, stocksAvailable: false,
    });
  });
});
