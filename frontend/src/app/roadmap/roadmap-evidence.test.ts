import { describe, expect, it } from 'vitest';
import { parseRoadmapMarketEvidence } from './roadmap-evidence';

const stock = (id: string, symbol: string) => ({
  id, symbol, name: 'Verified virtual listing', current_price: '1200', shares_available: '200',
});
const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';

describe('roadmap public market source', () => {
  it('distinguishes a genuinely empty stock list from a source outage', () => {
    expect(parseRoadmapMarketEvidence({ stocks: [] })).toEqual({ kind: 'available', count: 0 });
    expect(parseRoadmapMarketEvidence(null)).toEqual({ kind: 'unavailable' });
  });
  it('counts only strictly validated live source rows', () => {
    expect(parseRoadmapMarketEvidence({ stocks: [stock(id1, 'WDG'), stock(id2, 'BIO')] })).toEqual({ kind: 'available', count: 2 });
  });
  it.each([
    { stocks: null }, { stocks: 'invalid' }, { stocks: [stock(id1, 'WDG'), stock(id1, 'BIO')] },
    { stocks: [stock(id1, 'WDG'), stock(id2, 'WDG')] },
    { stocks: [{ ...stock(id1, 'WDG'), current_price: '1e10' }] },
    { stocks: [{ ...stock(id1, 'WDG'), shares_available: '-1' }] },
    { stocks: [{ ...stock(id1, 'WDG'), name: '' }] },
  ])('fails closed on malformed or duplicate data', (payload) => {
    expect(parseRoadmapMarketEvidence(payload)).toEqual({ kind: 'unavailable' });
  });
});
