'use server';

import { api } from '@/lib/api';
import { normalizeHelpLocale, type HelpLocale } from './locale';

export type HelpSummary = { article_id: string; locale: HelpLocale; slug: string; title: string; summary: string; category: string; published_at?: string };
export type HelpSearchState = { status: 'initial'|'results'|'empty'|'invalid'|'unavailable'; articles: HelpSummary[] };

/** Query is sent in the POST body, never a URL, referrer or client-side cache. */
export async function searchVerifiedHelp(_previous: HelpSearchState, data: FormData): Promise<HelpSearchState> {
  const query = data.get('query');
  const category = data.get('category');
  const rawLocale = data.get('locale');
  const rawLimit = data.get('limit');
  const limit = rawLimit === null ? 20 : typeof rawLimit === 'string' && /^(10|20|50)$/.test(rawLimit) ? Number(rawLimit) : null;
  if (rawLocale !== null && rawLocale !== 'ko' && rawLocale !== 'en') {
    return { status: 'invalid', articles: [] };
  }
  const locale = normalizeHelpLocale(rawLocale);
  if (limit === null || typeof query !== 'string' || Array.from(query).length > 100 ||
    (category !== null && (typeof category !== 'string' ||
      (category !== '' && !['account','wallet','shop','community','support'].includes(category))))) {
    return { status: 'invalid', articles: [] };
  }
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') return { status: 'unavailable', articles: [] };
  try {
    const result = await api<{ articles: HelpSummary[] }>('/api/v1/help/search', {
      method: 'POST', body: { locale, category: category || undefined, query, limit },
    });
    return { status: result.articles.length ? 'results' : 'empty', articles: result.articles };
  } catch {
    // A DB outage is NOT a verified empty search result.
    return { status: 'unavailable', articles: [] };
  }
}
