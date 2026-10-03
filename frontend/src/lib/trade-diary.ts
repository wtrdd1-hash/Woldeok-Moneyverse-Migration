/**
 * Trade Diary & Trade Review Note Engine (Section 5.7)
 */

export type TradeReasonTag =
  | '기술적돌파'
  | '공시/호재'
  | '물타기/평단관리'
  | '수익실현'
  | '손절매'
  | '섹터분산'
  | '뇌동매매';

export type TradeEmotionTag =
  | '냉정/계획적'
  | '자신감'
  | '불안/초조'
  | '패닉/공포'
  | '차분함';

export interface TradeDiaryEntry {
  readonly id: string;
  readonly symbol: string;
  readonly side: 'buy' | 'sell';
  readonly price: string;
  readonly quantity: string;
  readonly executedAt: string;
  readonly reasonTag: TradeReasonTag;
  readonly emotionTag: TradeEmotionTag;
  readonly reviewNote: string;
  readonly createdAt: string;
}

const STORAGE_KEY = 'wdmv_trade_diary_entries_v1';

export function loadTradeDiaryEntries(): readonly TradeDiaryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStarterDiary();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultStarterDiary();
  } catch {
    return getDefaultStarterDiary();
  }
}

export function saveTradeDiaryEntry(entry: Omit<TradeDiaryEntry, 'id' | 'createdAt'>): TradeDiaryEntry {
  const current = loadTradeDiaryEntries();
  const newEntry: TradeDiaryEntry = {
    ...entry,
    id: `diary-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newEntry, ...current];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    } catch {
      // Storage quota or private mode fallback
    }
  }
  return newEntry;
}

export function deleteTradeDiaryEntry(id: string): void {
  const current = loadTradeDiaryEntries();
  const filtered = current.filter((item) => item.id !== id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  }
}

export function getDefaultStarterDiary(): readonly TradeDiaryEntry[] {
  return [
    {
      id: 'diary-demo-001',
      symbol: 'WDG',
      side: 'buy',
      price: '1450',
      quantity: '10',
      executedAt: '2026-10-02T14:30:00.000Z',
      reasonTag: '공시/호재',
      emotionTag: '냉정/계획적',
      reviewNote: '동시접속자 50만 돌파 공시 확인 후 지지선 부근에서 분할 1차 매수 진입.',
      createdAt: '2026-10-02T14:35:00.000Z',
    },
    {
      id: 'diary-demo-002',
      symbol: 'WDT',
      side: 'buy',
      price: '1714',
      quantity: '5',
      executedAt: '2026-10-02T15:10:00.000Z',
      reasonTag: '섹터분산',
      emotionTag: '차분함',
      reviewNote: '기술 섹터 포트폴리오 비중 확대를 위해 AI 엔진 V3 계약 소식 확인 후 매수.',
      createdAt: '2026-10-02T15:15:00.000Z',
    },
  ];
}
