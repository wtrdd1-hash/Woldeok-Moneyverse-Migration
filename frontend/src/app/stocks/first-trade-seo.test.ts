import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stocksPageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

describe('first-trade SEO claim integrity', () => {
  it('does not promise an unverified 10,000 WLD onboarding credit in public metadata', () => {
    expect(stocksPageSource).not.toContain('가입 즉시 1만 WLD 지급!');
  });

  it('preserves the public stock market canonical and indexable metadata', () => {
    expect(stocksPageSource).toContain("canonical: '/stocks'");
    expect(stocksPageSource).toContain('robots: { index: true, follow: true }');
  });
});
