import { describe, expect, it } from 'vitest';
import { filterDeliveryEvents, parseDeliveryFilter } from './delivery-filter';

const base = {
  event_id: '8f3b33d2-f91c-4ed8-9e13-032884e9a922',
  event_type: 'wallet.deposit', created_at: '2026-10-27T12:00:00.000Z',
  delivered_at: null, delivery_attempts: 0, delivery_status: 'pending',
};
const rows = [
  base,
  { ...base, event_id: 'b6cfc890-930e-4a3c-9fd8-271f4e1c0a53', event_type: 'WALLET.transfer', delivery_status: 'retry_pending', delivery_attempts: 2 },
  { ...base, event_id: 'd8d02d98-6ad1-4c35-a16a-f9e05f7b1878', event_type: 'system.alert', delivery_status: 'dead_letter', delivery_attempts: 4 },
  { ...base, event_id: 'c5299a71-3b8c-4d40-a53a-dcfb83956f19', event_type: 'wallet.deposit', delivery_status: 'delivered', delivered_at: '2026-10-27T12:01:00.000Z', delivery_attempts: 1 },
  { ...base, event_id: 'a5299a71-3b8c-4d40-a53a-dcfb83956f19', event_type: 'system.alert', delivery_status: 'suppressed' },
] as const;

describe('bounded Discord delivery triage', () => {
  it('parses exact allowlisted URL filters and normalizes a literal event substring', () => {
    expect(parseDeliveryFilter({ status: 'outstanding', event: ' Wallet. ' })).toEqual({ status: 'outstanding', event: 'Wallet.' });
    expect(parseDeliveryFilter({})).toEqual({ status: 'all', event: '' });
    expect(parseDeliveryFilter({ status: 'terminal' })).toEqual({ status: 'terminal', event: '' });
    expect(parseDeliveryFilter({ status: 'retried' })).toEqual({ status: 'retried', event: '' });
  });
  it.each([
    { status: 'pending' }, { status: ['all', 'delivered'] }, { event: ['a', 'b'] },
    { event: '*.*' }, { event: '<script>' }, { event: 'x'.repeat(65) },
    { event: '\\u0000' }, { status: 1 },
  ])('rejects invalid or ambiguous URL input rather than broadening the results (%#)', (query) => {
    expect(parseDeliveryFilter(query)).toBeNull();
  });
  it('selects only matching verified rows without inventing whole-history counts', () => {
    expect(filterDeliveryEvents(rows, { status: 'outstanding', event: 'wallet' }).map((r) => r.event_id)).toEqual([rows[0].event_id, rows[1].event_id]);
    expect(filterDeliveryEvents(rows, { status: 'terminal', event: '' })).toHaveLength(2);
    expect(filterDeliveryEvents(rows, { status: 'delivered', event: '' })).toHaveLength(1);
    expect(filterDeliveryEvents(rows, { status: 'retried', event: '' })).toHaveLength(2);
    expect(filterDeliveryEvents(rows, { status: 'all', event: 'missing' })).toEqual([]);
    expect(filterDeliveryEvents(rows, { status: 'all', event: '' })).toHaveLength(5);
  });
});
