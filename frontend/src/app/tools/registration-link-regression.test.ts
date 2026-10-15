import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const calculatorPages = [
  'salary-calculator',
  'isa-calculator',
  'pension-tax-calculator',
  'youth-leap-calculator',
];

describe('calculator registration navigation', () => {
  it('links from calculators to the real registration route', () => {
    for (const slug of calculatorPages) {
      const page = readFileSync(new URL(`./${slug}/page.tsx`, import.meta.url), 'utf8');
      expect(page, `${slug} should not link to a missing auth route`).not.toContain('href="/auth/register"');
      expect(page, `${slug} must link to the implemented registration page`).toContain('href="/register"');
    }
  });
});
