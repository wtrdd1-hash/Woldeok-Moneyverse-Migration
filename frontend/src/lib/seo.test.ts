import { describe, expect, it } from 'vitest';
import {
  APP_BASE_URL,
  SITE_NAME,
  canonicalUrl,
  breadcrumbJsonLd,
  faqPageJsonLd,
  webApplicationJsonLd,
  forumPostingJsonLd,
  buildOgImageUrl,
  buildUrlsetXml,
  buildSitemapIndexXml,
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

describe('SEO utility: buildOgImageUrl', () => {
  it('encodes parameters properly into /api/og URL', () => {
    const url = buildOgImageUrl({
      title: '테스트 공지사항',
      description: '공지 내용 요약입니다.',
      type: 'announcement',
      badge: '운영 소식',
      metric: '2026-09-21',
      metricLabel: '발행일',
    });

    expect(url).toContain(`${APP_BASE_URL}/api/og?`);
    expect(url).toContain('title=%ED%85%8C%EC%8A%A4%ED%8A%B8+%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD');
    expect(url).toContain('type=announcement');
    expect(url).toContain('badge=%EC%9A%B4%EC%98%81+%EC%86%8C%EC%8B%9D');
    expect(url).toContain('metric=2026-09-21');
  });
});

describe('SEO utility: XML Sitemap builders', () => {
  it('builds standard urlset XML', () => {
    const xml = buildUrlsetXml([
      {
        loc: 'https://easy-scraping.com/stocks',
        lastmod: '2026-09-21T00:00:00.000Z',
        changefreq: 'daily',
        priority: 0.9,
      },
    ]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://easy-scraping.com/stocks</loc>');
    expect(xml).toContain('<lastmod>2026-09-21T00:00:00.000Z</lastmod>');
    expect(xml).toContain('<changefreq>daily</changefreq>');
    expect(xml).toContain('<priority>0.9</priority>');
    expect(xml).toContain('</urlset>');
  });

  it('builds standard sitemapindex XML', () => {
    const xml = buildSitemapIndexXml([
      {
        loc: 'https://easy-scraping.com/sitemap-static.xml',
        lastmod: '2026-09-21T00:00:00.000Z',
      },
      {
        loc: 'https://easy-scraping.com/sitemap-announcements.xml',
      },
    ]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://easy-scraping.com/sitemap-static.xml</loc>');
    expect(xml).toContain('<loc>https://easy-scraping.com/sitemap-announcements.xml</loc>');
    expect(xml).toContain('</sitemapindex>');
  });
});

