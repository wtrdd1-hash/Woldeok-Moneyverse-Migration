import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => {}) }));
vi.mock('@/lib/money', () => ({
  groupDigits: (amount: string) => amount,
  formatMoment: (at: string) => at.slice(0, 10),
}));

import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import MarketplacePage, { metadata } from './page';

const listing = {
  id: '11111111-1111-4111-8111-111111111111',
  seller_id: '22222222-2222-4222-8222-222222222222',
  item_name: '검증된 매물',
  item_code: 'verified',
  category: 'cosmetic',
  rarity: 'COMMON',
  quantity: 1,
  price_wld: '999.0000',
  status: 'ACTIVE',
  description: '',
  created_at: '2026-10-24T10:00:00.000Z',
};

describe('marketplace authenticated server-rendered read-only flow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows verified listing and actual wallet/holdings but no settlement control', async () => {
    vi.mocked(apiOrNull).mockImplementation(async (path) => {
      if (path.startsWith('/api/v1/wallet?')) return { balances: { cash: { availableAmount: '42' } } };
      if (path === '/api/v1/shop/holdings') return { holdings: [] };
      if (path.startsWith('/api/v1/marketplace/listings')) return [listing];
      return null;
    });
    const html = renderToStaticMarkup(await MarketplacePage());
    if (process.env.MV_C_BROWSER_FIXTURE) {
      writeFileSync(process.env.MV_C_BROWSER_FIXTURE, `<!doctype html><html lang="ko"><head><meta name="robots" content="noindex,nofollow"></head><body>${html}</body></html>`);
    }
    expect(requireMember).toHaveBeenCalledOnce();
    expect(html).toContain('검증된 매물');
    expect(html).toContain('42');
    expect(html).toContain('999');
    expect(html).toContain('거래 검증 대기');
    expect(html).not.toContain('구매 확정');
    expect(html).not.toContain('구매 완료');
    expect(html).not.toContain('1,000 WLD');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('keeps API failure distinct from genuinely empty listings and balance zero', async () => {
    vi.mocked(apiOrNull).mockImplementation(async (path) => {
      if (path.startsWith('/api/v1/wallet?')) return null;
      if (path === '/api/v1/shop/holdings') return null;
      if (path.startsWith('/api/v1/marketplace/listings')) return null;
      return null;
    });
    const failed = renderToStaticMarkup(await MarketplacePage());
    expect(failed).toContain('지갑 조회에 실패했습니다');
    expect(failed).toContain('보유 목록 조회에 실패했습니다');
    expect(failed).toContain('실제 매물 정보를 불러오지 못했어요.');
    expect(failed).not.toContain('현재 확인된 매물이 없습니다.');

    vi.mocked(apiOrNull).mockImplementation(async (path) => {
      if (path.startsWith('/api/v1/wallet?')) return { balances: { cash: { availableAmount: '0' } } };
      if (path === '/api/v1/shop/holdings') return { holdings: [] };
      if (path.startsWith('/api/v1/marketplace/listings')) return [];
      return null;
    });
    const empty = renderToStaticMarkup(await MarketplacePage());
    expect(empty).toContain('0 WLD');
    expect(empty).toContain('현재 확인된 매물이 없습니다.');
    expect(empty).not.toContain('실제 매물 정보를 불러오지 못했어요.');
  });
});
