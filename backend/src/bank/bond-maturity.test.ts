import { describe, expect, it, vi } from 'vitest';
import { projectBondMaturities } from './bond-maturity';

const NOW = new Date('2026-10-25T00:00:00.000Z');
const bond = (overrides: Record<string, unknown> = {}) => ({
  id: 'f0000000-0000-4000-8000-000000000001',
  bond_code: 'BOND_7D', bond_name: 'Seven-day bond',
  principal_amount: '9007199254740993123456789012345678901234567890',
  maturity_amount: '9007199254740993123456789012345678901234567990',
  maturity_at: '2026-11-01T00:00:00.000Z',
  purchased_at: '2026-10-20T00:00:00.000Z', status: 'holding', ...overrides,
});

describe('owner-scoped bank bond maturity projection', () => {
  it('keeps large WLD exact, counts seven-day boundary, and sorts without changing source', () => {
    const rows = [bond(), bond({id: 'f0000000-0000-4000-8000-000000000002', maturity_at: '2026-10-24T23:00:00.000Z', principal_amount: '10', maturity_amount: '12'})];
    const output = projectBondMaturities({ bonds: rows }, NOW);
    expect(output.totalPrincipalWld).toBe('9007199254740993123456789012345678901234567900');
    expect(output.totalMaturityWld).toBe('9007199254740993123456789012345678901234568002');
    expect(output.dueWithinSevenDays).toBe(1);
    expect(output.maturedUnredeemed).toBe(1);
    expect(output.bonds.map((entry) => entry.maturityState)).toEqual(['MATURED_UNREDEEMED', 'DUE_WITHIN_SEVEN_DAYS']);
    expect(rows[0]?.maturity_at).toBe('2026-11-01T00:00:00.000Z');
  });
  it('does not claim a matured bond is paid or guaranteed', () => {
    const output = projectBondMaturities({bonds: [bond({maturity_at: '2026-10-20T00:00:00Z'})]}, NOW);
    expect(output.bonds[0]?.maturityState).toBe('MATURED_UNREDEEMED');
    expect(output.bonds[0]?.redemptionVerified).toBe(false);
  });
  it('fails closed on missing source, invalid integer strings, unsafe number, duplicate ids, or malformed dates', () => {
    for (const source of [null, {}, {bonds: [bond({principal_amount: 123})]}, {bonds: [bond({maturity_at: 'not-a-date'})]}, {bonds: [bond(), bond()]}, {bonds: [bond({status: 'redeemed'})]}]) {
      expect(() => projectBondMaturities(source, NOW)).toThrow();
    }
  });
  it('returns a verified empty portfolio without inventing bonds', () => {
    expect(projectBondMaturities({bonds: []}, NOW)).toMatchObject({holdingCount: 0, totalPrincipalWld: '0', totalMaturityWld: '0', bonds: []});
  });
});
