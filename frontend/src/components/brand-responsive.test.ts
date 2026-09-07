import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('responsive brand visibility', () => {
  const brand = readFileSync(join(__dirname, 'brand.tsx'), 'utf8');
  const header = readFileSync(join(__dirname, 'site-header.tsx'), 'utf8');

  it('keeps the brand in the DOM and switches visibility with CSS breakpoints', () => {
    expect(brand).toContain('hidden min-[360px]:inline-flex');
    expect(brand).toContain('hidden min-[520px]:inline-flex');
    expect(brand).not.toContain('window.innerWidth');
    expect(brand).not.toContain('matchMedia');
  });

  it('progressively hides secondary controls on narrow screens and restores them by CSS', () => {
    expect(header).toContain('hidden min-[420px]:block');
    expect(header).toContain('lg:hidden');
    expect(header).toContain('hidden items-center gap-6 lg:flex');
  });
});
