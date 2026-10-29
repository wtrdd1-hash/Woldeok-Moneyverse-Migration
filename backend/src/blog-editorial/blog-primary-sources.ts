import { createHash } from 'node:crypto';
import { discoverPrimaryCandidates } from './blog-source-discovery';
import type { BlogRotationSlot } from './blog-two-hour-rotation';

/** Official source per country and editorial topic. Unavailable sources fail closed. */
export const PRIMARY_SOURCES = {
  KR: { ECONOMY: 'https://www.bok.or.kr/portal/main/main.do', CODING: 'https://developer.mozilla.org/ko/docs/Web/JavaScript', COMPUTER: 'https://developer.mozilla.org/ko/docs/Web/HTTP' },
  US: { ECONOMY: 'https://www.federalreserve.gov/monetarypolicy.htm', CODING: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', COMPUTER: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
  JP: { ECONOMY: 'https://www.boj.or.jp/mopo/index.htm', CODING: 'https://developer.mozilla.org/ja/docs/Web/JavaScript', COMPUTER: 'https://developer.mozilla.org/ja/docs/Web/HTTP' },
  CN: { ECONOMY: 'https://www.pbc.gov.cn/zhengcehuobisi/125207/index.html', CODING: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript', COMPUTER: 'https://developer.mozilla.org/zh-CN/docs/Web/HTTP' },
} as const;

export interface PrimarySourceEvidence { url: string; digest: string; excerpt: string }

export function sourceUrlFor(slot: BlogRotationSlot): string {
  return PRIMARY_SOURCES[slot.country][slot.topic];
}

export function extractPrimarySourceText(html: string): string {
  const clean=(text:string)=>text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|lt|gt);/g, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  // Prefer authored article/main body to navigation and sitewide boilerplate.
  // A too-short detected body does not silently become evidence; the
  // official document is independently length-checked at the call site.
  for (const tag of ['article','main']) {
    const body=html.match(new RegExp('<'+tag+'\\b[^>]*>([\\s\\S]*?)<\\/'+tag+'>','i'))?.[1];
    if (body) {
      const extracted=clean(body);
      if (extracted.length>=700) return extracted;
    }
  }
  return clean(html);
}

export async function retrievePrimarySource(
  slot: BlogRotationSlot,
  loader: typeof fetch = fetch,
): Promise<PrimarySourceEvidence> {
  const candidates = await discoverPrimaryCandidates(slot, sourceUrlFor(slot), loader);
  let failure = 'SOURCE_NOT_AVAILABLE';
  for (const url of candidates) {
    try {
      const response = await loader(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(12000),
        headers: { 'User-Agent': 'Moneyverse-Source-Verification/1.0' },
      });
      if (response.status !== 200 || !(response.headers.get('content-type') || '').toLowerCase().startsWith('text/html')) {
        throw new Error('SOURCE_NOT_AVAILABLE');
      }
      if (Number(response.headers.get('content-length') || 0) > 2000000) {
        throw new Error('SOURCE_SIZE_INVALID');
      }
      const html = await response.text();
      if (html.length < 1200 || html.length > 2000000) throw new Error('SOURCE_SIZE_INVALID');
      const excerpt = extractPrimarySourceText(html).slice(0, 7500);
      if (excerpt.length < 700) throw new Error('SOURCE_TEXT_TOO_SHORT');
      return { url, excerpt, digest: createHash('sha256').update(excerpt).digest('hex') };
    } catch (error: unknown) {
      failure = error instanceof Error ? error.message : 'SOURCE_NOT_AVAILABLE';
    }
  }
  // Never use an RSS snippet, redirect, error page or model assertion as evidence.
  throw new Error(failure);
}
