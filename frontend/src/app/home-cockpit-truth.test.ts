import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/app/page.tsx', 'utf8');

describe('home financial presentation truth', () => {
  it('does not present hard-coded returns, fiat worth, portfolio holdings, or absolute ledger guarantees as personal facts', () => {
    expect(source).not.toContain('+4.8% 24h');
    expect(source).not.toContain('179,460,000');
    expect(source).not.toContain('100% 무손실 원장 보호');
    expect(source).not.toContain('w-[62%]');
    expect(source).not.toContain('현금 62%');
  });

  it('offers an explicit unavailable state when the real stock feed is empty', () => {
    expect(source).toContain('selectTopMovers(rawStocks)');
    expect(source).toContain('movers.length === 0');
  });
});
