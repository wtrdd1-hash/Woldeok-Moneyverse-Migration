'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { searchVerifiedHelp, type HelpSearchState } from './actions';
import { helpArticleHref, normalizeHelpLocale, type HelpLocale } from './locale';

const initial: HelpSearchState = { status: 'initial', articles: [] };
export function HelpSearch({ initialLocale = 'ko' }: { initialLocale?: HelpLocale }) {
  const [state, action, pending] = useActionState(searchVerifiedHelp, initial);
  return <section className="grid gap-5">
    <form action={action} className="grid gap-3 rounded-xl border p-4">
      <label htmlFor="help-locale">Language / 언어</label>
      <select id="help-locale" name="locale" defaultValue={initialLocale} className="rounded-lg border bg-background p-3">
        <option value="ko">한국어</option><option value="en">English</option>
      </select>
      <label htmlFor="help-query" className="font-semibold">도움말 검색</label>
      <input id="help-query" name="query" maxLength={100} className="rounded-lg border bg-background p-3" placeholder="궁금한 내용을 입력하세요" />
      <label htmlFor="help-category">분야</label>
      <select id="help-category" name="category" className="rounded-lg border bg-background p-3">
        <option value="">전체</option><option value="account">계정</option><option value="wallet">지갑</option>
        <option value="shop">상점</option><option value="community">커뮤니티</option><option value="support">고객지원</option>
      </select>
      <label htmlFor="help-limit">{initialLocale === 'en' ? 'Results to show' : '표시할 결과 수'}</label>
      <select id="help-limit" name="limit" defaultValue="20" className="rounded-lg border bg-background p-3">
        <option value="10">10개</option><option value="20">20개</option><option value="50">50개</option>
      </select>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary p-3 font-bold text-primary-foreground">{pending ? '검색 중…' : '검색'}</button>
    </form>
    <div aria-live="polite" aria-atomic="true">
      {state.status === 'empty' && <p>검증된 검색 결과가 없습니다.</p>}
      {state.status === 'invalid' && <p role="alert">검색 조건이 올바르지 않습니다. 검색어(100자 이내)와 표시 개수를 확인해 주세요.</p>}
      {state.status === 'unavailable' && <p role="alert">현재 검증된 도움말을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.</p>}
      {state.status === 'results' && <p>{state.articles.length}개의 검증된 도움말</p>}
    </div>
    {state.status === 'results' && <ul className="grid gap-3">{state.articles.map(article =>
      <li key={article.article_id} className="rounded-xl border p-4"><Link className="font-semibold underline underline-offset-4" href={helpArticleHref(article.slug, normalizeHelpLocale(article.locale))}>{article.title}</Link><p className="mt-2 text-sm">{article.summary}</p></li>
    )}</ul>}
  </section>;
}
