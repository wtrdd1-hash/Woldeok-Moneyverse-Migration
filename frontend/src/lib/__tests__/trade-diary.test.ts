// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadTradeDiaryEntries,
  saveTradeDiaryEntry,
  deleteTradeDiaryEntry,
  getDefaultStarterDiary,
} from '@/lib/trade-diary';

describe('Trade Diary & Execution Review Module (Section 5.7)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads starter default diary entries when storage is empty', () => {
    const entries = loadTradeDiaryEntries();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]?.symbol).toBe('WDG');
    expect(entries[0]?.reasonTag).toBe('공시/호재');
  });

  it('saves new trade diary entry with UUID and timestamp correctly', () => {
    const newEntry = saveTradeDiaryEntry({
      symbol: 'MYUY',
      side: 'buy',
      price: '1450',
      quantity: '20',
      executedAt: '2026-10-03T12:00:00.000Z',
      reasonTag: '기술적돌파',
      emotionTag: '자신감',
      reviewNote: '2상 임상 유효성 지표 충족 공시 후 전고점 돌파 시 매수.',
    });

    expect(newEntry.id).toBeDefined();
    expect(newEntry.createdAt).toBeDefined();

    const loaded = loadTradeDiaryEntries();
    expect(loaded[0]?.id).toBe(newEntry.id);
    expect(loaded[0]?.symbol).toBe('MYUY');
  });

  it('deletes trade diary entry by ID successfully', () => {
    const newEntry = saveTradeDiaryEntry({
      symbol: 'WDB',
      side: 'sell',
      price: '850',
      quantity: '5',
      executedAt: '2026-10-03T12:30:00.000Z',
      reasonTag: '수익실현',
      emotionTag: '차분함',
      reviewNote: '자사주 소각 공시 반등 시 50% 분할 매도.',
    });

    deleteTradeDiaryEntry(newEntry.id);
    const loaded = loadTradeDiaryEntries();
    expect(loaded.find((e) => e.id === newEntry.id)).toBeUndefined();
  });
});
