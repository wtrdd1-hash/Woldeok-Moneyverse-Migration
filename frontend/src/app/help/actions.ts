'use server';

import { normalizeVerifiedHelpQuery } from '@moneyverse/contract';
import { api } from '@/lib/api';
import { normalizeHelpLocale, type HelpLocale } from './locale';

export type HelpSummary = { article_id: string; locale: HelpLocale; slug: string; title: string; summary: string; category: string };
export type HelpSearchState = { status: 'initial'|'results'|'empty'|'invalid'|'unavailable'; articles: HelpSummary[] };

/** Query is sent in the POST body, never a URL, referrer or client-side cache. */
export async function searchVerifiedHelp(_previous: HelpSearchState, data: FormData): Promise<HelpSearchState> {
  const query = normalizeVerifiedHelpQuery(data.get('query'));
  const category = data.get('category');
  const rawLocale = data.get('locale');
  if (rawLocale !== null && rawLocale !== 'ko' && rawLocale !== 'en') {
    return { status: 'invalid', articles: [] };
  }
  const locale = normalizeHelpLocale(rawLocale);
  if (query === null ||
    (category !== null && (typeof category !== 'string' ||
      (category !== '' && !['account','wallet','shop','community','support'].includes(category))))) {
    return { status: 'invalid', articles: [] };
  }
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') return { status: 'unavailable', articles: [] };
  try {
    const result = await api<{ articles: HelpSummary[] }>('/api/v1/help/search', {
      method: 'POST', body: { locale, category: category || undefined, query, limit: 20 },
    });
    return { status: result.articles.length ? 'results' : 'empty', articles: result.articles };
  } catch {
    // A DB outage is NOT a verified empty search result.
    return { status: 'unavailable', articles: [] };
  }
}
