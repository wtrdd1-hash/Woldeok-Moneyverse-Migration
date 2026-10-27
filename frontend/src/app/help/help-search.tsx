'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { searchVerifiedHelp, type HelpSearchState } from './actions';
import { helpArticleHref, helpReviewDeadline, normalizeHelpLocale, type HelpLocale } from './locale';

const initial: HelpSearchState = { status: 'initial', articles: [] };
export function HelpSearch({ initialLocale = 'ko' }: { initialLocale?: HelpLocale }) {
  const [state, action, pending] = useActionState(searchVerifiedHelp, initial);
  const locale = state.locale ?? initialLocale;
  // An open result list must not keep showing a verified badge after expiry.
  const currentArticles = state.articles.flatMap(article => {
    const review = helpReviewDeadline(article.reviewed_until, normalizeHelpLocale(article.locale));
    return review ? [{ article, review }] : [];
  });
  return <section className="grid gap-5">
    <form action={action} className="grid gap-3 rounded-xl border p-4">
      <label htmlFor="help-locale">Language / 언어</label>
      <select id="help-locale" name="locale" defaultValue={initialLocale} className="rounded-lg border bg-background p-3">
        <option value="ko">한국어</option><option value="en">English</option>
      </select>
      <label htmlFor="help-query" className="font-semibold">{locale === 'en' ? 'Search help' : '도움말 검색'}</label>
      <input id="help-query" name="query" maxLength={100} className="rounded-lg border bg-background p-3" placeholder={locale === 'en' ? 'What do you need help with?' : '궁금한 내용을 입력하세요'} />
      <label htmlFor="help-category">{locale === 'en' ? 'Category' : '분야'}</label>
      <select id="help-category" name="category" className="rounded-lg border bg-background p-3">
        <option value="">{locale === 'en' ? 'All' : '전체'}</option>
        <option value="account">{locale === 'en' ? 'Account' : '계정'}</option>
        <option value="wallet">{locale === 'en' ? 'Wallet' : '지갑'}</option>
        <option value="shop">{locale === 'en' ? 'Shop' : '상점'}</option>
        <option value="community">{locale === 'en' ? 'Community' : '커뮤니티'}</option>
        <option value="support">{locale === 'en' ? 'Support' : '고객지원'}</option>
      </select>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary p-3 font-bold text-primary-foreground">
        {pending ? (locale === 'en' ? 'Searching…' : '검색 중…') : (locale === 'en' ? 'Search' : '검색')}
      </button>
    </form>
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
  </section>;
}
