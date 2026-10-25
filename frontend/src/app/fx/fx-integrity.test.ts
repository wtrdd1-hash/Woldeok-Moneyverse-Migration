import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('./layout.tsx', import.meta.url), 'utf8');

describe('FX portal finance truth and accessibility', () => {
  it('uses the same-origin validated read gateway and never posts unjournaled swaps or forwards', () => {
    expect(page).toContain('/api/fx/portal');
    expect(page).not.toContain('/api/v1/fx/');
    expect(page).not.toContain("method: 'POST'");
    expect(page).not.toContain('1352.5');
  });

  it('distinguishes unavailable server data and makes trading hold visible to assistive tech', () => {
    expect(page).toContain('role="status"');
    expect(page).toContain('aria-live="polite"');
    expect(page).toContain('min-h-[44px]');
    expect(page).toContain('거래 중단');
  });

  it('does not advertise real-world banking affiliation or guaranteed yields in SEO', () => {
    expect(layout).not.toContain('한국은행 중앙은행 공식 연동');
    expect(layout).not.toContain('연 4.5%');
    expect(layout).not.toContain('1초 즉시 환전');
  });
});
