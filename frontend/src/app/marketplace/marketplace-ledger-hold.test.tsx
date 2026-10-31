import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MarketListingsView } from './market-listings-view';

afterEach(cleanup);

describe('P0 fixed-price marketplace truth', () => {
  it('never reports a synthetic 24h volume or an empty result as verified owner history', () => {
    const source = readFileSync(join(process.cwd(), 'src/app/marketplace/marketplace-tabs.tsx'), 'utf8');
    expect(source).not.toContain('24h 시장 규모');
    expect(source).not.toContain('P0 에스크로 등록 물품');
    expect(source).not.toContain('<MyListingsView');
    expect(source).not.toContain('<SellListingModal');
  });

  it('shows a settlement hold and disables purchase even when listing data is supplied', () => {
    const { container, getByRole } = render(<MarketListingsView
      listings={[{
        id: 'listing1', sellerId: 'seller', sellerName: 'seller', isOwn: false,
        itemCode: 'test', itemName: '검증 대상', category: 'material', rarity: 'common',
        quantity: 1, priceWld: '100', listedAt: '2026-10-31T00:00:00.000Z',
        serialNumber: null, status: 'active', description: 'test',
      }]} userBalanceWld="1000"
    />);
    expect(container.textContent).toContain('원장 정산 검증 전까지');
    const buy = getByRole('button', { name: /구매하기/ }) as HTMLButtonElement;
    expect(buy.disabled).toBe(true);
  });
});
