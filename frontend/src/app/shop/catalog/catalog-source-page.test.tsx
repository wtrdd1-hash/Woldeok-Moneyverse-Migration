import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiOrNull, requireMember } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
vi.mock('./catalog-forms', () => ({
  BuyForm: () => (
    <button type="button" data-testid="verified-buy">
      구입하기
    </button>
  ),
  SettleUpkeepButton: () => (
    <button type="button" data-testid="verified-upkeep">
      관리비 내기
    </button>
  ),
  UseItemButton: () => (
    <button type="button" data-testid="verified-use">
      사용하기
    </button>
  ),
}));

import ShopCatalogPage, { metadata } from './page';

const item = {
  catalog_id: '11111111-1111-4111-8111-111111111111',
  code: 'test_item',
  name: 'Test verified item',
  description: 'Test',
  category: 'general',
  price: '9007199254740993',
  quantity: null,
  purchase_limit: 'unlimited',
  effect_kind: 'convenience',
  maintenance_cost: '0',
  sale_ends_at: null,
};
const holding = {
  catalog_id: item.catalog_id,
  code: item.code,
  name: item.name,
  quantity: 1,
  acquired_at: '2026-11-01T00:00:00.000Z',
  expires_at: null,
  effect_kind: 'convenience',
  durable: false,
  weekly_cost: '0',
  effect_expires_at: null,
  unpaid_weeks: 0,
  arrears_due: '0',
  arrears_cap: '0',
  suspended: false,
};

function reply(catalog: unknown, mine: unknown) {
  apiOrNull.mockImplementation(async (path: string) => {
    if (path === '/api/v1/shop/catalog') return catalog;
    if (path.startsWith('/api/v1/shop/holdings')) return mine;
    if (path === '/api/v1/early-game/today') return { event: null };
    throw new Error(`unexpected source: ${path}`);
  });
}

async function page(q?: unknown) {
  return renderToStaticMarkup(await ShopCatalogPage({ searchParams: Promise.resolve({ q }) }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('member shop real source page integration', () => {
  it('fails closed on a malformed catalogue without exposing purchase or fabricated empty state', async () => {
    reply({ catalogItems: { bad: 'shape' } }, { holdings: [] });
    const html = await page(['injected']);
    expect(requireMember).toHaveBeenCalledOnce();
    expect(html).toContain('상점 목록을 불러오지 못했어요');
    expect(html).not.toContain('verified-buy');
    expect(html).not.toContain('지금 판매 중인 아이템이 없어요');
    expect(html).toContain('다시 확인');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('does not offer purchases when ownership/arrears proof is malformed', async () => {
    reply({ catalogItems: [item] }, { holdings: [{ ...holding, suspended: 'false' }] });
    const html = await page('TEST');
    expect(html).toContain('Test verified item');
    expect(html).toContain('보유 상태 확인 후 구매 가능');
    expect(html).toContain('보유한 아이템을 불러오지 못했어요');
    expect(html).not.toContain('verified-buy');
    expect(html).not.toContain('verified-upkeep');
    expect(html).not.toContain('verified-use');
  });

  it('keeps existing real NestJS source purchase/holding controls for verified data', async () => {
    reply({ catalogItems: [item] }, { holdings: [holding] });
    const html = await page('test');
    expect(html).toContain('verified-buy');
    expect(html).toContain('verified-use');
    expect(html).toContain('Test verified item');
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/shop/catalog');
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/shop/holdings');
  });

  it('distinguishes genuinely empty verified lists from source failures', async () => {
    reply({ catalogItems: [] }, { holdings: [] });
    const html = await page();
    expect(html).toContain('지금 판매 중인 아이템이 없어요');
    expect(html).toContain('아직 보유한 아이템이 없어요');
    expect(html).not.toContain('상점 목록을 불러오지 못했어요');
  });
});
