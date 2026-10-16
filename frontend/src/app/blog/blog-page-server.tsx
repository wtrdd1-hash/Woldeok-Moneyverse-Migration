import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import type { BlogPost } from './blog.types';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { BlogPostClient } from './[slug]/blog-post-client';
import { BlogHubClient } from './blog-hub-client';
import { getAllBlogPosts, getBlogPostBySlug } from './blog-data';
import {
  blogAlternateLanguages, blogHubUrl, blogUrl, canonicalBlogSlug,
  countryBlogPosts, getBlogCountryEdition, isBlogDiscoverable, type BlogLocale,
} from './blog-seo';

const MARKET_NAMES: Record<BlogLocale, string> = {
  ko: '한국', en: 'United States', ja: '日本', zh: '中国',
};
const PAGE_TITLES: Record<BlogLocale, string> = {
  ko: '월덕 금융 교육 블로그 | 한국 금융 · 저축 · 투자',
  en: 'US Personal Finance Education | Woldeok Moneyverse',
  ja: '日本の金融教育ブログ | Woldeok Moneyverse',
  zh: '中国家庭金融知识 | Woldeok Moneyverse',
};
const PAGE_DESCRIPTIONS: Record<BlogLocale, string> = {
  ko: '복리, 세금, ETF, 대출, 물가, 연금의 기본 원리를 한국 제도와 공식 자료를 바탕으로 배웁니다.',
  en: 'Practical US guides to compounding, dividends, ETFs, mortgage math, CPI, and retirement, with primary sources.',
  ja: '新NISA、ETF、住宅ローン、物価、年金、積立など日本の家計に役立つ金融教育記事。',
  zh: '面向中国家庭的储蓄复利、股息税、ETF、房贷、物价、养老知识与官方参考资料。',
};

function safeHeroImage(url?: string): string | undefined {
  if (!url || !/^\/images\/blog\/[a-zA-Z0-9._/-]+\.(png|webp|jpg|jpeg|svg)$/.test(url) || url.includes('..')) {
    return undefined;
  }
  return fs.existsSync(path.join(process.cwd(), 'public', url.slice(1))) ? url : undefined;
}

export function metadataForHub(locale: BlogLocale): Metadata {
  const languages = Object.fromEntries((['ko', 'en', 'ja', 'zh'] as const).map(l => [
    ({ ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' })[l], blogHubUrl(l),
  ]));
  return {
    title: PAGE_TITLES[locale], description: PAGE_DESCRIPTIONS[locale],
    alternates: { canonical: blogHubUrl(locale), languages },
    openGraph: {
      title: PAGE_TITLES[locale], description: PAGE_DESCRIPTIONS[locale],
      url: blogHubUrl(locale), type: 'website', siteName: 'Woldeok Moneyverse',
    },
  };
}

export function metadataForArticle(slug: string, locale: BlogLocale): Metadata {
  const original = getBlogPostBySlug(slug);
  if (!original) return { title: 'Article not found', robots: { index: false, follow: false } };
  const post = getBlogCountryEdition(original, locale);
  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } };
  const canonical = blogUrl(slug, locale);
  const hero = safeHeroImage(post.heroImage);
  return {
    title: post.title, description: post.excerpt, keywords: [...post.tags],
    ...(isBlogDiscoverable(original) ? {} : { robots: { index: false, follow: true } }),
    alternates: { canonical, languages: blogAlternateLanguages(original) },
    openGraph: {
      title: post.title, description: post.excerpt, type: 'article',
      url: canonical, publishedTime: post.publishedAt, modifiedTime: post.updatedAt,
      siteName: 'Woldeok Moneyverse',
      ...(hero ? { images: [{ url: 'https://easy-scraping.com' + hero, alt: post.title }] } : {}),
    },
    twitter: { card: hero ? 'summary_large_image' : 'summary', title: post.title, description: post.excerpt },
  };
}

export function summarizeBlogPost(post: BlogPost) {
  const { slug, title, excerpt, category, categoryLabel, publishedAt, readTimeMinutes, tags, views, author, heroImage, relatedCalculatorHref, relatedCalculatorName } = post;
  return {slug,title,excerpt,category,categoryLabel,publishedAt,readTimeMinutes,tags,views,author,heroImage:safeHeroImage(heroImage),relatedCalculatorHref,relatedCalculatorName};
}
export function renderBlogHub(locale: BlogLocale) {
  const posts = countryBlogPosts(getAllBlogPosts().filter(isBlogDiscoverable), locale);
  const canonical = blogHubUrl(locale);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Blog', name: PAGE_TITLES[locale],
    description: PAGE_DESCRIPTIONS[locale], url: canonical,
    inLanguage: ({ ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' })[locale],
    blogPost: posts.map(p => ({
      '@type': 'BlogPosting', headline: p.title, description: p.excerpt,
      url: blogUrl(p.slug, locale), datePublished: p.publishedAt, dateModified: p.updatedAt,
      author: { '@type': 'Organization', name: p.author.name },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-indigo-400">Woldeok Moneyverse — {MARKET_NAMES[locale]}</p>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">{PAGE_TITLES[locale]}</h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">{PAGE_DESCRIPTIONS[locale]}</p>
          <nav aria-label="Country edition" className="flex flex-wrap gap-3 text-sm">
            {(['en', 'ko', 'ja', 'zh'] as const).map(l => (
              <Link key={l} href={blogHubUrl(l).replace('https://easy-scraping.com','')}
                hrefLang={{ko:'ko-KR',en:'en-US',ja:'ja-JP',zh:'zh-CN'}[l]}
                aria-current={l === locale ? 'page' : undefined} className={l === locale ? 'font-bold underline' : 'text-indigo-400 hover:underline'}>
                {MARKET_NAMES[l]}
              </Link>
            ))}
          </nav>
        </div>
        <BlogHubClient initialPosts={posts.map(summarizeBlogPost)} locale={locale} />
      </div>
    </>
  );
}

export function renderBlogArticle(slug: string, locale: BlogLocale) {
  if (canonicalBlogSlug(slug) !== slug) {
    permanentRedirect(blogUrl(slug, locale));
  }
  const original = getBlogPostBySlug(slug);
  if (!original) notFound();
  const post = getBlogCountryEdition(original, locale);
  if (!post) notFound();
  const canonical = blogUrl(slug, locale);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    headline: post.title, description: post.excerpt, articleBody: post.content,
    datePublished: post.publishedAt, dateModified: post.updatedAt,
    inLanguage: ({ ko:'ko-KR',en:'en-US',ja:'ja-JP',zh:'zh-CN' })[locale],
    author: { '@type': 'Organization', name: post.author.name },
    publisher: { '@type': 'Organization', name: 'Woldeok Moneyverse', url: 'https://easy-scraping.com' },
    ...(safeHeroImage(post.heroImage) ? { image: 'https://easy-scraping.com' + safeHeroImage(post.heroImage) } : {}),
  };
  return (
    <>
      {isBlogDiscoverable(original) && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g,'\\u003c') }} />
      )}
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {!isBlogDiscoverable(original) && (
          <p role="alert" className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            보관된 기존 AI 생성 글입니다. 출처와 수치의 사실 검증 및 편집 승인이 완료되지 않아 신규 독자에게 추천하지 않으며 검색 색인에서 제외하도록 요청 중입니다.
          </p>
        )}
        <BlogPostClient post={{ ...post, heroImage: safeHeroImage(post.heroImage) }} locale={locale} />
      </div>
    </>
  );
}
