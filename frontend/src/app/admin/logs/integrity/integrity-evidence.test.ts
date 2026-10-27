import { describe, expect, it } from 'vitest';
import {
  parseAuditVerifications,
  parseAuditRetention,
  parseAuditDispositions,
} from './integrity-evidence';

const verification = {
  verification_id: 'f0e1d2c3-b4a5-4678-8abc-abcdef012345',
  requested_by: null,
  from_sequence: '1',
  to_sequence: '9007199254740993',
  checked_count: '2',
  verified_count: '2',
  legacy_count: '0',
  mismatch_count: '0',
  link_break_count: '0',
  column_drift_count: '0',
  first_bad_sequence: null,
  status: 'passed',
  started_at: '2026-10-27T00:00:00.000Z',
  completed_at: '2026-10-27T00:00:01.000Z',
};
const retention = {
  category: 'authentication',
  retention_days: 90,
  cutoff_at: '2026-07-27T00:00:00.000Z',
  total_rows: '9007199254740993',
  expired_rows: '1',
  oldest_expired_sequence: '1',
  newest_expired_sequence: '1',
  last_disposition: null,
  last_disposition_at: null,
};
const disposition = {
  record_id: 'f0e1d2c3-b4a5-4678-8abc-abcdef012345',
  category: 'authentication',
  from_sequence: '1',
  to_sequence: '9007199254740993',
  row_count: '2',
  method: 'archived',
  note: '',
  evidence_hash: null,
  performed_by: 'f0e1d2c3-b4a5-4678-8abc-abcdef012345',
  performed_at: '2026-10-27T00:00:00.000Z',
};

describe('privileged audit integrity evidence', () => {
  it('preserves exact 64-bit sequence and count strings from the authenticated API', () => {
    expect(parseAuditVerifications({ verifications: [verification] })?.[0]?.to_sequence)
      .toBe('9007199254740993');
    expect(parseAuditRetention({ categories: [retention] })?.[0]?.total_rows)
      .toBe('9007199254740993');
    expect(parseAuditDispositions({ dispositions: [disposition] })?.[0]?.to_sequence)
      .toBe('9007199254740993');
  });

  it('distinguishes verified empty arrays from unavailable or malformed envelopes', () => {
    expect(parseAuditVerifications({ verifications: [] })).toEqual([]);
    expect(parseAuditRetention({ categories: [] })).toEqual([]);
    expect(parseAuditDispositions({ dispositions: [] })).toEqual([]);
    expect(parseAuditVerifications(null)).toBeNull();
    expect(parseAuditRetention({ categories: null })).toBeNull();
    expect(parseAuditDispositions({ dispositions: 'none' })).toBeNull();
  });

  it('accepts the database empty-range sentinel and a real failed verification', () => {
    expect(parseAuditVerifications({ verifications: [{
      ...verification, from_sequence: '100', to_sequence: '50', checked_count: '0',
      verified_count: '0', status: 'empty',
    }] })?.[0]?.status).toBe('empty');
    expect(parseAuditVerifications({ verifications: [{
      ...verification, mismatch_count: '1', verified_count: '1',
      first_bad_sequence: '1', status: 'failed',
    }] })?.[0]?.status).toBe('failed');
  });

  it('rejects contradictory verification success and counts', () => {
    expect(parseAuditVerifications({ verifications: [{ ...verification, mismatch_count: '1' }] })).toBeNull();
    expect(parseAuditVerifications({ verifications: [{ ...verification, verified_count: '3' }] })).toBeNull();
    expect(parseAuditVerifications({ verifications: [{ ...verification, status: 'approved' }] })).toBeNull();
    expect(parseAuditVerifications({ verifications: [{ ...verification, completed_at: 'not a date' }] })).toBeNull();
    expect(parseAuditVerifications({ verifications: [verification, verification] })).toBeNull();
  });

  it('rejects untrusted retention counts before exposing policy-change controls', () => {
    expect(parseAuditRetention({ categories: [{ ...retention, expired_rows: '9007199254740994' }] })).toBeNull();
    expect(parseAuditRetention({ categories: [{ ...retention, retention_days: 0 }] })).toBeNull();
    expect(parseAuditRetention({ categories: [{ ...retention, total_rows: 100 }] })).toBeNull();
    expect(parseAuditRetention({ categories: [{ ...retention, last_disposition_at: 'bad' }] })).toBeNull();
    expect(parseAuditRetention({ categories: [retention, retention] })).toBeNull();
  });

  it('rejects malformed disposition receipts and invalid sequence ranges', () => {
    expect(parseAuditDispositions({ dispositions: [{ ...disposition, from_sequence: '9007199254740994' }] })).toBeNull();
    expect(parseAuditDispositions({ dispositions: [{ ...disposition, method: 'deleted' }] })).toBeNull();
    expect(parseAuditDispositions({ dispositions: [{ ...disposition, evidence_hash: 'bogus' }] })).toBeNull();
    expect(parseAuditDispositions({ dispositions: [{ ...disposition, performed_at: null }] })).toBeNull();
    expect(parseAuditDispositions({ dispositions: [disposition, disposition] })).toBeNull();
  });
});
