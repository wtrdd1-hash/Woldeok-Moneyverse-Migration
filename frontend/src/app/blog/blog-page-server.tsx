import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import type { BlogPost } from './blog.types';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { BlogPostClient } from './[slug]/blog-post-client';
import { BlogHubClient } from './blog-hub-client';
import { getBlogFreshnessNotice } from './blog-freshness';
import { getAllBlogPosts, getBlogPostBySlug } from './blog-data';
import { verifiedPublicArticles, verifiedArticleBySlug } from './blog-verified-client';
import {
  blogAlternateLanguages, blogHubUrl, blogUrl, canonicalBlogSlug,
  countryBlogPosts, getBlogCountryEdition, isBlogDiscoverable, nativeBlogLocale,
  recentWorldwideBlogPosts, type BlogLocale,
} from './blog-seo';

const MARKET_NAMES: Record<BlogLocale, string> = {
  ko: '한국', en: 'United States', ja: '日本', zh: '中国',
};
const PAGE_TITLES: Record<BlogLocale, string> = {
  ko: '월덕 블로그 | 경제 · 코딩 · 컴퓨터',
  en: 'US Economics, Coding & Computers',
  ja: '日本の経済・プログラミング・コンピュータ',
  zh: '经济、编程与计算机知识',
};
const PAGE_DESCRIPTIONS: Record<BlogLocale, string> = {
  ko: '경제 원리, 프로그래밍, 네트워크와 컴퓨터 시스템을 국가별 공식 자료와 실제 예제로 학습합니다.',
  en: 'US-focused educational explanations of economics, programming, networking, and computer systems with primary sources.',
  ja: '経済の基礎、プログラミング、ネットワークとコンピュータの仕組みを一次資料から学びます。',
  zh: '根据权威来源介绍经济基础、编程实践、网络与计算机系统的原理。',
};

function safeHeroImage(url?: string): string | undefined {
  if (!url || !/^\/images\/blog\/[a-zA-Z0-9._/-]+\.(png|webp|jpg|jpeg|svg)$/.test(url) || url.includes('..')) {
    return undefined;
  }
  return fs.existsSync(path.join(process.cwd(), 'public', url.slice(1))) ? url : undefined;
}

export function resolvePostHeroImage(post: BlogPost): string {
  const safe = safeHeroImage(post.heroImage);
  if (safe) return safe;

  const cat = String(post.category || '').toUpperCase();
  const label = String(post.categoryLabel || '').toLowerCase();
  const tagsStr = (post.tags || []).join(' ').toLowerCase();

  if (
    cat === 'TECH' ||
    label.includes('코딩') ||
    label.includes('컴퓨터') ||
    label.includes('编程') ||
    label.includes('programming') ||
    tagsStr.includes('coding') ||
    tagsStr.includes('computer')
  ) {
    return '/images/blog/tech-distributed-ledger.svg';
  }
  if (cat === 'COMPOUND' || label.includes('복리') || label.includes('저축') || label.includes('72')) {
    return '/images/blog/compound-interest-72-rule.svg';
  }
  if (cat === 'TAX' || label.includes('절세') || label.includes('세금') || label.includes('연금') || label.includes('isa')) {
    return '/images/blog/tax-saving-isa-pension.svg';
  }
  if (cat === 'STOCKS' || label.includes('주식') || label.includes('투자')) {
    return '/images/blog/stocks-valuation-dca.svg';
  }
  if (cat === 'WEALTH' || label.includes('자산') || label.includes('포트폴리오')) {
    return '/images/blog/wealth-portfolio-roadmap.svg';
  }
  return '/images/blog/macro-global-forex-pulse.svg';
}

export function metadataForHub(locale: BlogLocale): Metadata {
  return {
    title: PAGE_TITLES[locale], description: PAGE_DESCRIPTIONS[locale],
    robots: { index: true, follow: true },
    alternates: { canonical: blogHubUrl(locale) },
    openGraph: {
      title: PAGE_TITLES[locale], description: PAGE_DESCRIPTIONS[locale],
      url: blogHubUrl(locale), type: 'website', siteName: 'Woldeok Moneyverse',
    },
  };
}

