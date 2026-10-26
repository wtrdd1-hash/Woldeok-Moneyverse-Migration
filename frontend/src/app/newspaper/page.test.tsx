import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiOrNull } from '@/lib/api';
import NewspaperPage from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/seo', () => ({ canonicalUrl: (path: string) => path }));
vi.mock('./newspaper-view', () => ({ NewspaperView: () => null }));

const mockedApi = vi.mocked(apiOrNull);
const validData = {
  balanceSnapshotWld: '9876543210123456789',
  source: 'user_cash_and_bank_balances',
  asOf: '2026-10-26T02:45:00.000Z',
};

beforeEach(() => {
  mockedApi.mockReset();
});

describe('public newspaper page server integration', () => {
  it('passes unwrapped and validated NestJS snapshot to the view', async () => {
    mockedApi.mockImplementation(async (path) => path === '/api/v1/newspaper/weekly-brief'
      ? { success: true, data: validData }
      : { events: [], stocks: [] });
    const page = await NewspaperPage();
    expect(page.props.weeklyBrief).toEqual(validData);
    expect(mockedApi).toHaveBeenCalledWith('/api/v1/newspaper/weekly-brief');
  });

  it('does not pass fictional data when the API is unavailable or malformed', async () => {
    mockedApi.mockResolvedValue(null);
    expect((await NewspaperPage()).props.weeklyBrief).toBeUndefined();
    mockedApi.mockResolvedValue({ success: true, data: { m0Supply: 12450000 } });
    expect((await NewspaperPage()).props.weeklyBrief).toBeUndefined();
  });
});
