// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { generateDailyAiBlogPost } from './blog-data';
import { createCountryBlogPost } from './blog-country-editorial';
import {
  shouldShowCompoundInlineCalculator,
  shouldShowFinancialPromotions,
  shouldShowReadership,
} from './blog-presentation-policy';
import { BlogPostClient } from './[slug]/blog-post-client';

describe('v1403 engineering article editorial separation', () => {
  it('produces topic-specific engineering content with reproducible code and primary technical references', () => {
    const draft = generateDailyAiBlogPost({ category: 'TECH', country: 'KR' });

    expect(draft.category).toBe('TECH');
    expect(draft.title).not.toContain('에디션');
    expect(draft.content.length).toBeGreaterThan(3000);
    expect(draft.content).toMatch(/PostgreSQL|OffscreenCanvas/);
    expect(draft.content).toMatch(/코드|테스트|검증/);
    expect(draft.content).toContain('https://');
    expect(draft.content).not.toContain('한국금융연구원');
    expect(draft.content).not.toContain('실시간 시장 펄스');
    expect(draft.content).not.toContain('복리 만기');
    expect(draft.content).not.toContain('42.8원');
    expect(draft.content).not.toContain('1조 회');
    expect(draft.relatedCalculatorHref).toBe('/blog');
    expect(draft.author.badge).toBe('Engineering Editor');
    expect(draft.views).toBe(0);
    expect(draft.viewCountVerified).toBeUndefined();
    expect(draft.readTimeMinutes).toBeGreaterThan(6);
  });

  it('refuses unsupported country-labelled copies of Korean engineering content', () => {
    for (const country of ['US', 'JP', 'VN'] as const) {
      expect(() => generateDailyAiBlogPost({ category: 'TECH', country }))
        .toThrow('TECH_LOCALIZATION_REVIEW_REQUIRED');
    }
  });

  it('keeps irrelevant finance widgets and promotions out of TECH articles, including legacy posts', () => {
    const engineering = generateDailyAiBlogPost({ category: 'TECH', country: 'KR' });
    const legacy = { ...engineering, relatedCalculatorHref: '/tools/compound-calculator' };
    expect(shouldShowCompoundInlineCalculator(engineering)).toBe(false);
    expect(shouldShowCompoundInlineCalculator(legacy)).toBe(false);
    expect(shouldShowFinancialPromotions(legacy)).toBe(false);

    const html = renderToStaticMarkup(<BlogPostClient post={legacy} locale="ko" />);
    expect(html).not.toContain('인터랙티브 실전 복리 시뮬레이터');
    expect(html).not.toContain('복리 정기예금 금고');
    expect(html).not.toContain('10,000 WLD 받고');
    expect(html).not.toContain('조회 0 회');
    expect(html).toMatch(/PostgreSQL|Canvas/);
  });

  it('preserves the appropriate compound finance calculator and financial education paths', () => {
    const compound = createCountryBlogPost('compound');
    expect(shouldShowCompoundInlineCalculator(compound)).toBe(true);
    expect(shouldShowFinancialPromotions(compound)).toBe(true);

    const html = renderToStaticMarkup(<BlogPostClient post={compound} locale="ko" />);
    expect(html).toContain('인터랙티브 실전 복리 시뮬레이터');
    expect(html).toContain('복리 정기예금 금고');
  });

  it('does not present unverified view counts as real metrics', () => {
    expect(shouldShowReadership({ views: 58 })).toBe(false);
    expect(shouldShowReadership({ views: 58, viewCountVerified: true })).toBe(true);
    expect(shouldShowReadership({ views: -1, viewCountVerified: true })).toBe(false);
  });
});
