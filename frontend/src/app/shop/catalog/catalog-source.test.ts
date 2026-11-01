import { describe, expect, it } from 'vitest';
import { normalizeCatalogQuery, verifiedCatalog, verifiedHoldings } from './catalog-source';

const UUID_A = '11111111-1111-4111-8111-111111111111';
const UUID_B = '22222222-2222-4222-8222-222222222222';
const catalogItem = {
  catalog_id: UUID_A,
  code: 'sample',
  name: 'Verified item',
  description: 'From the shop',
  category: 'general',
  price: '9007199254740993',
  quantity: null,
  purchase_limit: 'unlimited',
  effect_kind: 'convenience',
  maintenance_cost: '0',
  sale_ends_at: null,
};
const holding = {
  catalog_id: UUID_A,
  code: 'sample',
  name: 'Verified item',
  quantity: 2,
  acquired_at: '2026-11-01T01:00:00.000Z',
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

describe('member shop source proof', () => {
  it('accepts real backend catalogue/holding DTO shapes and keeps WLD exact', () => {
    expect(verifiedCatalog({ catalogItems: [catalogItem] })?.catalogItems[0]?.price).toBe(
      '9007199254740993',
    );
    expect(verifiedHoldings({ holdings: [holding] })?.holdings[0]?.quantity).toBe(2);
    expect(verifiedCatalog({ catalogItems: [] })).toEqual({ catalogItems: [] });
    expect(verifiedHoldings({ holdings: [] })).toEqual({ holdings: [] });
  });

  it('rejects missing, malformed, or non-array payloads rather than declaring an empty shop', () => {
    for (const value of [
      null,
      undefined,
      {},
      { catalogItems: null },
      { catalogItems: {} },
      { catalogItems: 'items' },
    ]) {
      expect(verifiedCatalog(value)).toBeNull();
    }
    for (const value of [null, {}, { holdings: null }, { holdings: {} }]) {
      expect(verifiedHoldings(value)).toBeNull();
    }
  });

  it('rejects malformed prices, unknown numeric representations and negative upkeep', () => {
    for (const price of [
      'NaN',
      '1.5',
      '-1',
      'Infinity',
      1000,
      '1e5',
      '01',
      '',
      '9223372036854775808',
      '9'.repeat(40),
    ]) {
      expect(verifiedCatalog({ catalogItems: [{ ...catalogItem, price }] })).toBeNull();
    }
    expect(
      verifiedCatalog({ catalogItems: [{ ...catalogItem, maintenance_cost: '-1' }] }),
    ).toBeNull();
    expect(verifiedCatalog({ catalogItems: [{ ...catalogItem, quantity: 1.2 }] })).toBeNull();
    expect(verifiedCatalog({ catalogItems: [{ ...catalogItem, quantity: -1 }] })).toBeNull();
    expect(
      verifiedCatalog({
        catalogItems: [{ ...catalogItem, quantity: Number.MAX_SAFE_INTEGER + 1 }],
      }),
    ).toBeNull();
  });

  it('rejects duplicate or malformed catalogue identities and impossible sale times', () => {
    expect(
      verifiedCatalog({ catalogItems: [catalogItem, { ...catalogItem, code: 'other' }] }),
    ).toBeNull();
    expect(
      verifiedCatalog({
        catalogItems: [catalogItem, { ...catalogItem, catalog_id: UUID_B, code: 'sample' }],
      }),
    ).toBeNull();
    expect(
      verifiedCatalog({ catalogItems: [{ ...catalogItem, catalog_id: 'not-a-uuid' }] }),
    ).toBeNull();
    expect(
      verifiedCatalog({ catalogItems: [{ ...catalogItem, sale_ends_at: 'yesterday' }] }),
    ).toBeNull();
    expect(verifiedCatalog({ catalogItems: [{ ...catalogItem, name: null }] })).toBeNull();
  });

  it('rejects owner holdings with forged status, invalid debt or duplicate IDs', () => {
    expect(verifiedHoldings({ holdings: [{ ...holding, suspended: 'false' }] })).toBeNull();
    expect(verifiedHoldings({ holdings: [{ ...holding, arrears_due: '-10' }] })).toBeNull();
    expect(verifiedHoldings({ holdings: [{ ...holding, quantity: 0 }] })).toBeNull();
    expect(verifiedHoldings({ holdings: [{ ...holding, acquired_at: 'invalid' }] })).toBeNull();
    expect(verifiedHoldings({ holdings: [holding, holding] })).toBeNull();
  });

  it('bounds search and refuses array/object query injection without crashing', () => {
    expect(normalizeCatalogQuery('  HELLO  ')).toBe('hello');
    expect(normalizeCatalogQuery('x'.repeat(200))).toHaveLength(80);
    expect(normalizeCatalogQuery(['owned'])).toBe('');
    expect(normalizeCatalogQuery({ q: 'owned' })).toBe('');
    expect(normalizeCatalogQuery(null)).toBe('');
  });
});
