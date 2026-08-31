import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CASINO_TRANSACTION_TYPES,
  DIE_FACES,
  GAME_ORDER,
  PARITY_CHOICES,
  faceRolled,
  gameLabel,
  isDieFace,
  isGameKey,
  isParityChoice,
  ledgerLabel,
  parityLabel,
} from './dice';

describe('the dice vocabulary', () => {
  it('names every game the terms function reports', () => {
    for (const game of GAME_ORDER) expect(gameLabel(game)).not.toBe('알 수 없는 게임');
  });

  it('does not invent a name for a game it does not know', () => {
    expect(gameLabel('roulette')).toBe('알 수 없는 게임');
    expect(isGameKey('roulette')).toBe(false);
  });

  it('accepts the two parity choices casino_dice_is_win accepts, and no others', () => {
    expect(PARITY_CHOICES.map((choice) => choice.value)).toEqual(['odd', 'even']);
    expect(isParityChoice('odd')).toBe(true);
    expect(isParityChoice('even')).toBe(true);
    // A face is a real choice on the other game and a real refusal on this one.
    expect(isParityChoice('3')).toBe(false);
    for (const choice of PARITY_CHOICES) expect(parityLabel(choice.value)).not.toBe('');
  });

  it('accepts the six faces of the die, and no others', () => {
    expect(DIE_FACES).toEqual(['1', '2', '3', '4', '5', '6']);
    for (const face of DIE_FACES) expect(isDieFace(face)).toBe(true);
    expect(isDieFace('0')).toBe(false);
    expect(isDieFace('7')).toBe(false);
    expect(isDieFace('odd')).toBe(false);
  });

  /** A receipt that came back malformed must not read as `undefined에 나왔어요`. */
  it('says so plainly when a receipt carries no readable face', () => {
    expect(faceRolled(4)).toBe('4');
    expect(faceRolled(0)).toBe('알 수 없음');
    expect(faceRolled(7)).toBe('알 수 없음');
    expect(faceRolled(2.5)).toBe('알 수 없음');
    expect(faceRolled(null)).toBe('알 수 없음');
    expect(faceRolled('3')).toBe('알 수 없음');
  });

  it('labels both ledger types a casino play can carry', () => {
    for (const type of CASINO_TRANSACTION_TYPES) expect(ledgerLabel(type)).not.toBe('카지노');
    expect(ledgerLabel('WORK_REWARD')).toBe('카지노');
  });
});

/**
 * The defect this file exists for.
 *
 * Migration 100 shipped both dice games with a play function, a route, a
 * repository, an action and a form -- and nothing rendered the form, so the
 * games were unreachable on a page whose title still said 동전 게임. Every
 * unit test passed, because each piece was correct on its own.
 *
 * It is the same failure the work loop had, and AGENTS.md already records the
 * lesson: a write path is not finished until something can name its arguments.
 * So this reads the page's own source and asserts the wiring, the way
 * `route-map.test.ts` reads the controllers.
 */
describe('every game the screen declares is reachable on it', () => {
  const page = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

  it('renders a form for each dice game', () => {
    expect(page).toContain('DiceParityForm');
    expect(page).toContain('DiceNumberForm');
  });

  it('asks for the per-game terms the forms are priced from', () => {
    expect(page).toContain('/api/v1/casino/games/terms');
  });

  it('does not filter the play history down to one game', () => {
    expect(page).toContain('CASINO_TRANSACTION_TYPES');
    expect(page).not.toContain("=== 'VIRTUAL_COIN_GAME'");
  });
});
