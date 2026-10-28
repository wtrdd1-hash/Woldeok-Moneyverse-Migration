import { describe, expect, it } from 'vitest';
import { parseAuditVerifications } from './integrity-evidence';

const row = {
  verification_id: '11111111-1111-4111-8111-111111111111',
  requested_by: '22222222-2222-4222-8222-222222222222',
  from_sequence: '9007199254740993', to_sequence: '9007199254740994',
  checked_count: '2', verified_count: '2', legacy_count: '0', mismatch_count: '0',
  link_break_count: '0', column_drift_count: '0', first_bad_sequence: null,
  status: 'passed', started_at: '2026-10-28T09:00:00.000Z', completed_at: '2026-10-28T09:00:01.000Z',
};

const parse = (item: unknown) => parseAuditVerifications({ verifications: [item] });

describe('admin audit chain verification evidence', () => {
  it('preserves exact 64-bit sequence text from the real NestJS/PG contract', () => {
    expect(parse(row)?.[0]?.from_sequence).toBe('9007199254740993');
    expect(parse(row)?.[0]?.status).toBe('passed');
  });
  it('distinguishes an authentic empty history from missing or malformed evidence', () => {
    expect(parseAuditVerifications({ verifications: [] })).toEqual([]);
    expect(parseAuditVerifications(null)).toBeNull();
    expect(parseAuditVerifications({})).toBeNull();
    expect(parseAuditVerifications({ verifications: 'none' })).toBeNull();
  });
  it('allows a verified legacy mismatch with no current alarm as the SQL function does', () => {
    expect(parse({ ...row, verified_count: '1', legacy_count: '1' })?.[0]?.status).toBe('passed');
  });
  it('accepts a failed chain with a bounded first bad sequence', () => {
    const broken = { ...row, verified_count: '1', mismatch_count: '1',
      first_bad_sequence: row.to_sequence, status: 'failed' };
    expect(parse(broken)?.[0]?.status).toBe('failed');
  });
  it('accepts a genuine empty verification window from migration 064', () => {
    const empty = { ...row, from_sequence: '0', to_sequence: '0',
      checked_count: '0', verified_count: '0', status: 'empty' };
    expect(parse(empty)?.[0]?.status).toBe('empty');
  });
  it.each([
    { status: 'passed', mismatch_count: '1', first_bad_sequence: row.from_sequence },
    { status: 'failed' },
    { status: 'empty' },
    { checked_count: '0' },
    { checked_count: '1' },
    { checked_count: '-1' },
    { checked_count: '1e3' },
    { checked_count: 2 },
    { checked_count: '100001' },
    { verified_count: '3' },
    { legacy_count: '2' },
    { link_break_count: '1' },
    { first_bad_sequence: row.from_sequence },
    { from_sequence: '9007199254740995' },
    { from_sequence: '9007199254740993.0' },
    { first_bad_sequence: '9007199254740995', mismatch_count: '1', status: 'failed' },
    { verification_id: 'not-a-uuid' },
    { requested_by: 'not-a-uuid' },
    { started_at: 'not-a-date' },
    { completed_at: '2026-10-28T08:59:59.000Z' },
    { completed_at: '9999-01-01T00:00:00.000Z' },
    { status: 'verified' },
  ])('rejects contradictory or malformed verification %#', (change) => {
    expect(parse({ ...row, ...change })).toBeNull();
  });
  it('rejects duplicated verification ids and unbounded lists', () => {
    expect(parseAuditVerifications({ verifications: [row, row] })).toBeNull();
    expect(parseAuditVerifications({ verifications: Array.from({ length: 31 }, (_, index) => ({
      ...row, verification_id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,
    })) })).toBeNull();
  });
});
