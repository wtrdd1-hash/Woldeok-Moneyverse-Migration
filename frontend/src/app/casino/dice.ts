/**
 * The dice games' pure vocabulary.
 *
 * Beside `coin.ts` rather than inside it: that module is the coin's, and the
 * two families share only what a casino screen needs of both -- the closure
 * copy, the parts-per-million formatting and the sign of a net amount, all of
 * which already live there and are imported from there.
 *
 * Free of `server-only`, because the page that renders the odds, the server
 * actions that read the forms and the client forms that label their own
 * controls all need it.
 */

/** The three games `public.casino_game_terms` reports, in the order it does. */
export type CasinoGameKey = 'coin' | 'dice_parity' | 'dice_number';

export const GAME_ORDER: readonly CasinoGameKey[] = Object.freeze([
  'coin',
  'dice_parity',
  'dice_number',
]);

const GAME_LABEL: Readonly<Record<CasinoGameKey, string>> = Object.freeze({
  coin: '동전 맞히기',
  dice_parity: '주사위 홀짝',
  dice_number: '주사위 숫자 맞히기',
});

export function gameLabel(game: string): string {
  return isGameKey(game) ? GAME_LABEL[game] : '알 수 없는 게임';
}

export function isGameKey(value: string): value is CasinoGameKey {
  return value === 'coin' || value === 'dice_parity' || value === 'dice_number';
}

/**
 * How a play is named in the member's own ledger.
 *
 * The two games share one transaction type, because the ledger records that
 * WLD moved for a roll of the die and not which rule decided it -- the outbox
 * payload carries the game. A row that says 주사위 is therefore honest and
 * saying more would mean reading a table this screen cannot reach.
 */
const LEDGER_LABEL: Readonly<Record<string, string>> = Object.freeze({
  VIRTUAL_COIN_GAME: '동전 맞히기',
  VIRTUAL_DICE_GAME: '주사위',
});

export const CASINO_TRANSACTION_TYPES: readonly string[] = Object.freeze([
  'VIRTUAL_COIN_GAME',
  'VIRTUAL_DICE_GAME',
]);

export function ledgerLabel(type: string): string {
  return LEDGER_LABEL[type] ?? '카지노';
}

/** 주사위 홀짝's two sides, as `casino_dice_is_win` names them. */
export const PARITY_CHOICES: readonly { readonly value: string; readonly label: string }[] =
  Object.freeze([
    { value: 'odd', label: '홀' },
    { value: 'even', label: '짝' },
  ]);

export function parityLabel(choice: string): string {
  if (choice === 'odd') return '홀';
  if (choice === 'even') return '짝';
  return '알 수 없음';
}

export function isParityChoice(value: string): boolean {
  return value === 'odd' || value === 'even';
}

/** The six faces, as strings, because that is what the choice column holds. */
export const DIE_FACES: readonly string[] = Object.freeze(['1', '2', '3', '4', '5', '6']);

export function isDieFace(value: string): boolean {
  return DIE_FACES.includes(value);
}

/**
 * The face a roll showed, for the sentence a member reads afterwards.
 *
 * `outcome_face` is an integer column rather than an amount, so it arrives as
 * a number -- but a receipt that came back malformed must not be rendered as
 * `undefined에 나왔어요`.
 */
export function faceRolled(value: unknown): string {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6
    ? String(value)
    : '알 수 없음';
}
