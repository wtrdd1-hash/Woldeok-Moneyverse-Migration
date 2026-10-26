import { describe, expect, it } from 'vitest';
import { parseDeliveryEvidence } from './delivery-evidence';

const sample = {
  event_id: '11111111-1111-4111-8111-111111111111',
  event_type: 'economy.transaction.posted',
  created_at: '2026-10-27T05:00:00.000Z',
  delivered_at: '2026-10-27T05:01:00.000Z',
  delivery_attempts: 2,
  delivery_status: 'delivered',
};

describe('admin Discord delivery evidence boundary', () => {
  it('withholds metrics on missing API response', () => {
    expect(parseDeliveryEvidence(null)).toBeNull();
  });
  it('accepts verified empty recent results as genuinely empty', () => {
    expect(parseDeliveryEvidence({ events: [] })).toEqual({ events: [] });
  });
  it('accepts real PostgreSQL-backed outbox rows', () => {
    expect(parseDeliveryEvidence({ events: [sample] })).toEqual({ events: [sample] });
  });
  it('rejects malformed envelope rather than treating it as zero', () => {
    expect(parseDeliveryEvidence({ events: null })).toBeNull();
    expect(parseDeliveryEvidence({ events: {} })).toBeNull();
    expect(parseDeliveryEvidence({})).toBeNull();
  });
  it('rejects invalid attempts and non-string statuses', () => {
    expect(parseDeliveryEvidence({ events: [{ ...sample, delivery_attempts: -1 }] })).toBeNull();
    expect(parseDeliveryEvidence({ events: [{ ...sample, delivery_attempts: 1.5 }] })).toBeNull();
    expect(parseDeliveryEvidence({ events: [{ ...sample, delivery_status: { value: 'delivered' } }] })).toBeNull();
  });
  it('rejects malformed identifiers, dates, and delivered timestamps', () => {
    expect(parseDeliveryEvidence({ events: [{ ...sample, event_id: 'oops' }] })).toBeNull();
    expect(parseDeliveryEvidence({ events: [{ ...sample, created_at: 'not-a-date' }] })).toBeNull();
    expect(parseDeliveryEvidence({ events: [{ ...sample, delivered_at: 123 }] })).toBeNull();
  });
  it('rejects internally inconsistent delivery evidence', () => {
    expect(parseDeliveryEvidence({ events: [{ ...sample, delivered_at: null }] })).toBeNull();
    expect(parseDeliveryEvidence({ events: [{ ...sample, delivery_status: 'pending' }] })).toBeNull();
  });
  it('rejects oversized, duplicate, or control-character-bearing payloads', () => {
    expect(parseDeliveryEvidence({ events: Array.from({ length: 31 }, () => sample) })).toBeNull();
    expect(parseDeliveryEvidence({ events: [sample, sample] })).toBeNull();
    expect(parseDeliveryEvidence({ events: [{ ...sample, event_type: 'bad\nname' }] })).toBeNull();
  });
});
