'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { helpReviewDeadline, type HelpLocale } from './locale';
import { useHelpEvidenceClock } from './help-live-clock';

type PublicationState = { readonly identity: string; readonly status: 'checking' | 'current' | 'unavailable' };

/** Prevent a previous article's verified state from carrying over on client navigation. */
export function publicationIsVerified(state: PublicationState, identity: string): boolean {
  return state.identity === identity && state.status === 'current';
}

export type HelpArticleLiveArticle = {
  article_id: string;
  slug: string;
  published_at: string;
  title: string;
  summary: string;
  body_plain: string;
  reviewed_until: string;
};

export function HelpArticleLive({
  article, locale, sourceHref,
}: {
  article: HelpArticleLiveArticle;
  locale: HelpLocale;
  sourceHref: string | null;
}) {
  const nowMs = useHelpEvidenceClock([article.reviewed_until]);
  const identity = JSON.stringify([locale, article.article_id, article.published_at, article.reviewed_until, article.slug]);
  const [publication, setPublication] = useState<PublicationState>({ identity, status: 'checking' });
  useEffect(() => {
    let active = true;
    let generation = 0;
    let pending: AbortController | null = null;
    const verify = async () => {
      pending?.abort();
      const abort = new AbortController();
      pending = abort;
      const request = ++generation;
      setPublication({ identity, status: 'checking' });
      try {
        const response = await fetch(`/api/help/verify?locale=${locale}&slug=${encodeURIComponent(article.slug)}`, {
          cache: 'no-store', credentials: 'same-origin', signal: abort.signal,
        });
        if (!response.ok) throw new Error('publication unverified');
        const receipt: unknown = await response.json();
        const row = receipt as { current?: unknown; articleId?: unknown; publishedAt?: unknown; reviewedUntil?: unknown };
        const current = row?.current === true && row.articleId === article.article_id &&
          row.publishedAt === article.published_at && typeof row.reviewedUntil === 'string' &&
          Number.isFinite(Date.parse(row.reviewedUntil)) &&
          // A current publication with a changed review deadline is a different SSR revision.
          // Do not display a stale, longer verified-until claim while waiting for navigation.
          Date.parse(row.reviewedUntil) === Date.parse(article.reviewed_until) &&
          Date.parse(row.reviewedUntil) > Date.now();
        if (active && request === generation) setPublication({ identity, status: current ? 'current' : 'unavailable' });
      } catch {
        if (active && request === generation && !abort.signal.aborted) setPublication({ identity, status: 'unavailable' });
      }
    };
    void verify();
    const timer = window.setInterval(() => { if (!document.hidden) void verify(); }, 30_000);
    const onFocus = () => { if (!document.hidden) void verify(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      active = false;
      pending?.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [article.article_id, article.published_at, article.reviewed_until, article.slug, identity, locale]);
  const freshness = helpReviewDeadline(article.reviewed_until, locale, nowMs);
  if (!freshness) {
    return <div role="status" className="rounded-xl border p-4">
      {locale === 'en' ? 'This article’s verification has expired. Search for current guidance.' : '이 도움말의 검증 유효기한이 만료되었습니다. 최신 안내를 다시 검색해 주세요.'}
      {' '}<Link href={locale === 'en' ? '/help?locale=en' : '/help'} className="underline">
        {locale === 'en' ? 'Search verified help' : '검증된 도움말 검색'}
      </Link>
    </div>;
  }
  if (!publicationIsVerified(publication, identity)) {
    return <div role="status" className="rounded-xl border p-4">
      {(publication.identity !== identity || publication.status === 'checking')
        ? (locale === 'en' ? 'Checking current publication…' : '현재 게시 상태를 확인하고 있습니다…')
        : (locale === 'en' ? 'This article was withdrawn or could not be verified. Search for current guidance.' : '게시가 철회되었거나 검증할 수 없습니다. 최신 안내를 다시 검색해 주세요.')}
    </div>;
  }
  return <article className="grid gap-4">
    <h1 className="text-3xl font-bold">{article.title}</h1>
    <p>{article.summary}</p>
    <div className="whitespace-pre-wrap break-words">{article.body_plain}</div>
    <p className="text-sm">
      {locale === 'en' ? 'Evidence reviewed until: ' : '근거 검증 유효기한: '}
      <time dateTime={freshness.dateTime}>{freshness.label}</time>
    </p>
    {sourceHref && <p className="text-sm">
      {locale === 'en' ? 'Verified source: ' : '검증 근거: '}
      <a href={sourceHref} target="_blank" rel="noopener noreferrer" className="underline">
        {locale === 'en' ? 'View original' : '원본 자료 보기'}
      </a>
    </p>}
  </article>;
}
