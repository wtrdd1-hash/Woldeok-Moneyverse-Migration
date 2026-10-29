import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { normalizeHelpLocale } from '../locale';
import { HelpPublicationDate } from '../help-publication-date';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '검증된 도움말', robots: { index: false, follow: false } };

type Article = { article_id: string; slug: string; title: string; summary: string; body_plain: string; source_url: string; published_at: string };
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
  let sourceHref: string | null = null;
  try {
    const source = new URL(article.source_url);
    if (source.protocol === 'https:' && !source.username && !source.password) sourceHref = source.href;
  } catch {
    // Malformed source metadata never becomes a clickable link.
  }
  return <main className="mx-auto grid w-full max-w-3xl gap-5 p-4">
    <Link href={locale === 'en' ? '/help?locale=en' : '/help'} className="underline underline-offset-4">{locale === 'en' ? 'Help articles' : '도움말 목록'}</Link>
    <article className="grid gap-4"><h1 className="text-3xl font-bold">{article.title}</h1><p>{article.summary}</p><HelpPublicationDate publishedAt={article.published_at} locale={locale} /><div className="whitespace-pre-wrap break-words">{article.body_plain}</div>
      {sourceHref && <p className="text-sm">{locale === 'en' ? 'Verified source: ' : '검증 근거: '}<a href={sourceHref} target="_blank" rel="noopener noreferrer" className="underline">{locale === 'en' ? 'View original' : '원본 자료 보기'}</a></p>}
    </article>
    <Link href="/support" className="underline underline-offset-4">{locale === 'en' ? 'Need more help? Contact support' : '해결되지 않았나요? 관리자에게 직접 문의하기'}</Link>
  </main>;
}
