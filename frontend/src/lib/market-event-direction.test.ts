import { describe, expect, it } from 'vitest';
import { parseMarketEventDirection, verifiedMarketEvents } from './market-event-direction';

const event = { id: '11111111-1111-4111-8111-111111111111', stock_id: null, symbol: null, name: null,
  direction: 'up', strength: 2, headline: 'Verified market news', body: 'Details', source: 'operator',
  starts_at: '2026-11-01T00:00:00Z', ends_at: '2026-11-01T06:00:00Z' };

describe('market event direction evidence', () => {
  it('accepts only the explicit canonical direction', () => {
    expect(parseMarketEventDirection('up')).toBe('up');
    expect(parseMarketEventDirection('down')).toBe('down');
    expect(parseMarketEventDirection(undefined)).toBeNull();
    for (const invalid of ['UP', 'all', '', 'sideways']) expect(() => parseMarketEventDirection(invalid)).toThrow();
  });
  it('distinguishes verified empty from malformed or unfiltered success', () => {
    expect(verifiedMarketEvents({ events: [] }, 'up')).toEqual([]);
    expect(verifiedMarketEvents({ events: [event] }, 'up')).toHaveLength(1);
    expect(verifiedMarketEvents({ events: [event] }, 'down')).toBeNull();
    expect(verifiedMarketEvents({ events: [{ ...event, headline: '' }] }, 'up')).toBeNull();
    expect(verifiedMarketEvents({ events: [{ ...event, starts_at: 'not-a-date' }] }, 'up')).toBeNull();
    expect(verifiedMarketEvents({ events: 'bad' }, 'up')).toBeNull();
  });
});
