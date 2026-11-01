import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

describe('public gallery month discoverability', () => {
  it('provides an accessible month form, reset, scope, noindex and distinct error states', () => {
    expect(source).toContain('type="month"');
    expect(source).toContain('htmlFor="gallery-month"');
    expect(source).toContain('name="month"');
    expect(source).toContain('parseGalleryMonth');
    expect(source).toContain('robots: { index: !hasMonth');
    expect(source).toContain('최근 공개 사진 24건');
    expect(source).toContain('검색 초기화');
    expect(source).toContain('data === null');
  });
});
