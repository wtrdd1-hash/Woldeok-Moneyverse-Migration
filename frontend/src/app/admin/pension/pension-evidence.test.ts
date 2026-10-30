import { describe, expect, it } from 'vitest';
import { parsePensionOverview, parsePensionPayoutLogs } from './pension-evidence';

const overview = {
  totalAumWld: '9007199254740993',
  totalSubscribersCount: 10,
  totalRetiredReceiversCount: 2,
  totalPensionPaidWld: '120',
  benchmarkAnnualPayoutRate: '8.0%',
  vaultMainBalanceWld: '25000000',
};
const payout = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  account_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  user_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  payout_amount_wld: '9007199254740993',
  snapshot_accumulated_wld: '9007199254740999',
  created_at: '2026-10-27T00:00:00.000Z',
};

describe('verified NPS admin evidence', () => {
  it('preserves exact large WLD strings without Number conversion', () => {
    expect(parsePensionOverview(overview)?.totalAumWld).toBe('9007199254740993');
    expect(parsePensionPayoutLogs([payout])?.[0]?.payout_amount_wld).toBe('9007199254740993');
    expect(parsePensionOverview({ ...overview, benchmarkAnnualPayoutRate: null })?.benchmarkAnnualPayoutRate).toBeNull();
  });
  it('distinguishes a valid empty payout list from unavailable data', () => {
    expect(parsePensionPayoutLogs([])).toEqual([]);
    expect(parsePensionPayoutLogs(null)).toBeNull();
    expect(parsePensionOverview(null)).toBeNull();
  });
  it('rejects malformed overview counts, unsafe money, and impossible receiver counts', () => {
    expect(parsePensionOverview({ ...overview, totalSubscribersCount: '10' })).toBeNull();
    expect(parsePensionOverview({ ...overview, totalSubscribersCount: 1, totalRetiredReceiversCount: 2 })).toBeNull();
    expect(parsePensionOverview({ ...overview, totalAumWld: Number('9007199254740993') })).toBeNull();
    expect(parsePensionOverview({ ...overview, vaultMainBalanceWld: 'NaN' })).toBeNull();
    expect(parsePensionOverview({ ...overview, benchmarkAnnualPayoutRate: 'javascript:alert(1)' })).toBeNull();
    expect(parsePensionOverview({ ...overview, benchmarkAnnualPayoutRate: '101%' })).toBeNull();
    expect(parsePensionOverview({ ...overview, totalAumWld: '1'.repeat(39) })).toBeNull();
  });
  it('rejects invalid payout rows and duplicate or oversized log sets', () => {
    expect(parsePensionPayoutLogs([{ ...payout, created_at: 'not-a-date' }])).toBeNull();
    expect(parsePensionPayoutLogs([{ ...payout, payout_amount_wld: '-1' }])).toBeNull();
    expect(parsePensionPayoutLogs([payout, payout])).toBeNull();
    expect(parsePensionPayoutLogs(Array(31).fill(payout))).toBeNull();
    expect(parsePensionPayoutLogs({ items: [] })).toBeNull();
    expect(parsePensionPayoutLogs([{ ...payout, payout_amount_wld: '0' }])).toBeNull();
    expect(parsePensionPayoutLogs([{ ...payout, created_at: '2099-01-01T00:00:00.000Z' }])).toBeNull();
    expect(parsePensionPayoutLogs([{ ...payout, payout_amount_wld: '1'.repeat(39) }])).toBeNull();
    expect(parsePensionPayoutLogs([payout, { ...payout, id: payout.id.toUpperCase() }])).toBeNull();
  });
});
