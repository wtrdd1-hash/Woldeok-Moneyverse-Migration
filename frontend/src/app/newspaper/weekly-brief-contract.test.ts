import { describe, expect, it } from 'vitest';
import { parseWeeklyBriefResponse } from './weekly-brief-contract';

describe('Newspaper backend contract', () => {
  it('requires an authoritative envelope, source, safe integer string and timestamp', () => {
    const data = { balanceSnapshotWld: '0', source: 'user_cash_and_bank_balances', asOf: '2026-10-26T02:45:00.000Z' };
    expect(parseWeeklyBriefResponse({ success: true, data })).toEqual(data);
    for (const bad of [undefined, {}, { data }, { success: true, data: { ...data, source: 'demo' } }, { success: true, data: { ...data, balanceSnapshotWld: '1e9' } }, { success: true, data: { ...data, balanceSnapshotWld: '01' } }]) {
      expect(parseWeeklyBriefResponse(bad)).toBeUndefined();
    }
  });
});
