import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewspaperPage, { metadata } from './page';
import { apiOrNull } from '@/lib/api';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/seo', () => ({ canonicalUrl: (path: string) => `https://example.invalid${path}` }));

const mockApi = vi.mocked(apiOrNull);

beforeEach(() => mockApi.mockReset());

describe('NewspaperPage verified market event source', () => {
  it('preserves public SEO indexing for verified market news', () => {
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it('marks a failed event API unavailable instead of reporting zero events', async () => {
    mockApi.mockResolvedValue(null);

    const element = await NewspaperPage();
    expect(mockApi).toHaveBeenCalledWith('/api/v1/stocks/market-events');
    expect(element.props.events).toEqual([]);
    expect(element.props.eventsUnavailable).toBe(true);
  });

  it('preserves an authoritative empty event response without treating it as an error', async () => {
    mockApi.mockImplementation(async (path) => path === '/api/v1/stocks/market-events' ? { events: [] } : null);

    const element = await NewspaperPage();
    expect(element.props.events).toEqual([]);
    expect(element.props.eventsUnavailable).toBe(false);
  });
});
