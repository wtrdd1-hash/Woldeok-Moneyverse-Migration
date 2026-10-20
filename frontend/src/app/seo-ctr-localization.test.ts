import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = (p: string) => readFileSync(path.join(process.cwd(), 'src', p), 'utf8');

describe('Search CTR locale quality boundaries v990', () => {
  it('has a real translated loan calculator page instead of Korean rewrites', () => {
    const proxy = src('proxy.ts');
    expect(proxy).toContain("cleanRest === '/tools/loan-interest-calculator'");
    const page = src('app/[locale]/tools/loan-interest-calculator/page.tsx');
    expect(page).toContain('generateMetadata');
    expect(page).toContain('LocalizedLoanCalculator');
    expect(page).toContain('canonicalUrl');
  });

  it('keeps Korean formulas from being used as foreign-language descriptions', () => {
    const glossary = src('app/[locale]/guide/glossary/[term]/page.tsx');
    expect(glossary).toContain('getLocalizedGlossaryFormula');
    expect(glossary).not.toContain('Formula: ${item.formula');
    expect(glossary).not.toContain('item.formulaDescriptionKo &&');
  });

  it('redirects malformed language prefixes before physical locale route matching', () => {
    const proxy = src('proxy.ts');
    expect(proxy).toContain('normalizeDoubleLocalePath(pathname)');
    expect(proxy).toContain('NextResponse.redirect(localeCanonicalUrl, 308)');
  });
});
