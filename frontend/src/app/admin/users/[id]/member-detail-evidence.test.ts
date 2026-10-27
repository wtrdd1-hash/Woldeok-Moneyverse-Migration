import { describe, expect, it } from 'vitest';
import { resolveAdminMemberDetail } from './member-detail-evidence';

const ID = 'c23eb10e-4389-42db-91bd-0fbf1a4cc732';
const OTHER = 'cc04bc5a-77dd-46d8-929e-b8ec84e01e53';
const portfolio = {
  portfolio: {
    userId: ID,
    displayName: 'Verified member',
    status: 'active',
    createdAt: '2026-10-26T03:00:00.000Z',
    restrictedAt: null,
    restrictionReason: null,
    cashBalance: 9007199254740992,
  },
};

const directoryRow = {
  user_id: ID,
  display_name: 'Verified member',
  status: 'active',
  created_at: '2026-10-26T03:00:00.000Z',
  restricted_at: null,
  restriction_reason: null,
  cash_balance: '9007199254740993',
  bank_balance: '10',
  bond_balance: '0',
  stock_eval: '0',
  total_net_worth: '9007199254741003',
  wealth_rank: 1,
};

describe('admin member detail authoritative evidence', () => {
  it('resolves a real member even when the bounded directory does not include them', () => {
    const member = resolveAdminMemberDetail(ID, portfolio, { users: [] });
    expect(member).toMatchObject({ user_id: ID, display_name: 'Verified member', status: 'active' });
    expect(member?.cash_balance).toBeUndefined();
    expect(member?.total_net_worth).toBeUndefined();
  });

  it('uses only canonical exact WLD strings from the matching directory row', () => {
    const member = resolveAdminMemberDetail(ID, portfolio, { users: [directoryRow] });
    expect(member?.cash_balance).toBe('9007199254740993');
    expect(member?.total_net_worth).toBe('9007199254741003');
  });

  it('rejects a missing, malformed, or wrong-user authoritative portfolio', () => {
    expect(resolveAdminMemberDetail(ID, null, { users: [directoryRow] })).toBeNull();
    expect(resolveAdminMemberDetail(ID, { portfolio: null }, { users: [directoryRow] })).toBeNull();
    expect(resolveAdminMemberDetail(ID, { portfolio: { ...portfolio.portfolio, userId: OTHER } }, { users: [directoryRow] })).toBeNull();
    expect(resolveAdminMemberDetail(ID, { portfolio: { ...portfolio.portfolio, createdAt: 'not a date' } }, { users: [directoryRow] })).toBeNull();
    expect(resolveAdminMemberDetail(ID, { portfolio: { ...portfolio.portfolio, displayName: '' } }, { users: [directoryRow] })).toBeNull();
  });

  it('does not convert malformed financial data or a duplicate directory into valid money', () => {
    const malformed = { ...directoryRow, cash_balance: '9.2', total_net_worth: 9007199254740992 };
    const member = resolveAdminMemberDetail(ID, portfolio, { users: [malformed] });
    expect(member?.cash_balance).toBeUndefined();
    expect(member?.total_net_worth).toBeUndefined();
    expect(resolveAdminMemberDetail(ID, portfolio, { users: [directoryRow, directoryRow] })?.cash_balance).toBeUndefined();
  });

  it('fails closed on inconsistent restriction metadata and unknown statuses', () => {
    expect(resolveAdminMemberDetail(ID, { portfolio: { ...portfolio.portfolio, restrictedAt: 'bad' } }, null)).toBeNull();
    expect(resolveAdminMemberDetail(ID, { portfolio: { ...portfolio.portfolio, status: '' } }, null)).toBeNull();
    expect(resolveAdminMemberDetail(ID, { portfolio: { ...portfolio.portfolio, restrictionReason: 99 } }, null)).toBeNull();
  });
});
