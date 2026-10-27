import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { helpReviewDeadline, normalizeHelpLocale } from '../locale';
import { HelpArticleLive, type HelpArticleLiveArticle } from '../help-article-live';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '검증된 도움말', robots: { index: false, follow: false } };

type Article = HelpArticleLiveArticle & { article_id: string; slug: string; source_url: string; published_at: string };
export default async function HelpArticlePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<{ locale?: string }> }) {
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') notFound();
  const { slug } = await params;
  const locale = normalizeHelpLocale((await searchParams)?.locale);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) notFound();
  let article: Article;
  try {
    const response = await api<{ article: Article }>(`/api/v1/help/articles/${locale}/${encodeURIComponent(slug)}`);
    article = response.article;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const freshness = helpReviewDeadline(article.reviewed_until, locale);
  if (!freshness) notFound(); // Fail closed if evidence expired between DB read and SSR.
  let sourceHref: string | null = null;
  try {
    const source = new URL(article.source_url);
    if (source.protocol === 'https:' && !source.username && !source.password) sourceHref = source.href;
  } catch {
    // Malformed source metadata never becomes a clickable link.
  }
  return <main className="mx-auto grid w-full max-w-3xl gap-5 p-4">
    <Link href={locale === 'en' ? '/help?locale=en' : '/help'} className="underline underline-offset-4">{locale === 'en' ? 'Help articles' : '도움말 목록'}</Link>
    <HelpArticleLive article={article} locale={locale} sourceHref={sourceHref} />
    <Link href="/support" className="underline underline-offset-4">{locale === 'en' ? 'Need more help? Contact support' : '해결되지 않았나요? 관리자에게 직접 문의하기'}</Link>
  </main>;
}
