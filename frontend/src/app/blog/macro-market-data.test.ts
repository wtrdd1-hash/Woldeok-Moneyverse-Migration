import { describe, expect, it } from 'vitest';
import { DEFAULT_MACRO_SNAPSHOT, getLiveMacroMarketSnapshot } from './macro-market-data';

describe('macro-market-data provider', () => {
  it('returns valid fallback snapshot structure', () => {
    expect(DEFAULT_MACRO_SNAPSHOT.usdKrwRate).toBeGreaterThan(1000);
    expect(DEFAULT_MACRO_SNAPSHOT.fedFundsRate).toBeGreaterThan(0);
    expect(DEFAULT_MACRO_SNAPSHOT.bokBaseRate).toBeGreaterThan(0);
    expect(DEFAULT_MACRO_SNAPSHOT.dataSource).toBe('AUTHORITATIVE_FALLBACK');
  });

  it('safely handles live snapshot generation without crashing', async () => {
    const snapshot = await getLiveMacroMarketSnapshot();
    expect(snapshot).toBeDefined();
    expect(typeof snapshot.usdKrwRate).toBe('number');
    expect(typeof snapshot.kospiIndex).toBe('number');
    expect(typeof snapshot.sp500Index).toBe('number');
    expect(typeof snapshot.fedFundsRate).toBe('number');
    expect(['LIVE_API', 'AUTHORITATIVE_FALLBACK']).toContain(snapshot.dataSource);
  });
});
