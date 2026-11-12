import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./inventory-view.tsx', import.meta.url), 'utf8');

describe('inventory category filter accessibility', () => {
  it('exposes the active category as a pressed state for assistive technology', () => {
    expect(source).toMatch(/aria-pressed=\{isSelected\}/);
  });

  it('keeps category filter touch targets at least 44px high', () => {
    expect(source).toMatch(/min-h-11[^']*px-3\.5/);
  });

  it('announces category result changes without stealing focus', () => {
    expect(source).toMatch(/role="status" aria-live="polite"/);
    expect(source).toMatch(/filtered\.length/);
  });
});
