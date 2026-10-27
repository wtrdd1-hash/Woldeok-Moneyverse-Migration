import { describe, expect, it } from 'vitest';
import { validateMoneyFlowResponse } from './money-flow-data';
import { groupDigits } from '@/lib/money';

const valid = {
  items: [{
    transaction_id: '8a12662b-fcaa-4e50-9234-9b6d7ec5c412',
    type: 'BANK_DEPOSIT',
    user_id: 'ee0eab31-79f2-47ab-bad8-55b82933c9f2',
    display_name: 'Member',
    account_type: 'cash',
    direction: 'debit',
    amount: '9007199254740993',
    created_at: '2026-10-27T00:00:00.000Z',
  }],
  summary: {
    total_volume_24h: '9007199254740993',
    total_transactions_24h: 1,
    active_users_24h: 1,
    total_inflow_24h: '9007199254740993',
    total_outflow_24h: '0',
    all_time_transactions: 1,
    all_time_users: 1,
    last_transaction_at: '2026-10-27T00:00:00.000Z',
  },
  next_cursor: null,
};

describe('admin money-flow API evidence', () => {
  it('keeps exact numeric(38,0) WLD strings without JS Number rounding', () => {
    const parsed = validateMoneyFlowResponse(valid);
    expect(parsed?.summary.total_volume_24h).toBe('9007199254740993');
    expect(groupDigits(parsed?.items[0]?.amount)).toBe('9,007,199,254,740,993');
  });
  it('distinguishes a verified empty ledger from a missing API response', () => {
    expect(validateMoneyFlowResponse(null)).toBeNull();
    expect(validateMoneyFlowResponse({ ...valid, items: [], summary: { ...valid.summary, total_transactions_24h: 0 } })?.items).toEqual([]);
  });
  it('rejects malformed or incomplete summaries instead of fabricating zeros', () => {
    expect(validateMoneyFlowResponse({ ...valid, summary: null })).toBeNull();
    expect(validateMoneyFlowResponse({ ...valid, summary: { ...valid.summary, total_volume_24h: '1e10' } })).toBeNull();
    expect(validateMoneyFlowResponse({ ...valid, summary: { ...valid.summary, active_users_24h: -1 } })).toBeNull();
  });
  it('rejects malformed ledger rows and unsafe numeric amounts', () => {
    expect(validateMoneyFlowResponse({ ...valid, items: [{ ...valid.items[0], amount: Number('9007199254740993') }] })).toBeNull();
    expect(validateMoneyFlowResponse({ ...valid, items: [{ ...valid.items[0], user_id: null }] })).toBeNull();
    expect(validateMoneyFlowResponse({ ...valid, items: [{ ...valid.items[0], direction: 'incoming' }] })).toBeNull();
  });
  it('rejects malformed timestamps, cursor, and unbounded lists', () => {
    expect(validateMoneyFlowResponse({ ...valid, next_cursor: 123 })).toBeNull();
    expect(validateMoneyFlowResponse({ ...valid, items: [{ ...valid.items[0], created_at: 'not-a-date' }] })).toBeNull();
    expect(validateMoneyFlowResponse({ ...valid, items: Array(51).fill(valid.items[0]) })).toBeNull();
  });
  it('does not invent cumulative totals when the API omits optional counters', () => {
    const { all_time_transactions: _transactions, all_time_users: _users, ...summary } = valid.summary;
    const parsed = validateMoneyFlowResponse({ ...valid, summary });
    expect(parsed).not.toBeNull();
    expect(parsed?.summary.all_time_transactions).toBeUndefined();
    expect(parsed?.summary.all_time_users).toBeUndefined();
  });
});
