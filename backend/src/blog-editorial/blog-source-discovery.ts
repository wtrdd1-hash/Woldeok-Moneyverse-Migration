import type { BlogRotationSlot } from './blog-two-hour-rotation';

/**
 * v1414: bounded discovery over trusted primary-publisher feeds and document
 * indexes. Never treat search snippets, an LLM response or a third-party
 * aggregator as publication evidence: only the final HTTPS source page counts.
 */
const ECONOMY_FEEDS: Partial<Record<BlogRotationSlot['country'], string>> = {
  KR: 'https://www.bok.or.kr/portal/bbs/B0000552/news.rss?menuNo=200690',
  US: 'https://www.federalreserve.gov/feeds/press_all.xml',
};

const TOPIC_WORDS: Record<BlogRotationSlot['topic'], RegExp> = {
  ECONOMY: /(?:경제|물가|금융|통화|은행|지급결제|금리|경제정책|inflation|economy|economic|monetary|payment|credit|financial|policy|bank|price|経済|物価|金融|政策|銀行|货币|经济|金融|银行|支付)/i,
  CODING: /(?:JavaScript|programming|functions?|objects?|arrays?|promise|async|code|reference|API|코딩|프로그래밍|함수|자바스크립트|プログラミング|関数|编程|函数)/i,
  COMPUTER: /(?:HTTP|network|request|response|headers?|cookies?|cache|TCP|browser|protocol|네트워크|서버|프로토콜|ネットワーク|通信|网络|协议)/i,
};

function decodeEntities(text: string): string {
  return text.replace(/&(?:amp|quot|apos|lt|gt|nbsp|#\d+|#x[0-9a-f]+);/gi, (value) => {
    const named: Record<string, string> = {
      '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ',
    };
    const lower = value.toLowerCase();
    if (named[lower]) return named[lower];
    const codepoint = lower.startsWith('&#x')
      ? Number.parseInt(lower.slice(3, -1), 16)
      : Number.parseInt(lower.slice(2, -1), 10);
    return Number.isInteger(codepoint) && codepoint >= 32 && codepoint <= 0x10ffff
      ? String.fromCodePoint(codepoint) : '';
  });
}

function clean(text: string): string {
  return decodeEntities(text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')).trim();
}

/** Exact host, secure scheme, locale and topic path. No arbitrary redirects. */
export function isAllowedSourceDocument(
  rawUrl: string,
  trustedRoot: string,
  slot: BlogRotationSlot,
): boolean {
  try {
    const url = new URL(rawUrl);
    const trusted = new URL(trustedRoot);
    if (url.protocol !== 'https:' || url.host !== trusted.host || url.username || url.password
        || url.port || url.hash || url.pathname.includes('\\')
        || /%2f|%5c|%00/i.test(url.pathname)
        || /\.(?:pdf|zip|exe|svg|png|jpg|jpeg|mp4|xml)$/i.test(url.pathname)) return false;
    if (slot.topic !== 'ECONOMY') {
      // Broad educational networking posts require primary documentation
      // about concepts, not isolated status-code error pages. A narrow 421
      // error explainer can otherwise be misrepresented as general HTTP.
      if (slot.topic === 'COMPUTER'
          && /\/Reference\//i.test(url.pathname)) return false;
      const locale = { KR: 'ko', US: 'en-US', JP: 'ja', CN: 'zh-CN' }[slot.country];
      const section = slot.topic === 'CODING' ? 'JavaScript' : 'HTTP';
      return url.hostname === 'developer.mozilla.org'
        && (url.pathname === `/${locale}/docs/Web/${section}`
          || url.pathname.startsWith(`/${locale}/docs/Web/${section}/`));
    }
    if (slot.country === 'KR') return url.pathname.startsWith('/portal/');
    if (slot.country === 'US') return url.pathname.startsWith('/monetarypolicy/')
      || url.pathname === '/monetarypolicy.htm' || url.pathname.startsWith('/newsevents/');
    if (slot.country === 'JP') return url.pathname.startsWith('/mopo/');
    return url.pathname.startsWith('/en/') || url.pathname.startsWith('/goutongjiaoliu/');
  } catch {
    return false;
  }
}

interface Candidate { url: string; title: string }

function rssItems(xml: string): Candidate[] {
  const results: Candidate[] = [];
  for (const item of xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) ?? []) {
    const title = item.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
    const link = item.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? '';
    if (title && link) results.push({ title: clean(title), url: clean(link) });
    if (results.length >= 60) break;
  }
  return results;
}

function indexLinks(html: string, root: string): Candidate[] {
  const results: Candidate[] = [];
  const links = /<a\b[^>]*\bhref\s*=\s*(["'])([^"']{1,600})\1[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(links)) {
    try {
      const href = decodeEntities(match[2]!);
      const url = new URL(href, root);
      url.hash = '';
      results.push({url: url.toString(), title: clean(match[3]!).slice(0, 250)});
    } catch { /* ignore malformed document links */ }
    if (results.length >= 1200) break;
  }
  return results;
}

async function fetchIndex(
  url: string,
  kind: 'feed' | 'html',
  loader: typeof fetch,
): Promise<string | null> {
  try {
    const response = await loader(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Moneyverse-Source-Verification/1.0' },
    });
    const mime = response.headers.get('content-type') ?? '';
    if (response.status !== 200 || (kind === 'feed'
      ? !/(?:application|text)\/(?:rss\+xml|xml)/i.test(mime)
      : !/^text\/html/i.test(mime))) return null;
    const declared = Number(response.headers.get('content-length') ?? 0);
    if (declared > 850000) return null;
    const text = await response.text();
    return text.length >= 100 && text.length <= 850000 ? text : null;
  } catch {
    // An unavailable index cannot silently turn an unverified URL into a source.
    return null;
  }
}

function rotate<T>(items: readonly T[], slot: BlogRotationSlot): T[] {
  if (!items.length) return [];
  const dayNumber = Number(slot.editorialDay.replaceAll('-', ''));
  const offset = (dayNumber + slot.slotIndex) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

/**
 * Search article-level links on official feeds / trusted documentation indexes.
 * At most five candidates plus the exact preapproved fallback. All pages
 * subsequently undergo independent status/mime/size/content/hash validation.
 */
export async function discoverPrimaryCandidates(
  slot: BlogRotationSlot,
  trustedRoot: string,
  loader: typeof fetch = fetch,
): Promise<string[]> {
  let found: Candidate[] = [];
  const feed = slot.topic === 'ECONOMY' ? ECONOMY_FEEDS[slot.country] : undefined;
  if (feed) {
    const xml = await fetchIndex(feed, 'feed', loader);
    if (xml) found = rssItems(xml);
  }
  if (!found.length) {
    const html = await fetchIndex(trustedRoot, 'html', loader);
    if (html) found = indexLinks(html, trustedRoot);
  }
  const seen = new Set<string>();
  const filtered: string[] = [];
  for (const entry of found) {
    if (!TOPIC_WORDS[slot.topic].test(entry.title)) continue;
    if (!isAllowedSourceDocument(entry.url, trustedRoot, slot)) continue;
    const url = new URL(entry.url);
    url.hash = '';
    const value = url.toString();
    if (value === trustedRoot || seen.has(value)) continue;
    seen.add(value);
    filtered.push(value);
  }
  return [...rotate(filtered, slot).slice(0, 5), trustedRoot];
}
