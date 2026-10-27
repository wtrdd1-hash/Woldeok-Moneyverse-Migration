'use client';

import Link from 'next/link';
import { helpReviewDeadline, type HelpLocale } from './locale';
import { useHelpEvidenceClock } from './help-live-clock';

export type HelpArticleLiveArticle = {
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
  const freshness = helpReviewDeadline(article.reviewed_until, locale, nowMs);
  if (!freshness) {
    return <div role="status" className="rounded-xl border p-4">
      {locale === 'en' ? 'This article’s verification has expired. Search for current guidance.' : '이 도움말의 검증 유효기한이 만료되었습니다. 최신 안내를 다시 검색해 주세요.'}
      {' '}<Link href={locale === 'en' ? '/help?locale=en' : '/help'} className="underline">
        {locale === 'en' ? 'Search verified help' : '검증된 도움말 검색'}
      </Link>
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
