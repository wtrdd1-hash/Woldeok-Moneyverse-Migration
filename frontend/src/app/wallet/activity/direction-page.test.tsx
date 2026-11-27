import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull, requireMember } = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
// Korean copy is asserted, so the request locale is Korean.
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
import WalletActivityPage, { generateMetadata } from './page';

beforeEach(() => { vi.clearAllMocks(); apiOrNull.mockResolvedValue({ transactions: [], hasMore: false, nextCursor: null, asOf: '2026-10-28T00:00:00.000Z' }); });
describe('wallet activity direction UI', () => {
  it('renders accessible direction navigation, owner auth and private SEO with preserved period', async () => {
    const html = renderToStaticMarkup(await WalletActivityPage({ searchParams: Promise.resolve({ period: '30d', direction: 'out' }) }));
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/wallet/activity?period=30d&direction=out');
    expect(html).toContain('aria-label="지갑 기록 입출금 방향"');
    expect(html).toContain('href="/wallet/activity?period=30d&amp;direction=in"');
    expect(html).toContain('aria-current="page"');
    expect((await generateMetadata()).robots).toEqual({ index: false, follow: false });
  });
  it('never echoes malformed query values to the owner API', async () => {
    await WalletActivityPage({ searchParams: Promise.resolve({ period: '30d&evil=1', direction: 'out&evil=1' }) });
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/wallet/activity?period=all&direction=all');
  });
});
