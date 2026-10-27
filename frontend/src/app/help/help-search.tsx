'use client';

import { useActionState } from 'react';
import { searchVerifiedHelp, type HelpSearchState } from './actions';
import type { HelpLocale } from './locale';
import { HelpResults } from './help-results';

const initial: HelpSearchState = { status: 'initial', articles: [] };
export function HelpSearch({ initialLocale = 'ko' }: { initialLocale?: HelpLocale }) {
  const [state, action, pending] = useActionState(searchVerifiedHelp, initial);
  const locale = state.locale ?? initialLocale;
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
    <HelpResults state={state} locale={locale} />
  </section>;
}
