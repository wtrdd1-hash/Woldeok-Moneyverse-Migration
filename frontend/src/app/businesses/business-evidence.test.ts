import { describe, expect, it } from 'vitest';
import {
  parseBusinessCatalog,
  parseBusinessOwnerships,
  parseBusinessEquity,
  parseBusinessInventory,
  parseBusinessUnlocks,
} from './business-evidence';

const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';
const ownership = {
  ownershipId: id1,
  businessTypeId: id2,
  symbol: 'CVS',
  name: 'Virtual store',
  description: '',
  purchaseCost: '100000000000000000000',
  dailyRevenue: '5000',
  dailyOperatingCost: '1200',
  purchasedAt: '2026-10-31T03:00:00.000Z',
  lastSettlementDate: null,
  isSettledToday: false,
  boostActive: null,
  status: 'active',
};
const catalog = {
  id: id2,
  symbol: 'CVS',
  name: 'Virtual store',
  description: '',
  purchaseCost: '1000',
  dailyRevenue: '500',
  dailyOperatingCost: '100',
};
const equity = {
  holdingsAmount: '0',
  debtAmount: '12',
  equityAmount: '-12',
  minimumRatioBps: 3000,
};
const unlock = {
  unlock_code: 'biz_cvs',
  unlock_label: 'CVS',
  unlock_detail: '',
  unlock_business_symbol: 'CVS',
  needs_job_level: 2,
  needs_account_days: 0,
  needs_work_completions: 0,
  is_enforced: true,
  unlocked: false,
  next_up: true,
  member_job_level: 1,
  member_account_days: 2,
  member_work_completions: 0,
};

describe('member business source evidence', () => {
  it('distinguishes verified empty owner and catalog reads from unavailable responses', () => {
    expect(parseBusinessOwnerships({ businesses: [] })).toEqual([]);
    expect(parseBusinessCatalog({ businessTypes: [] })).toEqual([]);
    expect(parseBusinessOwnerships(null)).toBeNull();
    expect(parseBusinessOwnerships({})).toBeNull();
    expect(parseBusinessCatalog({ businessTypes: 'none' })).toBeNull();
  });

  it('preserves exact large WLD amounts and valid owner-scoped DTO fields', () => {
    expect(parseBusinessOwnerships({ businesses: [ownership] })).toEqual([ownership]);
    const postgresDate = 'Sat Oct 31 2026 00:00:00 GMT+0000 (Coordinated Universal Time)';
    expect(parseBusinessOwnerships({ businesses: [{ ...ownership, lastSettlementDate: postgresDate }] })?.[0]?.lastSettlementDate).toBe(postgresDate);
    expect(parseBusinessCatalog({ businessTypes: [catalog] })).toEqual([catalog]);
  });

  it('rejects malformed financial amounts, timestamps, booleans and duplicate ownership', () => {
    for (const invalid of ['1.5', 'NaN', '1e6', -1, 'oops', '-100']) {
      expect(parseBusinessOwnerships({ businesses: [{ ...ownership, dailyRevenue: invalid }] })).toBeNull();
    }
    expect(parseBusinessOwnerships({ businesses: [{ ...ownership, dailyOperatingCost: 'x' }] })).toBeNull();
    expect(parseBusinessOwnerships({ businesses: [{ ...ownership, purchasedAt: 'not a date' }] })).toBeNull();
    expect(parseBusinessOwnerships({ businesses: [{ ...ownership, isSettledToday: 'false' }] })).toBeNull();
    expect(parseBusinessOwnerships({ businesses: [{ ...ownership, status: 'unexpected' }] })).toBeNull();
    expect(parseBusinessOwnerships({ businesses: [ownership, ownership] })).toBeNull();
    expect(parseBusinessOwnerships({ businesses: [{ ...ownership, boostActive: [] }] })).toBeNull();
  });

  it('rejects duplicate or malformed purchase catalog records', () => {
    expect(parseBusinessCatalog({ businessTypes: [catalog, catalog] })).toBeNull();
    expect(parseBusinessCatalog({ businessTypes: [{ ...catalog, purchaseCost: '1.5' }] })).toBeNull();
    expect(parseBusinessCatalog({ businessTypes: [{ ...catalog, id: 'not-uuid' }] })).toBeNull();
  });

  it('requires verified equity and inventory before showing a purchase or activation control', () => {
    expect(parseBusinessEquity({ equity })).toEqual(equity);
    expect(parseBusinessEquity({ equity: { ...equity, minimumRatioBps: 10001 } })).toBeNull();
    expect(parseBusinessEquity({ equity: { ...equity, equityAmount: 'infinity' } })).toBeNull();
    expect(parseBusinessEquity(null)).toBeNull();
    expect(parseBusinessInventory({ holdings: [] })).toEqual([]);
    expect(parseBusinessInventory({ holdings: [{ catalog_id: id1, code: 'biz_cvs_license', name: 'License', description: '', category: 'license', quantity: 1 }] })).toHaveLength(1);
    expect(parseBusinessInventory({ holdings: [{ catalog_id: id1, code: 'biz_cvs_license', name: 'License', description: '', category: 'license', quantity: -1 }] })).toBeNull();
    expect(parseBusinessInventory({ inventory: [] })).toBeNull();
    expect(parseBusinessInventory(null)).toBeNull();
  });

  it('requires valid unlock state before enabling purchases', () => {
    expect(parseBusinessUnlocks({ unlocks: [unlock] })).toEqual([unlock]);
    expect(parseBusinessUnlocks({ unlocks: [] })).toEqual([]);
    expect(parseBusinessUnlocks({ unlocks: [{ ...unlock, unlocked: 'yes' }] })).toBeNull();
    expect(parseBusinessUnlocks(null)).toBeNull();
  });
});
