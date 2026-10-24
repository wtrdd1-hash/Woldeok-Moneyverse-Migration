import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/app/calendar/page.tsx', 'utf8');

describe('member calendar deadline integration', () => {
  it('compares backend catalogue sale deadlines with the SSR request clock', () => {
    expect(page).toContain('upcomingShopDeadlines(shopData?.catalogItems ?? [], Date.now())');
    expect(page).toContain("'/api/v1/shop/catalog'");
  });

  it('provides item-specific accessible shop links with touch targets', () => {
    expect(page).toContain('aria-label={`${item.name} 상품을 상점에서 확인하기`}');
    expect(page).toContain('min-h-11');
    expect(page).toContain('focus-visible:ring-2');
  });

  it('keeps the member-only calendar non-indexable', () => {
    expect(page).toContain('await requireMember()');
    expect(page).toContain('robots: { index: false, follow: false }');
  });
});
