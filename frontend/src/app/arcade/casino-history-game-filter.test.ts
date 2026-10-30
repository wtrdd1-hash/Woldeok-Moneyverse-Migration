import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCasinoHistoryGame, parseVerifiedCasinoHistory } from '@/lib/casino-history-proof';

const id = '00000000-0000-4000-8000-000000000001';
const sample = { play_id: id, game: 'coin', choice: 'heads', outcome: 'tails', stake_amount: '9007199254740993', net_amount: '-9007199254740993', transaction_id: id, played_at: '2026-10-30T03:00:00.000Z' };

describe('owner arcade history source proof', () => {
  it('normalizes all/valid games but rejects duplicates, unknowns and blank values', () => {
    expect(parseCasinoHistoryGame(undefined)).toBe('all');
    expect(parseCasinoHistoryGame('all')).toBe('all');
    expect(parseCasinoHistoryGame('dice_number')).toBe('dice_number');
    expect(parseCasinoHistoryGame('wheel_20')).toBeNull();
    expect(parseCasinoHistoryGame(['coin', 'coin'])).toBeNull();
    expect(parseCasinoHistoryGame('roulette')).toBeNull();
    expect(parseCasinoHistoryGame('')).toBeNull();
  });
  it('accepts only bounded, correctly filtered owner-play-shaped records with exact WLD strings', () => {
    expect(parseVerifiedCasinoHistory([sample], 'coin')).toEqual([sample]);
    expect(parseVerifiedCasinoHistory([], 'coin')).toEqual([]);
    expect(parseVerifiedCasinoHistory([sample], 'dice_parity')).toBeNull();
    expect(parseVerifiedCasinoHistory([{ ...sample, stake_amount: Number('9007199254740993') }], 'coin')).toBeNull();
    expect(parseVerifiedCasinoHistory([{ ...sample, net_amount: '1.5' }], 'coin')).toBeNull();
    expect(parseVerifiedCasinoHistory([{ ...sample, played_at: 'not-a-date' }], 'coin')).toBeNull();
    expect(parseVerifiedCasinoHistory([sample, sample], 'coin')).toBeNull();
    expect(parseVerifiedCasinoHistory(Array.from({ length: 21 }, (_, n) => ({ ...sample, play_id: id.slice(0,-1) + String(n%10) })), 'all')).toBeNull();
    expect(parseVerifiedCasinoHistory({ plays: [] }, 'all')).toBeNull();
  });
});


describe('arcade history member entry', () => {
  it('offers a keyboard-labelled game filter with truthful source scope', () => {
    const page = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
    expect(page).toContain('htmlFor="casino-history-game"');
    expect(page).toContain('name="game"');
    expect(page).toContain('parseVerifiedCasinoHistory(rawHistory, selectedGame)');
    expect(page).toContain('테마 게임은 이 기록에 포함되지');
    expect(page).toContain('전체 누적 기록이나 정산 증명이 아닙니다');
  });
});
