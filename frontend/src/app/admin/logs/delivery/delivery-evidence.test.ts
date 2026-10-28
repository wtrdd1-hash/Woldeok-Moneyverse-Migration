import { describe, expect, it } from 'vitest';
import { parseDeliveryEvidence } from './delivery-evidence';

const event = {
  event_id: '8f3b33d2-f91c-4ed8-9e13-032884e9a922',
  event_type: 'wallet.deposit',
  created_at: '2026-10-27T12:00:00.000Z',
  delivered_at: null,
  delivery_attempts: 2,
  delivery_status: 'retry_pending',
};

describe('Discord delivery read evidence', () => {
  it('distinguishes a verified empty recent sample from unavailable evidence', () => {
    expect(parseDeliveryEvidence({ events: [] })).toMatchObject({
      events: [], delivered: 0, outstanding: 0, terminal: 0, retried: 0,
    });
    expect(parseDeliveryEvidence(null)).toBeNull();
    expect(parseDeliveryEvidence({})).toBeNull();
  });

  it('counts only the recent sample, separates terminal and retryable outcomes', () => {
    const evidence = parseDeliveryEvidence({ events: [
      event,
      { ...event, event_id: 'b6cfc890-930e-4a3c-9fd8-271f4e1c0a53', delivery_status: 'suppressed', delivery_attempts: 0 },
      { ...event, event_id: 'd8d02d98-6ad1-4c35-a16a-f9e05f7b1878', delivery_status: 'dead_letter' },
      { ...event, event_id: 'c5299a71-3b8c-4d40-a53a-dcfb83956f19', delivery_status: 'delivered', delivered_at: '2026-10-27T12:01:00.000Z' },
    ] });
    expect(evidence).toMatchObject({ delivered: 1, outstanding: 1, terminal: 2, retried: 3 });
  });

  it.each([
    { events: 'not-array' },
    { events: [event, event] },
    { events: [{ ...event, event_id: 'bad-id' }] },
    { events: [{ ...event, delivery_status: 'successful' }] },
    { events: [{ ...event, delivery_attempts: -1 }] },
    { events: [{ ...event, delivery_attempts: 1.5 }] },
    { events: [{ ...event, delivered_at: '2026-10-27T12:01:00.000Z' }] },
    { events: [{ ...event, delivery_status: 'delivered' }] },
    { events: [{ ...event, created_at: 'not-a-date' }] },
    { events: [{ ...event, event_type: '' }] },
    { events: [{ ...event, created_at: '2026-10-29T12:00:00.000Z' }] },
    { events: [{ ...event, delivered_at: '2026-10-26T12:00:00.000Z', delivery_status: 'delivered' }] },
    { events: Array.from({ length: 31 }, (_, index) => ({ ...event, event_id: `8f3b33d2-f91c-4ed8-9e13-${String(index).padStart(12, '0')}` })) },
  ])('rejects malformed or contradictory API evidence (%#)', (payload) => {
    expect(parseDeliveryEvidence(payload)).toBeNull();
  });
});
