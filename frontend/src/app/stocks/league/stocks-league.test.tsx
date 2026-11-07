// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/app/stocks/league/page.tsx', 'utf8');
const client = readFileSync('src/app/stocks/league/stocks-league-client.tsx', 'utf8');

describe('Stocks league source-based read-only UI', () => {
  it('uses the existing Nest source rather than synthetic whale profiles', () => {
    expect(page).toContain('parseLeagueSource');
    expect(page).toContain('StocksLeagueClient');
    expect(client).not.toContain('defaultWhales');
  });
  it('does not offer copy-trading subscription until ledger settlement exists', () => {
    expect(page).toContain('원장 검증 전까지');
    expect(client).not.toContain('handleSubscribe');
    expect(client).not.toContain('setMySubscriptions');
  });
  it('preserves a verified empty state, unknown state and accessible retry', () => {
    expect(client).toContain('league === null');
    expect(client).toContain('league.season === null');
    expect(client).toContain('aria-live');
    expect(client).toContain('href="/stocks/league"');
  });
});
