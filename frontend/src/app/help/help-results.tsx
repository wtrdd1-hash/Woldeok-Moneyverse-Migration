'use client';

import Link from 'next/link';
import type { HelpSearchState } from './actions';
import { helpArticleHref, helpReviewDeadline, normalizeHelpLocale, type HelpLocale } from './locale';
import { useHelpEvidenceClock } from './help-live-clock';

/** A successful old search is never a perpetual claim that its evidence is valid. */
export function HelpResults({ state, locale }: { state: HelpSearchState; locale: HelpLocale }) {
  const nowMs = useHelpEvidenceClock(state.articles.map(article => article.reviewed_until));

  const currentArticles = state.articles.flatMap(article => {
    const review = helpReviewDeadline(article.reviewed_until, normalizeHelpLocale(article.locale), nowMs);
    return review ? [{ article, review }] : [];
  });

  return <>
    <div aria-live="polite" aria-atomic="true">
      {(state.status === 'empty' || (state.status === 'results' && currentArticles.length === 0)) &&
        <p>{locale === 'en' ? 'No currently verified results.' : '검증된 검색 결과가 없습니다.'}</p>}
      {state.status === 'invalid' && <p role="alert">{locale === 'en' ? 'Search terms must be 100 characters or fewer.' : '검색어는 100자 이내여야 합니다.'}</p>}
      {state.status === 'unavailable' && <p role="alert">{locale === 'en' ? 'Verified help is temporarily unavailable. Please try again.' : '현재 검증된 도움말을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.'}</p>}
      {state.status === 'results' && currentArticles.length > 0 &&
        <p>{locale === 'en' ? `${currentArticles.length} verified articles` : `${currentArticles.length}개의 검증된 도움말`}</p>}
    </div>
    {state.status === 'results' && currentArticles.length > 0 &&
      <ul className="grid gap-3">{currentArticles.map(({ article, review }) =>
        <li key={article.article_id} className="rounded-xl border p-4">
          <Link className="font-semibold underline underline-offset-4" href={helpArticleHref(article.slug, normalizeHelpLocale(article.locale))}>{article.title}</Link>
          <p className="mt-2 text-sm">{article.summary}</p>
          <p className="mt-2 text-sm">
            {normalizeHelpLocale(article.locale) === 'en' ? 'Evidence reviewed until: ' : '근거 검증 유효기한: '}
            <time dateTime={review.dateTime}>{review.label}</time>
          </p>
        </li>
      )}</ul>}
  </>;
}
