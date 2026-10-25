import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { parseMarketplaceAskingSnapshot } from './verified-asking-snapshot';
import { VerifiedAskingSnapshot } from './verified-asking-snapshot-view';

const valid = (price_wld: string, id = '11111111-1111-4111-8111-111111111111') => ({
  id,
  status: 'ACTIVE',
  price_wld,
  quantity: 1,
  created_at: '2026-10-26T00:00:00.000Z',
});

describe('verified marketplace asking-price snapshot', () => {
  it('distinguishes verified zero active listings from unavailable or malformed data', () => {
    expect(parseMarketplaceAskingSnapshot([])).toEqual({
      count: 0, minPriceWld: null, maxPriceWld: null, limited: false,
    });
    expect(parseMarketplaceAskingSnapshot(null)).toBeNull();
    expect(parseMarketplaceAskingSnapshot({ listings: [] })).toBeNull();
    expect(parseMarketplaceAskingSnapshot([valid('100'), { ...valid('200'), status: 'SETTLED' }])).toBeNull();
    expect(parseMarketplaceAskingSnapshot([valid('-1')])).toBeNull();
    expect(parseMarketplaceAskingSnapshot([valid('0')])).toBeNull();
    expect(parseMarketplaceAskingSnapshot([valid('1.00001')])).toBeNull();
    expect(parseMarketplaceAskingSnapshot([valid('NaN')])).toBeNull();
    expect(parseMarketplaceAskingSnapshot([{ ...valid('10'), quantity: 0 }])).toBeNull();
    expect(parseMarketplaceAskingSnapshot([{ ...valid('10'), id: 'not-a-uuid' }])).toBeNull();
    expect(parseMarketplaceAskingSnapshot([valid('10'), valid('11')])).toBeNull();
    expect(parseMarketplaceAskingSnapshot([{ ...valid('10'), created_at: 'invalid' }])).toBeNull();
  });

  it('uses exact decimal WLD strings rather than floating point for min/max', () => {
    expect(parseMarketplaceAskingSnapshot([
      valid('9007199254740991.0001'),
      valid('0.0001', '22222222-2222-4222-8222-222222222222'),
      valid('1200.5000', '33333333-3333-4333-8333-333333333333'),
    ])).toEqual({
      count: 3,
      minPriceWld: '0.0001',
      maxPriceWld: '9,007,199,254,740,991.0001',
      limited: false,
    });
  });

  it('bounds the sample to the backend 50-row contract without implying a market-wide total', () => {
    const fifty = Array.from({ length: 50 }, (_, index) => valid(
      String(index + 1), `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    ));
    expect(parseMarketplaceAskingSnapshot(fifty)).toMatchObject({ count: 50, limited: true });
    expect(parseMarketplaceAskingSnapshot([...fifty, valid('51')])).toBeNull();
  });

  it('renders unavailable and verified empty as distinct accessible states', () => {
    const unavailable = renderToStaticMarkup(<VerifiedAskingSnapshot snapshot={null} />);
    const empty = renderToStaticMarkup(<VerifiedAskingSnapshot snapshot={parseMarketplaceAskingSnapshot([])} />);
    expect(unavailable).toContain('조회 불가');
    expect(unavailable).toContain('role="status"');
    expect(empty).toContain('활성 매물 0건');
    expect(empty).not.toContain('조회 불가');
  });

  it('never presents synthetic executions, 7/30-day volume or a fair-value band', () => {
    const html = renderToStaticMarkup(
      <VerifiedAskingSnapshot snapshot={parseMarketplaceAskingSnapshot([valid('1200.5')])} />,
    );
    expect(html).toContain('1건');
    expect(html).toContain('1,200.5');
    expect(html).toContain('등록 호가');
    expect(html).not.toMatch(/체결가|체결 총액|공정 시세|7일 추세|30일 누적|실시간/);

    const tabs = readFileSync(join(process.cwd(), 'src/app/marketplace/marketplace-tabs.tsx'), 'utf8');
    expect(tabs).not.toMatch(/rollingMedianWld="1320"|volume7dWld="28500"|24h 시장 규모/);
    const page = readFileSync(join(process.cwd(), 'src/app/marketplace/page.tsx'), 'utf8');
    expect(page).toContain('/api/v1/marketplace/listings?limit=50');
    expect(page).toContain('/api/v1/wallet?recent=1');
    expect(page).not.toContain('/api/v1/wallet/summary');
    expect(page).not.toContain("'1000'");
  });
});
