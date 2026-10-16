import type { BlogPost } from './blog.types';

export type BlogLocale = 'ko' | 'en' | 'ja' | 'zh';
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
  return post.slug.startsWith('country-guide-') && Boolean(post.translations?.[locale]?.content?.trim());
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
  return translated ? { ...post, ...translated } : undefined;
}
export function countryBlogPosts(posts: readonly BlogPost[], locale: BlogLocale): BlogPost[] {
  return posts.flatMap(post => {
    const translated = getBlogCountryEdition(post, locale);
    return translated ? [translated] : [];
  });
}
