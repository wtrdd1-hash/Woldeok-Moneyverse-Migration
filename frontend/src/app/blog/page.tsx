import type { Metadata } from 'next';
import { BlogHubClient } from './blog-hub-client';
import { getAllBlogPosts } from './blog-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '월덕 금융 블로그 | AI 금융연구소 실전 재테크 칼럼',
  description:
    '복리 72의 법칙, ISA 비과세 절세 전략, 가상 주식 가치투자 가이드 등 매일 AI가 분석하는 고수익 금융 인사이트 리포트 및 계산기 활용법.',
  keywords: [
    '금융블로그',
    '재테크칼럼',
    '복리계산기',
    'ISA절세',
    '배당소득세',
    '가상주식',
    '청년도약계좌',
    '월덕머니버스',
  ],
  alternates: {
    canonical: 'https://easy-scraping.com/blog',
  },
  openGraph: {
    title: '월덕 금융 블로그 | AI 금융연구소 실전 재테크 칼럼',
    description:
      '복리 72의 법칙, ISA 비과세 절세 전략, 가상 주식 가치투자 가이드 등 매일 AI가 분석하는 고수익 금융 인사이트.',
    url: 'https://easy-scraping.com/blog',
    siteName: '월덕 머니버스',
    type: 'website',
  },
};

export default function BlogHubPage() {
  const posts = getAllBlogPosts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: '월덕 금융 블로그 (Woldeok Finance Blog)',
    description: 'AI 금융연구소 실전 재테크 및 자산 배분 칼럼',
    url: 'https://easy-scraping.com/blog',
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      url: `https://easy-scraping.com/blog/${p.slug}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      author: {
        '@type': 'Person',
        name: p.author.name,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <span>💡</span> 월덕 금융연구소 공식 블로그
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            매일 업데이트되는 실전 금융 & 자산 배분 칼럼
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            복리의 마법부터 ISA 절세 전략, 가상 주식 밸류에이션 지표까지.
            월덕 머니버스 내부 AI 애널리스트가 엄선한 고수익 재테크 리포트를 매일 오전 만나보세요.
          </p>
        </div>

        {/* Client Interactive Filter & Grid */}
        <BlogHubClient initialPosts={posts} />
      </div>
    </>
  );
}
