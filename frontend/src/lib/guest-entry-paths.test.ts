import { describe, expect, it } from 'vitest';
import { getGuestEntryPaths } from './guest-entry-paths';

describe('v921 public value before signup', () => {
  it('uses the actual Korean public compound calculator, glossary and guide', () => {
    expect(getGuestEntryPaths('ko')).toEqual({
      calculator: '/tools/compound-calculator',
      glossary: '/guide/glossary',
      features: '/features',
    });
  });

  it.each(['en', 'ja', 'zh'] as const)('uses genuine translated public calculators for %s', (locale) => {
    expect(getGuestEntryPaths(locale)).toEqual({
      calculator: `/${locale}/tools/compound-interest-calculator`,
      glossary: `/${locale}/guide/glossary`,
      features: '/features',
    });
  });

  it('never requires an account or promises a bank deposit to view a public example', () => {
    for (const locale of ['ko', 'en', 'ja', 'zh'] as const) {
      for (const path of Object.values(getGuestEntryPaths(locale))) {
        expect(path).toMatch(/^\//);
        expect(path).not.toContain('/bank');
        expect(path).not.toContain('/login');
        expect(path).not.toContain('/wallet');
      }
    }
  });
});
