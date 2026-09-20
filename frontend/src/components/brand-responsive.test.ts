import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('responsive brand visibility', () => {
  const brand = readFileSync(join(__dirname, 'brand.tsx'), 'utf8');
  const header = readFileSync(join(__dirname, 'site-header.tsx'), 'utf8');

  it('keeps the brand in the DOM and visible across mobile and desktop breakpoints', () => {
    expect(brand).toContain('inline-flex min-h-11 items-center');
    expect(brand).toContain('text-xs min-[400px]:text-sm sm:text-base');
    expect(brand).not.toContain('window.innerWidth');
    expect(brand).not.toContain('matchMedia');
  });

  it('progressively hides secondary controls on narrow screens and restores them by CSS', () => {
    expect(header).toContain('hidden min-[420px]:block');
    expect(header).toContain('lg:hidden');
    expect(header).toContain('hidden items-center gap-4 xl:gap-5 lg:flex');
    expect(header).toContain('whitespace-nowrap');
  });
});

describe('mobile touch targets', () => {
  const brand = readFileSync(join(__dirname, 'brand.tsx'), 'utf8');
  const header = readFileSync(join(__dirname, 'site-header.tsx'), 'utf8');

  it('keeps primary header controls at the 44px mobile target floor', () => {
    expect(brand).toContain('min-h-11');
    expect(header).toContain('className="size-11 rounded-[10px] lg:hidden shrink-0"');
    expect(header).toContain('className="h-11 rounded-[10px] sm:rounded-[12px]');
  });
});
