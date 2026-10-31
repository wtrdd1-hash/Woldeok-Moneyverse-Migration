import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const mocks = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.requireMember }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ children, title }: { children: React.ReactNode; title: React.ReactNode }) => <header><h1>{title}</h1>{children}</header> }));
vi.mock('@/components/translated-text', () => ({ TranslatedText: ({ korean }: { korean: string }) => korean }));

import MarketplacePage, { metadata } from './page';

async function html() { return renderToStaticMarkup(await MarketplacePage()); }

describe('marketplace verified source UI', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('never shows fake balance, initial listings or trading actions when upstream fails', async () => {
    mocks.apiOrNull.mockResolvedValue(null);
    const markup = await html();
    expect(mocks.requireMember).toHaveBeenCalledOnce();
    expect(mocks.apiOrNull).toHaveBeenCalledWith('/api/v1/marketplace/listings?limit=50');
    expect(markup).toContain('조회할 수 없습니다');
    expect(markup).not.toContain('1,000 WLD');
    expect(markup).not.toContain('구매하기');
    expect(markup).not.toContain('>거래 완료<');
    expect(markup).not.toContain('시장 규모');
  });

  it('shows verified empty state, not an outage or invented market activity', async () => {
    mocks.apiOrNull.mockResolvedValue([]);
    const markup = await html();
    expect(markup).toContain('확인된 활성 매물이 없습니다');
    expect(markup).not.toContain('조회할 수 없습니다');
  });

  it('renders real listings as read-only and keeps the member page non-indexable', async () => {
    mocks.apiOrNull.mockResolvedValue([{
      id: '11111111-1111-4111-8111-111111111111',
      item_name: 'Actual item', quantity: 1, price_wld: '200', status: 'ACTIVE',
      created_at: '2026-10-30T09:00:00.000Z',
    }]);
    const markup = await html();
    expect(markup).toContain('Actual item');
    expect(markup).toContain('200');
    expect(markup).not.toContain('구매하기');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
