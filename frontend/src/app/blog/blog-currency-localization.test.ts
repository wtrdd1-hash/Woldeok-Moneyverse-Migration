import { describe, expect, it } from 'vitest';
import { createCountryBlogPost } from './blog-country-editorial';
import { getBlogCountryEdition } from './blog-seo';

describe('Blog country edition routes v990', () => {
  it('links to translated loan and compound calculators by country', () => {
    for (const locale of ['en','ja','zh'] as const) {
      expect(getBlogCountryEdition(createCountryBlogPost('loan'),locale)?.relatedCalculatorHref)
        .toBe(`/${locale}/tools/loan-interest-calculator`);
      expect(getBlogCountryEdition(createCountryBlogPost('compound'),locale)?.relatedCalculatorHref)
        .toBe(`/${locale}/tools/compound-interest-calculator`);
    }
  });
  it('does not link foreign-market articles directly into Korean-only finance calculator pages', () => {
    for (const locale of ['en','ja','zh'] as const) {
      expect(getBlogCountryEdition(createCountryBlogPost('tax'),locale)?.relatedCalculatorHref).toBe(`/${locale}/tools`);
    }
  });
});
