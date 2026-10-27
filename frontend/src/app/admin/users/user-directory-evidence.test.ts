import { describe, expect, it } from 'vitest';
import { parseAdminUserSnapshot } from './user-directory-evidence';

const user = {
  user_id: '00000000-0000-4000-8000-000000000001',
  display_name: 'Member', status: 'active', created_at: '2026-09-01T00:00:00.000Z',
  restricted_at: null, restriction_reason: null, cash_balance: '9007199254740993',
  bank_balance: '0', bond_balance: '0', stock_eval: '0', total_net_worth: '9007199254740993',
};
const scope = { kind: 'WEALTH_ORDERED_SNAPSHOT', limit: 50, hasMore: false };

describe('admin member snapshot evidence', () => {
  it('accepts a verified 50-member bounded snapshot with exact integer strings', () => {
    expect(parseAdminUserSnapshot({ users: [user], scope })).toEqual({ users: [user], scope });
  });
  it('accepts a full 50-row snapshot with a confirmed additional member', () => {
    const users = Array.from({ length: 50 }, (_, i) => ({
      ...user, user_id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    }));
    expect(parseAdminUserSnapshot({ users, scope: { ...scope, hasMore: true } })?.users).toHaveLength(50);
  });
  it('refuses a truncated claim with fewer than 50 records', () => {
    expect(parseAdminUserSnapshot({ users: [user], scope: { ...scope, hasMore: true } })).toBeNull();
  });
  it('refuses missing evidence of whether more members exist', () => {
    expect(parseAdminUserSnapshot({ users: [user] })).toBeNull();
  });
  it('refuses invalid member identifiers', () => {
    expect(parseAdminUserSnapshot({ users: [{ ...user, user_id: '../other' }], scope })).toBeNull();
  });
  it('refuses precision-losing monetary values', () => {
    expect(parseAdminUserSnapshot({ users: [{ ...user, cash_balance: 9007199254740992 }], scope })).toBeNull();
  });
  it('refuses duplicate member rows and out-of-bound result arrays', () => {
    expect(parseAdminUserSnapshot({ users: [user, user], scope })).toBeNull();
    expect(parseAdminUserSnapshot({ users: Array.from({ length: 51 }, () => user), scope })).toBeNull();
  });
  it('refuses impossible scope metadata and invalid dates', () => {
    expect(parseAdminUserSnapshot({ users: [user], scope: { ...scope, limit: 100 } })).toBeNull();
    expect(parseAdminUserSnapshot({ users: [{ ...user, created_at: 'no-date' }], scope })).toBeNull();
  });
});
