import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const page = readFileSync(join(process.cwd(), 'src/app/bonds/page.tsx'), 'utf8');
const client = readFileSync(join(process.cwd(), 'src/app/bonds/bonds-portal-client.tsx'), 'utf8');
describe('public bond UI provenance and accessibility', () => {
  it('does not invent public yields when the server is unavailable', () => {
    expect(page).toContain('verifyBondMarkets(');
    expect(page).toContain('국채 시장 정보를 확인할 수 없습니다');
    expect(page).not.toContain("benchmark1YYield: '4.50%'");
    expect(page).toContain('role="alert"');
  });
  it('labels virtual-only securities and uses actual bond count rather than a fixed three', () => {
    expect(client).toContain('게임 내 가상 채권');
    expect(client).not.toContain('SOVEREIGN AAA GUARANTEE');
    expect(client).not.toContain('3 ACTIVE BONDS');
    expect(client).toContain('bonds.length');
  });
  it('does not enable subscription for closed, frozen or sold-out bonds', () => {
    expect(client).toContain("disabled={!BOND_SETTLEMENT_ENABLED || holdingsStatus !== 'verified' || bond.status !== 'OPEN_SUBSCRIPTION' || available === BigInt(0)}");
    expect(client).not.toContain('AAA 국가 원리금 전액 보증');
    expect(client).not.toContain('무위험 국채');
  });
  it('keeps member trading on the existing authenticated API and accessible controls', () => {
    expect(client).toContain("fetch('/api/bonds/subscribe'");
    expect(client).toContain('min-h-11');
    expect(page).toContain('robots:');
  });
});
