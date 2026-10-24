import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BondRedemptionPreview } from './bond-redemption-preview';

const quote = {
  bondId: '0a0a0a0a-0000-4000-8000-000000000001',
  bondName: '7-day virtual bond',
  principalAmount: '100000000000000000000',
  maturityAmount: '103000000000000000000',
  currentCashBalance: '900719925474099312345678901234567890',
  projectedCashBalance: '900719925474099415345678901234567890',
  maturityAt: '2026-10-25T00:00:00.000Z',
  maturityStatus: 'MATURED' as const,
  eligibleForRedemption: true,
  previewOnly: true as const,
  payoutGuaranteed: false as const,
};

describe('verified bond redemption preview UI', () => {
  it('shows exact WLD strings and explicitly disclaims a confirmed payout', () => {
    const html = renderToStaticMarkup(<BondRedemptionPreview preview={quote} locale="ko" />);
    expect(html).toContain('103,000,000,000,000,000,000');
    expect(html).toContain('900,719,925,474,099,415,345,678,901,234,567,890');
    expect(html).toContain('미리보기');
    expect(html).toContain('aria-labelledby="bond-preview-title"');
    expect(html).toContain('role="status"');
    expect(html).toContain('min-h-11');
    expect(html).not.toContain('지급 완료');
    expect(html).not.toContain('<form');
  });

  it('shows a locked state without an actionable payout claim', () => {
    const html = renderToStaticMarkup(<BondRedemptionPreview preview={{ ...quote, eligibleForRedemption: false, maturityStatus: 'LOCKED' }} locale="en" />);
    expect(html).toContain('Locked');
    expect(html).not.toContain('<form');
  });
});
