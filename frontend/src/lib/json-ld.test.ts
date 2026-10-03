import { describe, it, expect } from 'vitest';
import { buildCalculatorRichSnippet, jsonLd } from './json-ld';
import { getAllPublicUrlsForIndexNow } from './indexnow';

describe('JSON-LD Rich Snippets & IndexNow Suite', () => {
  it('should safely escape < in jsonLd serializer', () => {
    const data = { title: '</script><script>alert("xss")</script>' };
    const serialized = jsonLd(data);
    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script>');
  });

  it('should build 5-tier rich snippet schemas including AggregateRating and FAQPage', () => {
    const schemas = buildCalculatorRichSnippet({
      name: '삼성전자 -20% 물타기 평단가 계산기',
      description: '삼성전자 7.5만원 고점 물림 시 평단가 낮추기 시뮬레이션',
      url: 'https://easy-scraping.com/tools/stock-calculator/samsung-minus-20',
      faqs: [
        {
          question: '삼성전자 물타기는 언제 하는 것이 좋나요?',
          answer: '지지선 부근에서 분할 매수하는 것이 안전합니다.',
        },
      ],
      howToSteps: [
        { name: '1단계', text: '현재 평단가와 보유 수량을 입력합니다.' },
        { name: '2단계', text: '추가 매수할 금액을 설정하고 계산합니다.' },
      ],
    });

    expect(schemas.length).toBe(4);

    // 1. WebApplication Schema with AggregateRating
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp['@type']).toBe('WebApplication');
    expect(webApp['name']).toBe('삼성전자 -20% 물타기 평단가 계산기');
    const aggRating = webApp['aggregateRating'] as Record<string, string>;
    expect(aggRating.ratingValue).toBe('4.9');
    expect(aggRating.ratingCount).toBe('12480');

    // 2. FAQPage Schema
    const faq = schemas[1] as Record<string, unknown>;
    expect(faq['@type']).toBe('FAQPage');

    // 3. HowTo Schema
    const howTo = schemas[2] as Record<string, unknown>;
    expect(howTo['@type']).toBe('HowTo');

    // 4. BreadcrumbList Schema
    const breadcrumbs = schemas[3] as Record<string, unknown>;
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
  });

  it('should generate over 300 public URLs for IndexNow batch indexing', () => {
    const urls = getAllPublicUrlsForIndexNow();
    expect(urls.length).toBeGreaterThan(300);
    expect(urls).toContain('https://easy-scraping.com/spaces');
    expect(urls).toContain('https://easy-scraping.com/spaces/real-estate');
    expect(urls).toContain('https://easy-scraping.com/tools/stock-calculator/samsung-minus-20');
    expect(urls).toContain('https://easy-scraping.com/tools/compound-calculator/10m-3y-5p');
  });
});
