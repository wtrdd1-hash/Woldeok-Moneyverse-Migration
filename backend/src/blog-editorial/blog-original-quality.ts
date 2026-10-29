import { createHash } from 'node:crypto';
import type { BlogRotationSlot } from './blog-two-hour-rotation';
import type { PrimarySourceEvidence } from './blog-primary-sources';

export interface OriginalArticle {
  title: string;
  excerpt: string;
  content: string;
}
const forbidden = [
  /(?:guaranteed returns|risk-free profits|원금\s*보장|무조건\s*수익|稳赚不赔|絶対に儲か)/i,
  /(?:today's|latest|current)\s+(?:rates?|market prices?|stock prices?)/i,
  /(?:현재|실시간)\s*(?:금리|환율|주가)/i,
  /(?:最新|实时)\s*(?:利率|汇率|株価|金利)/i,
  /<script\b|<iframe\b|javascript:|data:text\/html/i,
  /(?:actual|measured)\s+(?:benchmark|backtest)|(?:실측|백테스트)\s*(?:결과|데이터)/i,
];
const nativeScripts = {
  KR: (text: string) => (text.match(/[가-힣]/g) ?? []).length >= 220,
  US: (text: string) => (text.match(/\b[a-zA-Z]{4,}\b/g) ?? []).length >= 230 &&
    (text.match(/[가-힣\u3040-\u30ff\u4e00-\u9fff]/g) ?? []).length < 25,
  JP: (text: string) => (text.match(/[\u3040-\u30ff]/g) ?? []).length >= 130,
  CN: (text: string) => (text.match(/[\u4e00-\u9fff]/g) ?? []).length >= 390 &&
    (text.match(/[가-힣\u3040-\u30ff]/g) ?? []).length < 18,
};
const links = /https?:\/\/[^\s\])>]+/g;

/**
 * Independent deterministic publication quality gate. A language model's
 * self-declared "verified" flag is never accepted as evidence.
 */
export function checkOriginalArticle(
  draft: OriginalArticle,
  slot: BlogRotationSlot,
  primary: PrimarySourceEvidence,
  knownDigests: ReadonlySet<string> = new Set(),
): { eligible: boolean; reasons: string[]; digest: string } {
  const body = draft.title + '\n' + draft.excerpt + '\n' + draft.content;
  const digest = createHash('sha256').update(body).digest('hex');
  const reasons: string[] = [];
  if (draft.title.length < 25 || draft.title.length > 180
      || draft.excerpt.length < 65 || draft.excerpt.length > 500
      || draft.content.length < 1400 || draft.content.length > 18000
      || draft.content.split(/\n#{1,3} /).length < 4) reasons.push('INSUFFICIENT_ORIGINAL_CONTENT');
  if (!nativeScripts[slot.country](body)) reasons.push('LOCALE_NOT_VERIFIED');

  // A native-script minimum alone accepts multilingual word salad. Exclude the
  // exact verified URL and unrelated prose metadata from these checks.
  const editorialText=(draft.title+'\n'+draft.excerpt+'\n'+draft.content)
    .replaceAll(primary.url,'').replace(/## Official primary source/gi,'');
  if (/[\u0e00-\u0e7f\u0600-\u06ff]/u.test(editorialText)
    || (slot.country !== 'KR' && /[가-힣]/u.test(editorialText))
    || (slot.country === 'CN' && /[\u3040-\u30ff]/u.test(editorialText))) {
    reasons.push('FOREIGN_LANGUAGE_INTRUSION');
  }
  // Common programming protocol names are valid in translated technical prose;
  // English word salad in economic Japanese/Korean/Chinese prose is not.
  const acceptedTerms=/^(?:JavaScript|TypeScript|HTTP|HTTPS|HTML|CSS|JSON|SQL|TCP|IP|DNS|TLS|API|URL|CPU|GPU|RAM|DOM|Node|Web|React|Promise|async|await|fetch|browser)$/i;
  if (slot.country !== 'US' && slot.topic === 'ECONOMY') {
    const englishWords=[...editorialText.matchAll(/\b[A-Za-z]{4,}\b/g)]
      .map(m=>m[0]).filter(word=>!acceptedTerms.test(word));
    if (englishWords.length >= 3) reasons.push('UNNATURAL_MIXED_LANGUAGE');
  }

  // Treat repeated complete sentences as a failed originality/quality test,
  // even if the article is long and its content hash is different.
  const sentences=editorialText.split(/[.!?。！？\n]+/)
    .map(value=>value.replace(/\s+/g,' ').trim())
    .filter(value=>value.length >= 32);
  const repeated=new Map<string,number>();
  for (const sentence of sentences) {
    const count=(repeated.get(sentence) ?? 0)+1;
    repeated.set(sentence,count);
    if (count >= 3) { reasons.push('REPETITIVE_SYNTHETIC_SENTENCES'); break; }
  }
  if (!primary.digest.match(/^[a-f0-9]{64}$/) || !draft.content.includes(primary.url)
      || [...draft.content.matchAll(links)].some(m => m[0] !== primary.url)) {
    reasons.push('PRIMARY_SOURCE_NOT_GROUNDED');
  }
  if (knownDigests.has(digest)) reasons.push('DUPLICATE_CONTENT');
  if (forbidden.some(rule => rule.test(body))
      || /(?:you should buy now|지금\s*매수|立即买入|今すぐ買え)/i.test(body)) {
    reasons.push('UNVERIFIED_FINANCIAL_OR_TECHNICAL_CLAIM');
  }
  // No invented decimal figures, percentages, years or benchmark measurements.
  // Numbers needed for software examples must be introduced by trusted examples
  // during a separate reproducibility check before enabling that category.
  if (/(?:\b\d{4}\b|\b\d{1,3}(?:\.\d+)?\s*%)/.test(body)) {
    reasons.push('NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF');
  }
  if (slot.topic !== 'ECONOMY' && !/(?:JavaScript|HTTP|TCP|JSON|SQL|네트워크|ネットワーク|网络)/i.test(body)) {
    reasons.push('TECH_EXAMPLE_NOT_VERIFIED');
  }
  return { eligible: reasons.length === 0, reasons, digest };
}
