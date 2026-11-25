import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regression 2026-11-25: all four /api/v1/central-bank/* reads answer 404 on
 * the production Spring API, and the page filled the gaps with invented
 * figures (3.5%, 2.0%, 7.0%, 3.2%/5.2%, 1.00배, 100.0%).
 */
const src = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

describe('central bank page', () => {
  it('has no numeric fallback for a policy figure', () => {
    expect(src).not.toMatch(/\?\?\s*\d/);
    expect(src).not.toMatch(/\?\?\s*'(1\.00|100\.0)'/);
  });
  it('renders 확인 불가 for a figure the API did not answer', () => {
    expect(src).toContain('확인 불가');
  });
});
