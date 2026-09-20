import { describe, expect, it } from 'vitest';
import {
  APP_BASE_URL,
  SITE_NAME,
  canonicalUrl,
  breadcrumbJsonLd,
  faqPageJsonLd,
  webApplicationJsonLd,
  forumPostingJsonLd,
} from './seo';

describe('SEO utility: canonicalUrl', () => {
  it('normalizes root path to base URL without trailing slash', () => {
    expect(canonicalUrl('')).toBe(APP_BASE_URL);
    expect(canonicalUrl('/')).toBe(APP_BASE_URL);
  });

  it('normalizes subpaths with or without leading/trailing slashes', () => {
    expect(canonicalUrl('/guide')).toBe(`${APP_BASE_URL}/guide`);
    expect(canonicalUrl('guide')).toBe(`${APP_BASE_URL}/guide`);
    expect(canonicalUrl('/guide/')).toBe(`${APP_BASE_URL}/guide`);
    expect(canonicalUrl('/stocks/WLD/')).toBe(`${APP_BASE_URL}/stocks/WLD`);
  });
});

describe('SEO utility: JSON-LD builders', () => {
  it('builds valid BreadcrumbList schema', () => {
    const breadcrumb = breadcrumbJsonLd([
      { name: '홈', path: '/' },
      { name: '시작 가이드', path: '/guide' },
    ]);

    expect(breadcrumb['@context']).toBe('https://schema.org');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: '홈',
      item: APP_BASE_URL,
    });
    expect(breadcrumb.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: '시작 가이드',
      item: `${APP_BASE_URL}/guide`,
    });
  });

  it('builds valid FAQPage schema', () => {
    const faq = faqPageJsonLd([
      { question: 'WLD는 현금인가요?', answer: '게임 전용 가상 데이터입니다.' },
      { question: '출석 보상은 어떻게 받나요?', answer: '일일 퀘스트를 완료하면 지급됩니다.' },
    ]);

    expect(faq['@context']).toBe('https://schema.org');
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity).toHaveLength(2);
    expect(faq.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'WLD는 현금인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '게임 전용 가상 데이터입니다.',
      },
    });
  });

  it('builds valid WebApplication schema', () => {
    const webApp = webApplicationJsonLd();
    expect(webApp['@type']).toBe('WebApplication');
    expect(webApp['@id']).toBe(`${APP_BASE_URL}/#webapp`);
    expect(webApp.name).toBe(SITE_NAME);
    expect(webApp.applicationCategory).toBe('GameApplication');
    expect(webApp.offers['@type']).toBe('Offer');
    expect(webApp.offers.price).toBe('0');
  });

  it('builds valid DiscussionForumPosting schema', () => {
    const postSchema = forumPostingJsonLd({
      postId: 'post_123',
      title: '첫 주식 투자 후기',
      body: 'WLD로 주식을 사보았는데 신기하네요.',
      authorName: '테스터1',
      createdAt: '2026-09-20T12:00:00Z',
    });

    expect(postSchema['@context']).toBe('https://schema.org');
    expect(postSchema['@type']).toBe('DiscussionForumPosting');
    expect(postSchema['@id']).toBe(`${APP_BASE_URL}/board/post_123`);
    expect(postSchema.headline).toBe('첫 주식 투자 후기');
    expect(postSchema.author).toEqual({
      '@type': 'Person',
      name: '테스터1',
    });
    expect(postSchema.publisher).toEqual({
      '@type': 'Organization',
      '@id': `${APP_BASE_URL}/#organization`,
      name: SITE_NAME,
    });
  });
});
