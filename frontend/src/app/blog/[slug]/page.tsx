import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/site-shell';
import { BlogPostClient } from './blog-post-client';
import { getBlogPostBySlug, getAllBlogPosts } from '../blog-data';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다 | 월덕 금융 블로그',
    };
  }

  const postUrl = `https://easy-scraping.com/blog/${post.slug}`;

  return {
    title: `${post.title} | 월덕 금융 블로그`,
    description: post.excerpt,
    keywords: [...post.tags, '월덕머니버스', '금융블로그'],
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: [...post.tags],
      siteName: '월덕 머니버스',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const postUrl = `https://easy-scraping.com/blog/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.title,
    description: post.excerpt,
    articleBody: post.content,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: '월덕 머니버스 (Woldeok Moneyverse)',
      url: 'https://easy-scraping.com',
    },
    keywords: post.tags.join(', '),
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <BlogPostClient post={post} />
      </div>
    </SiteShell>
  );
}
