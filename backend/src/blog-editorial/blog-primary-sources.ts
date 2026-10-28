import { createHash } from 'node:crypto';
import type { BlogRotationSlot } from './blog-two-hour-rotation';

/** Official source per country and editorial topic. Unavailable sources fail closed. */
export const PRIMARY_SOURCES = {
  KR: { ECONOMY: 'https://www.bok.or.kr/portal/main/main.do', CODING: 'https://developer.mozilla.org/ko/docs/Web/JavaScript', COMPUTER: 'https://developer.mozilla.org/ko/docs/Web/HTTP' },
  US: { ECONOMY: 'https://www.federalreserve.gov/monetarypolicy.htm', CODING: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', COMPUTER: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
  JP: { ECONOMY: 'https://www.boj.or.jp/mopo/index.htm', CODING: 'https://developer.mozilla.org/ja/docs/Web/JavaScript', COMPUTER: 'https://developer.mozilla.org/ja/docs/Web/HTTP' },
  CN: { ECONOMY: 'https://www.pbc.gov.cn/en/3688110/index.html', CODING: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript', COMPUTER: 'https://developer.mozilla.org/zh-CN/docs/Web/HTTP' },
} as const;

export interface PrimarySourceEvidence { url: string; digest: string; excerpt: string }

export function sourceUrlFor(slot: BlogRotationSlot): string {
  return PRIMARY_SOURCES[slot.country][slot.topic];
}

export function extractPrimarySourceText(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|lt|gt);/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

export async function retrievePrimarySource(
  slot: BlogRotationSlot,
  loader: typeof fetch = fetch,
): Promise<PrimarySourceEvidence> {
  const url = sourceUrlFor(slot);
  const response = await loader(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(12000),
    headers: { 'User-Agent': 'Moneyverse-Source-Verification/1.0' },
  });
  if (response.status !== 200 || !/^text\/html/i.test(response.headers.get('content-type') || '')) {
    throw new Error('SOURCE_NOT_AVAILABLE');
  }
  const html = await response.text();
  if (html.length < 1200 || html.length > 2000000) throw new Error('SOURCE_SIZE_INVALID');
  const excerpt = extractPrimarySourceText(html).slice(0, 7500);
  if (excerpt.length < 700) throw new Error('SOURCE_TEXT_TOO_SHORT');
  return { url, excerpt, digest: createHash('sha256').update(excerpt).digest('hex') };
}
