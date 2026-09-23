import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = readFileSync(join(process.cwd(), 'src/app/search/page.tsx'), 'utf8');

describe('global search page integration', () => {
  it('searches the authoritative public shop catalogue instead of routes only', () => {
    expect(page).toContain('/api/v1/shop/public-catalog?q=');
    expect(page).toContain('catalog?.catalogItems.slice(0, 6)');
    expect(page).toContain('상점 상품 {catalogResults.length}개');
  });

  it('keeps result interactions mobile-sized and announces updated results', () => {
    expect(page).toContain('aria-live="polite"');
    expect(page).toContain('className="min-h-11 w-full"');
  });

  it('does not show the empty state when catalogue matches exist', () => {
    expect(page).toContain('results.length === 0 && catalogResults.length === 0');
  });
});