export async function metadataForArticle(slug: string, locale: BlogLocale): Promise<Metadata> {
  const original = getBlogPostBySlug(slug) ?? await verifiedArticleBySlug(slug);
  if (!original) return { title: 'Article not found', robots: { index: false, follow: false } };
  const nativeLocale = (original.country ? ({ KR: "ko", US: "en", JP: "ja", CN: "zh" } as Record<string, BlogLocale>)[original.country] : undefined) ?? locale;
  const post = getBlogCountryEdition(original, locale) ?? getBlogCountryEdition(original, nativeLocale) ?? original;
  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } };
  const canonical = blogUrl(slug, nativeLocale);
  const hero = resolvePostHeroImage(post);
  return {
    title: post.title, description: post.excerpt, keywords: [...post.tags],
    robots: { index: isBlogDiscoverable(original) && nativeLocale === locale, follow: isBlogDiscoverable(original) && nativeLocale === locale },
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
  const { slug, title, excerpt, category, categoryLabel, publishedAt, readTimeMinutes, tags, views, viewCountVerified, author, relatedCalculatorHref, relatedCalculatorName } = post;
  return {slug,title,excerpt,category,categoryLabel,publishedAt,readTimeMinutes,tags,views,viewCountVerified,author,heroImage:resolvePostHeroImage(post),relatedCalculatorHref,relatedCalculatorName};
}
const WORLDWIDE_PANEL = {
  ko: { title: '전 세계 최신 발행 글', description: '다른 국가의 새 글입니다. 제목을 누르면 해당 언어의 원문으로 이동합니다.', unverified: 'AI 생성 · 미검증' },
  en: { title: 'Latest worldwide publications', description: 'Read the original article in its native language.', unverified: 'AI-generated · unverified' },
  ja: { title: '世界の最新記事', description: '記事はそれぞれの原語版で公開されています。', unverified: 'AI生成 · 未検証' },
  zh: { title: '全球最新文章', description: '点击标题阅读相应语言的原文。', unverified: 'AI生成 · 未核实' },
} as const;

const NATIVE_LANGUAGE = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' } as const;

export async function renderBlogHub(locale: BlogLocale) {
  const publicPosts = [...await verifiedPublicArticles(), ...getAllBlogPosts()].filter(isBlogDiscoverable);
  const posts = countryBlogPosts(publicPosts, locale);
  const worldwide = recentWorldwideBlogPosts(publicPosts, locale);
  const canonical = blogHubUrl(locale);
  const freshnessNotice = getBlogFreshnessNotice(posts, locale);
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
          {worldwide.length > 0 && (
            <section aria-label={WORLDWIDE_PANEL[locale].title} className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3">
              <h2 className="text-base font-bold text-foreground">{WORLDWIDE_PANEL[locale].title}</h2>
              <p className="text-xs text-muted-foreground">{WORLDWIDE_PANEL[locale].description}</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {worldwide.map(post => {
                  const native = nativeBlogLocale(post)!;
                  return (
                    <li key={post.slug} className="rounded-lg border border-border/50 px-3 py-2.5 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        <span lang={native}>{NATIVE_LANGUAGE[native]}</span>
                        {' · '}{new Date(post.publishedAt).toLocaleDateString(locale)}
                        {post.verificationState === 'UNVERIFIED' && ` · ${WORLDWIDE_PANEL[locale].unverified}`}
                      </p>
                      <Link href={blogUrl(post.slug, native).replace('https://easy-scraping.com', '')}
                        hrefLang={{ ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' }[native]}
                        lang={native}
                        className="block text-sm font-semibold text-foreground hover:text-indigo-400 transition-colors line-clamp-2">
                        {post.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {freshnessNotice && (
            <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs sm:text-sm text-muted-foreground">
              {freshnessNotice}
            </p>
          )}
        </div>
        <BlogHubClient initialPosts={posts.map(summarizeBlogPost)} locale={locale} />
      </div>
    </>
  );
}

export async function renderBlogArticle(slug: string, locale: BlogLocale) {
  if (canonicalBlogSlug(slug) !== slug) {
    permanentRedirect(blogUrl(slug, locale));
  }
  const original = getBlogPostBySlug(slug) ?? await verifiedArticleBySlug(slug);
  if (!original) notFound();
  const nativeLocale = (original.country ? ({ KR: "ko", US: "en", JP: "ja", CN: "zh" } as Record<string, BlogLocale>)[original.country] : undefined) ?? locale;
  if ((original.verificationReceipt || original.verificationState === 'UNVERIFIED') && original.country && nativeLocale !== locale) {
    permanentRedirect(blogUrl(slug, nativeLocale));
  }
  const post = getBlogCountryEdition(original, locale) ?? getBlogCountryEdition(original, nativeLocale) ?? original;
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
    ...(resolvePostHeroImage(post) ? { image: 'https://easy-scraping.com' + resolvePostHeroImage(post) } : {}),
  };
  return (
    <>
      {isBlogDiscoverable(original) && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g,'\\u003c') }} />
      )}
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {!isBlogDiscoverable(original) && (
          <p role="alert" className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            비공개 또는 검증되지 않은 게시물입니다.
          </p>
        )}
        <BlogPostClient post={{ ...post, heroImage: resolvePostHeroImage(post) }} locale={locale} />
      </div>
    </>
  );
}
