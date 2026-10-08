import type { NavEntry } from '@/lib/navigation';
import { navLabel } from '@/lib/navigation';

export interface SearchEntry extends NavEntry {
  readonly access: 'public' | 'member' | 'admin';
}

export function searchableEntries(
  publicEntries: readonly NavEntry[],
  memberEntries: readonly NavEntry[],
  adminEntries: readonly NavEntry[],
  signedIn: boolean,
  administrator: boolean,
): readonly SearchEntry[] {
  const seen = new Set<string>();
  const result: SearchEntry[] = [];
  const append = (entries: readonly NavEntry[], access: SearchEntry['access']) => {
    for (const entry of entries) {
      if (seen.has(entry.href)) continue;
      seen.add(entry.href);
      result.push({ ...entry, access });
    }
  };
  append(publicEntries, 'public');
  if (signedIn) append(memberEntries, 'member');
  if (signedIn && administrator) append(adminEntries, 'admin');
  return result;
}

export const ROUTE_KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  '/stocks': ['주식', '증권', '호가', '매매', '거래소', '체결', '차트', 'stock', 'stocks', 'share', 'shares'],
  '/bank': ['은행', '예금', '적금', '이자', '복리', '저축', '대출', 'bank', 'banking'],
  '/wallet': ['지갑', '자산', '덕지갑', '잔고', '머니', 'wallet'],
  '/bonds': ['채권', '국채', 'ktb', '국채거래소', 'bond', 'bonds'],
  '/pension': ['연금', '국민연금', 'nps', '노후', 'pension'],
  '/work': ['일자리', '직업', '알바', '노동', '작업', '잡보드', 'work', 'job', 'jobs'],
  '/businesses': ['사업', '비즈니스', '회사', '창업', '가게', '마이비즈', 'business'],
  '/shop': ['상점', '마켓', '아이템', '쇼핑', '구매', '덕마켓', 'shop', 'market'],
  '/casino': ['카지노', '도박', '미니게임', '룰렛', '하이로우', '주사위', '슬롯', 'casino', 'lucky'],
  '/newspaper': ['신문', '뉴스', '경제', '브리프', '기사', 'newspaper', 'news'],
  '/ranking': ['랭킹', '순위', '부자', '서열', '리더보드', 'ranking', 'leaderboard'],
  '/attendance': ['출석', '출석체크', '룰렛', '보너스', 'attendance'],
  '/quests': ['퀘스트', '미션', '일일퀘스트', '보상', 'quest', 'quests'],
  '/community': ['커뮤니티', '게시판', '포럼', '글', 'community', 'board'],
  '/guide': ['가이드', '설명서', '도움말', '사용법', '매뉴얼', 'guide', 'tutorial'],
  '/features': ['기능', '핵심기능', '특징', 'features'],
};

export function filterSearchEntries(
  entries: readonly SearchEntry[],
  query: string,
): readonly SearchEntry[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return entries.filter((entry) => {
    const keywords = (ROUTE_KEYWORDS[entry.href] ?? []).join(' ').toLocaleLowerCase();
    const labels = `${entry.label} ${navLabel(entry.label, 'en')} ${entry.href} ${keywords}`.toLocaleLowerCase();
    return labels.includes(normalized);
  });
}

