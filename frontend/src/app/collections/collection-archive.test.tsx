import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CollectionArchive, verifyCollectionHoldings } from './collection-archive';

const owned = {
  catalog_id: '11111111-1111-4111-8111-111111111111',
  code: 'REAL_BADGE',
  name: '실제 보유 배지',
  description: '서버에 기록된 아이템',
  category: 'badge',
  quantity: 2,
  acquired_at: '2026-10-20T00:00:00.000Z',
  expires_at: null,
  rarity: 'RARE',
  is_equipped: false,
};

describe('verified collection archive', () => {
  it('renders only owner-scoped PostgreSQL holdings and does not fabricate provenance or share URLs', () => {
    const html = renderToStaticMarkup(<CollectionArchive response={{ holdings: [owned] }} />);
    expect(html).toContain('실제 보유 배지');
    expect(html).toContain('2개');
    expect(html).toContain('서버에 기록된 아이템');
    expect(html).toContain('/inventory');
    expect(html).not.toContain('FIRST_CAPITAL_BADGE');
    expect(html).not.toContain('소유감 4단계');
    expect(html).not.toContain('arch-1063');
    expect(html).not.toContain('메모 저장하기');
  });

  it('distinguishes a successful empty owner list from a failed backend read', () => {
    const empty = renderToStaticMarkup(<CollectionArchive response={{ holdings: [] }} />);
    const failed = renderToStaticMarkup(<CollectionArchive response={null} />);
    expect(empty).toContain('보유한 아이템이 아직 없어요');
    expect(failed).toContain('보유 정보를 확인하지 못했어요');
    expect(failed).not.toContain('보유한 아이템이 아직 없어요');
  });

  it('fails closed on malformed API responses rather than showing fake empty ownership', () => {
    expect(verifyCollectionHoldings({ holdings: [{ ...owned, quantity: -1 }] })).toBeNull();
    expect(verifyCollectionHoldings({ holdings: [{ ...owned, catalog_id: 'fake' }] })).toBeNull();
    expect(verifyCollectionHoldings({ holdings: [{ ...owned, acquired_at: 'invalid' }] })).toBeNull();
    expect(verifyCollectionHoldings({ holdings: 'bad' })).toBeNull();
    const html = renderToStaticMarkup(<CollectionArchive response={{ holdings: [{ ...owned, quantity: 0 }] }} />);
    expect(html).toContain('보유 정보를 확인하지 못했어요');
  });

  it('does not label expired or suspended holdings as usable', () => {
    const html = renderToStaticMarkup(<CollectionArchive response={{ holdings: [
      { ...owned, expires_at: '2020-01-01T00:00:00.000Z' },
      { ...owned, catalog_id: '22222222-2222-4222-8222-222222222222', name: '일시 정지', suspended: true },
    ] }} />);
    expect(html).toContain('기간 만료');
    expect(html).toContain('사용 정지');
  });
});
