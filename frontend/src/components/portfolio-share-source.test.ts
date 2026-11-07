// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('member portfolio share source and privacy contract', () => {
  const page = readFileSync(new URL('../app/stocks/portfolio/page.tsx', import.meta.url), 'utf8');
  const modal = readFileSync(new URL('./portfolio-share-card-modal.tsx', import.meta.url), 'utf8');
  const trigger = readFileSync(new URL('./portfolio-share-trigger.tsx', import.meta.url), 'utf8');

  it('passes exact authoritative integer strings to the share UI', () => {
    expect(page).toContain('totalAssetValue={analysis.total_market_value}');
    expect(page).toContain('totalProfitAmount={analysis.total_unrealized_gain_loss}');
    expect(page).toContain('profitRateBps={analysis.total_gain_loss_bps}');
    expect(trigger).toContain('readonly totalAssetValue: string');
  });

  it('never represents a user-generated screenshot as a signed ledger receipt', () => {
    expect(modal).not.toMatch(/OFFICIAL PORTFOLIO RECEIPT|VERIFIED BY WOLDEOK INSTITUTIONAL LEDGER ENGINE|BLOCK TIMESTAMP|0x9f4a|원장 공인 인증/);
    expect(modal).toContain('USER-GENERATED PORTFOLIO SNAPSHOT');
    expect(modal).toContain('원장 인증 영수증이 아닙니다');
  });

  it('keeps member gate, noindex metadata and accessible image controls', () => {
    expect(page).toContain('await requireMember()');
    expect(page).toContain('robots: { index: false, follow: false }');
    expect(modal).toContain('aria-label=');
    expect(modal).toContain('min-h-11');
  });
});
