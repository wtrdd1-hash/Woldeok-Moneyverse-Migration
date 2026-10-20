import type { BlogPost } from './blog.types';

export type BlogLocale = 'ko' | 'en' | 'ja' | 'zh';

// Temporary fail-closed editorial policy: migrated AI posts have no review receipt.
// Never equate an AI-generated article with a source-verified, approved publication.
// A future explicit approval schema must replace this gate before reviewed AI drafts publish.
export function isBlogDiscoverable(post: BlogPost): boolean {
  return post.isAiGenerated === false;
}

const ALIASES: Readonly<Record<string, string>> = {
  '2026-10-14-compound-interest-wealth-secret': '2026-10-14-compound-mv83xp86',
};

export function canonicalBlogSlug(slug: string): string {
  return ALIASES[slug] ?? slug;
}
export function isCanonicalBlogSlug(slug: string): boolean {
  return canonicalBlogSlug(slug) === slug;
}
export function blogUrl(slug: string, locale: BlogLocale): string {
  const prefix = locale === 'ko' ? '' : '/' + locale;
  return 'https://easy-scraping.com' + prefix + '/blog/' + encodeURIComponent(canonicalBlogSlug(slug));
}
export function blogHubUrl(locale: BlogLocale): string {
  return 'https://easy-scraping.com' + (locale === 'ko' ? '' : '/' + locale) + '/blog';
}
export function hasCountryEdition(post: BlogPost, locale: BlogLocale): boolean {
  if (locale === 'ko') return true;
  return Boolean(post.translations?.[locale]?.content?.trim());
}
export function blogAlternateLanguages(post: BlogPost): Record<string, string> {
  const languages: Record<string, string> = { 'ko-KR': blogUrl(post.slug, 'ko') };
  for (const [locale, code] of [['en', 'en-US'], ['ja', 'ja-JP'], ['zh', 'zh-CN']] as const) {
    if (hasCountryEdition(post, locale)) languages[code] = blogUrl(post.slug, locale);
  }
  return languages;
}
export function getBlogCountryEdition(post: BlogPost, locale: BlogLocale): BlogPost | undefined {
  if (!hasCountryEdition(post, locale)) return undefined;
  if (locale === 'ko') return post;
  const translated = post.translations?.[locale];
  if (!translated) return undefined;
  // A localized article must never send readers to an unlocalized KRW-only
  // calculator. Link to the reviewed local tool or to its translated hub.
  const calculator = post.slug === 'country-guide-loan'
    ? `/${locale}/tools/loan-interest-calculator`
    : post.slug === 'country-guide-compound'
      ? `/${locale}/tools/compound-interest-calculator`
      : `/${locale}/tools`;
  return {
    ...post, ...translated,
    relatedCalculatorHref: calculator,
    relatedCalculatorName: ({
      en: 'Financial calculators', ja: '金融計算ツール', zh: '金融计算工具',
    })[locale],
    categoryLabel: ({
      en: 'Financial education', ja: '金融の基礎知識', zh: '金融知识',
    })[locale],
    author: {
      ...post.author,
      name: ({ en: 'Woldeok Finance Editorial', ja: 'Woldeok 金融編集部', zh: 'Woldeok 金融编辑部' })[locale],
      role: ({ en: 'Source-based educational content', ja: '公式資料に基づく金融教育', zh: '基于官方资料的金融教育' })[locale],
    },
  };
}
export function countryBlogPosts(posts: readonly BlogPost[], locale: BlogLocale): BlogPost[] {
  return posts.flatMap(post => {
    const translated = getBlogCountryEdition(post, locale);
    return translated ? [translated] : [];
  });
}
