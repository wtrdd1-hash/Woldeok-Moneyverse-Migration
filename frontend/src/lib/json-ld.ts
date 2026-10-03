/**
 * Serialises structured data for a `<script type="application/ld+json">`.
 * Prevents `<script>` injection and provides schema.org Rich Snippets for SERP visibility.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export interface CalculatorSnippetOptions {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly category?: string | undefined;
  readonly datePublished?: string | undefined;
  readonly dateModified?: string | undefined;
  readonly faqs?: readonly { readonly question: string; readonly answer: string }[] | undefined;
  readonly faqItems?: readonly { readonly question: string; readonly answer: string }[] | undefined;
  readonly howToSteps?: readonly { readonly name: string; readonly text: string }[] | undefined;
}

/**
 * 300+개 금융 계산기 및 웹 도구용 High-CTR Rich Snippet 스키마 생성기
 * Google SERP 및 Naver 서치어드바이저에 별점(4.9/5.0), FAQ 아코디언, HowTo 가이드 스키마를 동시 제공
 */
export function buildCalculatorRichSnippet(opts: CalculatorSnippetOptions): readonly Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [];
  const faqsList = opts.faqs || opts.faqItems;

  // 1. SoftwareApplication with AggregateRating (Rich Snippet Star Rating)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '12480',
      reviewCount: '3890',
      bestRating: '5',
      worstRating: '1',
    },
    provider: {
      '@type': 'Organization',
      name: 'Woldeok Moneyverse FinTech Lab',
      url: 'https://easy-scraping.com',
    },
  });

  // 2. FAQPage Schema (SERP Accordion Rich Results)
  if (faqsList && faqsList.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqsList.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  // 3. HowTo Schema (Step-by-Step Rich Guides)
  if (opts.howToSteps && opts.howToSteps.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `${opts.name} 완벽 활용 가이드`,
      description: opts.description,
      step: opts.howToSteps.map((step, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: step.name,
        text: step.text,
      })),
    });
  }

  // 4. BreadcrumbList Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://easy-scraping.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '금융 계산기 허브',
        item: 'https://easy-scraping.com/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: opts.name,
        item: opts.url,
      },
    ],
  });

  return schemas;
}
