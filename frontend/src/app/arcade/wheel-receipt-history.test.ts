import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { addVerifiedWheelResult, isReceiptUuid, parseVerifiedWheelOutcome } from './wheel-receipt-history';

const FIRST = '550e8400-e29b-41d4-a716-446655440000';
const SECOND = '550e8400-e29b-41d4-a716-446655440001';

const receipt = (overrides: Partial<Parameters<typeof addVerifiedWheelResult>[1]> = {}) => ({
  playId: FIRST,
  transactionId: SECOND,
  themeOutcome: '7:blue',
  netAmount: '100',
  replayed: false,
  ...overrides,
});

describe('wheel results are server receipt backed', () => {
  it('rejects malformed UUIDs and forged segment colors', () => {
    expect(isReceiptUuid(FIRST)).toBe(true);
    expect(isReceiptUuid('fake-id')).toBe(false);
    expect(parseVerifiedWheelOutcome('7:blue')).toEqual({ seg: 7, type: 'blue' });
    for (const forged of ['7:gold', '11:blue', '18:violet', '0:blue', '21:neutral', 'NaN:blue', '1:blue:extra']) {
      expect(parseVerifiedWheelOutcome(forged)).toBeNull();
    }
  });

  it('starts empty and accepts only committed, correctly formatted receipts', () => {
    expect(addVerifiedWheelResult([], receipt({ playId: 'fake' }))).toEqual([]);
    expect(addVerifiedWheelResult([], receipt({ transactionId: '' }))).toEqual([]);
    expect(addVerifiedWheelResult([], receipt({ netAmount: 'Infinity' }))).toEqual([]);
    expect(addVerifiedWheelResult([], receipt({ themeOutcome: '7:gold' }))).toEqual([]);
    expect(addVerifiedWheelResult([], receipt())).toEqual([{ playId: FIRST, transactionId: SECOND, seg: 7, type: 'blue', isWin: true }]);
  });

  it('deduplicates idempotent replays and caps recent verified session receipts', () => {
    const first = addVerifiedWheelResult([], receipt());
    expect(addVerifiedWheelResult(first, receipt({ replayed: true }))).toEqual(first);
    expect(addVerifiedWheelResult(first, receipt({ playId: SECOND, transactionId: FIRST, themeOutcome: '19:neutral', netAmount: '-20' }))).toEqual([
      { playId: SECOND, transactionId: FIRST, seg: 19, type: 'neutral', isWin: false },
      ...first,
    ]);
    let history = first;
    for (let i = 1; i < 15; i++) {
      const id = `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`;
      history = addVerifiedWheelResult(history, receipt({ playId: id }));
    }
    expect(history).toHaveLength(10);
  });

  it('never presents seeded results or persistent casino history as wheel results', () => {
    const component = readFileSync(join(__dirname, 'wheel-game.tsx'), 'utf8');
    const page = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
    expect(component).not.toContain("{ seg: 7, type: 'blue', isWin: true }");
    expect(component).toContain('이번 화면에서 서버 확인한 결과');
    expect(component).toContain('아직 확인된 룰렛 결과가 없습니다');
    expect(page).toContain('robots: { index: false, follow: false }');
  });
});
