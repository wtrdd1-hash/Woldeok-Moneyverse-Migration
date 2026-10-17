import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('critical financial flows must preserve atomicity or fail closed before money movement', () => {
  it('historical PvP implementation still keeps its single-transaction settlement boundary', () => {
    const source = readFileSync('src/casino/pvp-arena.repository.ts', 'utf8');
    expect(source).toContain('withPgTransaction');
    expect(source).toContain('PvpArenaSettlementHoldError');
  });

  it('secret auctions may not write raw financial balances while ledger settlement is paused', () => {
    const source = readFileSync('src/marketplace/black-market.repository.ts', 'utf8');
    expect(source).toContain('BlackMarketSettlementHoldError');
    expect(source).not.toMatch(/\bUPDATE\s+public\.account_balances\b/i);
    expect(source).not.toMatch(/\bINSERT\s+INTO\s+public\.ledger_postings\b/i);
  });
});
