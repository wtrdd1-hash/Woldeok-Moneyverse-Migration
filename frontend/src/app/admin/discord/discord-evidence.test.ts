import { describe, expect, it } from 'vitest';
import { parseDiscordEvidence } from './discord-evidence';

const outbox = {
  pending_count: '2', retry_pending_count: '1', delivering_count: '0',
  delivered_count: '10', dead_letter_count: '1', suppressed_count: '1',
  delivered_24h_count: '3', stuck_count: '1', unrouted_type_count: '1',
  oldest_undelivered_at: '2026-10-27T11:00:00.000Z',
  last_delivered_at: '2026-10-27T12:00:00.000Z', last_failure_at: null,
};
const route = {
  event_type: 'wallet.transfer.completed', channel_key: 'default', enabled: true,
  note: 'one member action', routed: true, total_count: '5', pending_count: '1',
  dead_letter_count: '1', suppressed_count: '0', delivered_24h_count: '2',
  last_delivered_at: '2026-10-27T12:00:00.000Z',
};
const payload = { outbox, routes: [route], adminAlertInfo: { configured: true, adminUserId: '123456789012345678' } };
const now = Date.parse('2026-10-28T06:00:00Z');

describe('administrator Discord delivery evidence', () => {
  it('accepts exact PostgreSQL count strings and valid routed events', () => {
    expect(parseDiscordEvidence(payload, now)).toEqual(payload);
  });

  it.each([
    { pending_count: -1 },
    { pending_count: 1 },
    { pending_count: '1.5' },
    { pending_count: '01' },
    { pending_count: '900719925474099099999999' },
    { stuck_count: 'NaN' },
    { delivered_24h_count: '11' },
    { oldest_undelivered_at: 'not-a-date' },
    { last_delivered_at: '2026-11-01T12:00:00.000Z' },
  ])('rejects malformed outbox evidence: %j', (change) => {
    expect(parseDiscordEvidence({ ...payload, outbox: { ...outbox, ...change } }, now)).toBeNull();
  });

  it.each([
    { event_type: '' },
    { event_type: 'bad\nname' },
    { channel_key: 'bad channel' },
    { routed: 'true' },
    { enabled: null },
    { pending_count: '6' },
    { delivered_24h_count: '6' },
    { last_delivered_at: 'not-a-date' },
  ])('rejects invalid route evidence: %j', (change) => {
    expect(parseDiscordEvidence({ ...payload, routes: [{ ...route, ...change }] }, now)).toBeNull();
  });

  it('rejects duplicate event types, not just duplicate route rows', () => {
    expect(parseDiscordEvidence({ ...payload, routes: [route, { ...route }] }, now)).toBeNull();
  });

  it('accepts a legitimately unrouted event with null route metadata', () => {
    const unrouted = { ...route, routed: false, channel_key: null, enabled: null, note: null };
    expect(parseDiscordEvidence({ ...payload, routes: [unrouted] }, now)?.routes[0]).toEqual(unrouted);
  });

  it('rejects fabricated route metadata for an unrouted event', () => {
    expect(parseDiscordEvidence({ ...payload, routes: [{ ...route, routed: false }] }, now)).toBeNull();
  });

  it('rejects malformed envelope and unbounded route lists', () => {
    expect(parseDiscordEvidence(null, now)).toBeNull();
    expect(parseDiscordEvidence({ ...payload, routes: {} }, now)).toBeNull();
    expect(parseDiscordEvidence({ ...payload, routes: Array(1001).fill(route) }, now)).toBeNull();
  });
});
