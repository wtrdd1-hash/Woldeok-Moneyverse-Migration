// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync('src/app/stocks/league/page.tsx', 'utf8');
const subscribeRoute = readFileSync('src/app/api/stocks/league/copy-trade/subscribe/route.ts', 'utf8');
const cancelRoute = readFileSync('src/app/api/stocks/league/copy-trade/cancel/route.ts', 'utf8');

describe('verified read-only stock league', () => {
  it('uses the existing server-backed league API and non-indexable metadata', () => {
    expect(pageSource).toContain('/api/v1/stocks/league/current');
    expect(pageSource).toContain('index: false');
    expect(pageSource).toContain('projectLeague');
    expect(pageSource).not.toContain('StocksLeagueClient');
  });
  it('does not advertise fictional 184% returns or pretend a copy trade is active', () => {
    expect(pageSource).not.toContain('184%');
    expect(pageSource).not.toContain('원클릭 1:1 자동');
    expect(pageSource).toContain('거래 기능');
  });
  it('fails closed at both browser mutation gateways', () => {
    expect(subscribeRoute).toContain('status: 503');
    expect(cancelRoute).toContain('status: 503');
    expect(subscribeRoute).not.toContain("method: 'POST'");
    expect(cancelRoute).not.toContain("method: 'POST'");
  });
});
