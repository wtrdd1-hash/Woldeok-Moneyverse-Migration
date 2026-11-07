// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/app/stocks/league/page.tsx', 'utf8');
const client = readFileSync('src/app/stocks/league/stocks-league-client.tsx', 'utf8');
const bridge = readFileSync('src/app/api/stocks/league/route.ts', 'utf8');
const subscribe = readFileSync('src/app/api/stocks/league/copy-trade/subscribe/route.ts', 'utf8');
const config = readFileSync('next.config.ts', 'utf8');
const proxy = readFileSync('src/proxy.ts', 'utf8');

describe('stock league source integrity regression', () => {
  it('does not manufacture traders or a member subscription on fetch failure', () => {
    expect(client).not.toContain('defaultWhales');
    expect(client).not.toContain('whale-01');
    expect(client).not.toContain('setMySubscriptions');
  });

  it('never advertises unverified ROI, active copy trading or fee settlement', () => {
    expect(page).not.toContain('+184%');
    expect(page).not.toContain('원클릭 1:1 자동');
    expect(page).not.toContain('성공 보수');
    expect(client).not.toContain('184.2');
    expect(client).not.toContain('1,480,000 WLD');
    expect(client).not.toContain('24 명 (Traders)');
  });

  it('fails closed at the Next subscription edge, before any write', () => {
    expect(subscribe).toContain('COPY_TRADING_LEDGER_UNAVAILABLE');
    expect(subscribe).not.toContain("'/api/v1/stocks/league/copy-trade/subscribe'");
  });

  it('marks optional-owner GET results private and noindex at the HTTP edge', () => {
    expect(bridge).toContain('private, no-store');
    expect(bridge).toContain('noindex, nofollow');
    expect(bridge).toContain('no-referrer');
  });

  it('protects the actual Next HTTP header for the league route and localized variants', () => {
    expect(config).toContain("'/stocks/league', '/:locale/stocks/league'");
    expect(config).toContain("'/api/stocks/league/:path*'");
    expect(config).toContain("'/app-api/v1/stocks/league/:path*'");
    expect(proxy).toContain("targetPath === '/stocks/league'");
  });

  it('exposes a real server source and a keyboard-accessible retry path', () => {
    expect(page).toContain("'/api/v1/stocks/league/current'");
    expect(page).toContain('parseLeagueSource');
    expect(client).toContain('aria-live');
    expect(client).toContain('href="/stocks/league"');
  });
});
