import { jsonLd } from './json-ld';

export const APP_BASE_URL = (
  process.env.APP_BASE_URL || 'https://easy-scraping.com'
).replace(/\/$/, '');

export const SITE_NAME = '월덕 머니버스';
export const SITE_NAME_EN = 'Woldeok Moneyverse';
export const SITE_DESCRIPTION =
  '월덕 머니버스는 Discord 커뮤니티와 연결된 가상경제·커뮤니티 게임 서비스입니다. 활동 기록과 WLD 게임 보상, 상점, 주식, 퀘스트, 시즌 이벤트를 한곳에서 살펴보고 커뮤니티와 함께 성장하는 게임 경제를 경험하세요.';

/**
 * Turns any relative or absolute path into an absolute, normalized canonical URL without trailing slash.
 */
export function canonicalUrl(path = ''): string {
  if (!path || path === '/') {
    return APP_BASE_URL;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const withoutTrailing = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  return `${APP_BASE_URL}${withoutTrailing}`;
}

export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}

/**
 * Schema.org BreadcrumbList generator
 */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/**
 * Schema.org FAQPage generator for Google Rich Results
 */
export function faqPageJsonLd(faqs: readonly FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Schema.org WebApplication / SoftwareApplication schema
 */
export function webApplicationJsonLd() {
  return {
    '@type': 'WebApplication',
    '@id': `${APP_BASE_URL}/#webapp`,
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: APP_BASE_URL,
    applicationCategory: 'GameApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: SITE_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    featureList: [
      'Discord 커뮤니티 연동 가상 경제',
      'WLD 게임 토큰 및 은행 복리 예금',
      '가상 주식 거래소 및 실시간 차트',
      '5개 전문 직업 및 업무 시뮬레이션',
      '아이템 상점 및 커뮤니티 갤러리',
    ],
  };
}

export interface ForumPostData {
  readonly postId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName?: string;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
}

/**
 * Schema.org DiscussionForumPosting for community board
 */
export function forumPostingJsonLd(post: ForumPostData) {
  const url = canonicalUrl(`/board/${post.postId}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    '@id': url,
    headline: post.title,
    articleBody: post.body,
    url,
    datePublished: post.createdAt,
    dateModified: post.updatedAt ?? post.createdAt,
    author: {
      '@type': 'Person',
      name: post.authorName || '커뮤니티 회원',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${APP_BASE_URL}/#organization`,
      name: SITE_NAME,
    },
  };
}

export interface OgImageOptions {
  readonly title: string;
  readonly description?: string | undefined;
  readonly badge?: string | undefined;
  readonly type?: 'stock' | 'board' | 'announcement' | 'quest' | 'default' | undefined;
  readonly metric?: string | undefined;
  readonly metricLabel?: string | undefined;
  readonly subMetric?: string | undefined;
}


/**
 * Builds an absolute dynamic Open Graph Image URL with encoded metadata parameters.
 */
export function buildOgImageUrl(options: OgImageOptions): string {
  const params = new URLSearchParams();
  params.set('title', options.title);
  if (options.description) params.set('description', options.description);
  if (options.badge) params.set('badge', options.badge);
  if (options.type) params.set('type', options.type);
  if (options.metric) params.set('metric', options.metric);
  if (options.metricLabel) params.set('metricLabel', options.metricLabel);
  if (options.subMetric) params.set('subMetric', options.subMetric);
  return canonicalUrl(`/api/og?${params.toString()}`);
}

export interface SitemapUrlEntry {
  readonly loc: string;
  readonly lastmod?: string | undefined;
  readonly changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
    | undefined;
  readonly priority?: number | undefined;
}


/**
 * Builds standard XML urlset string for sitemaps.
 */
export function buildUrlsetXml(entries: readonly SitemapUrlEntry[]): string {
  const urls = entries
    .map((e) => {
      const lastmodTag = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '';
      const changefreqTag = e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : '';
      const priorityTag =
        typeof e.priority === 'number' ? `\n    <priority>${e.priority.toFixed(1)}</priority>` : '';
      return `  <url>\n    <loc>${e.loc}</loc>${lastmodTag}${changefreqTag}${priorityTag}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

/**
 * Builds standard XML sitemapindex string referencing sub-sitemaps.
 */
export function buildSitemapIndexXml(sitemaps: readonly { loc: string; lastmod?: string }[]): string {
  const maps = sitemaps
    .map((s) => {
      const lastmodTag = s.lastmod ? `\n    <lastmod>${s.lastmod}</lastmod>` : '';
      return `  <sitemap>\n    <loc>${s.loc}</loc>${lastmodTag}\n  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps}\n</sitemapindex>`;
}


