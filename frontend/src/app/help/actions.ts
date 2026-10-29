'use server';

import { api } from '@/lib/api';
import { normalizeHelpLocale, type HelpLocale } from './locale';

export type HelpSummary = { article_id: string; locale: HelpLocale; slug: string; title: string; summary: string; category: string };
export type HelpSearchState = { status: 'initial'|'results'|'empty'|'invalid'|'unavailable'; articles: HelpSummary[]; fallbackUsed?: boolean; resultLocale?: HelpLocale };

/** Query is sent in the POST body, never a URL, referrer or client-side cache. */
export async function searchVerifiedHelp(_previous: HelpSearchState, data: FormData): Promise<HelpSearchState> {
  const query = data.get('query');
  const category = data.get('category');
  const rawLocale = data.get('locale');
  const fallbackValues = data.getAll('fallbackToOtherLocale');
  if (fallbackValues.length > 1 || (fallbackValues.length === 1 && fallbackValues[0] !== 'on')) {
    return { status: 'invalid', articles: [] };
  }
  const fallbackToOtherLocale = fallbackValues.length === 1;
  if (rawLocale !== null && rawLocale !== 'ko' && rawLocale !== 'en') {
    return { status: 'invalid', articles: [] };
  }
  const locale = normalizeHelpLocale(rawLocale);
  if (typeof query !== 'string' || Array.from(query).length > 100 ||
    (category !== null && (typeof category !== 'string' ||
      (category !== '' && !['account','wallet','shop','community','support'].includes(category))))) {
    return { status: 'invalid', articles: [] };
  }
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') return { status: 'unavailable', articles: [] };
  try {
    const result = await api<{ articles: HelpSummary[]; fallbackUsed?: boolean; resultLocale?: HelpLocale }>('/api/v1/help/search', {
      method: 'POST', body: { locale, category: category || undefined, query, limit: 20, fallbackToOtherLocale },
    });
    if (!Array.isArray(result.articles)) return { status: 'unavailable', articles: [] };
    const fallbackUsed = result.fallbackUsed === true;
    const resultLocale = fallbackUsed ? result.resultLocale : locale;
    // Fail closed on mismatched upstream language provenance or unexpected fallback.
    if ((fallbackUsed && (!fallbackToOtherLocale || resultLocale !== (locale === 'ko' ? 'en' : 'ko') || !result.articles.length)) ||
      result.articles.some(article => article.locale !== resultLocale)) {
      return { status: 'unavailable', articles: [] };
    }
    return { status: result.articles.length ? 'results' : 'empty', articles: result.articles, fallbackUsed, resultLocale: resultLocale ?? locale };
  } catch {
    // A DB outage is NOT a verified empty search result.
    return { status: 'unavailable', articles: [] };
  }
}
