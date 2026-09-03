/**
 * The coin game's pure vocabulary.
 *
 * In its own module, free of `server-only`, because all three halves need it:
 * the page that renders the odds, the server action that reads the form, and
 * the client form that labels its own controls. Nothing here touches the
 * network or the clock except where a caller hands it a moment.
 */

/**
 * Why the casino would not answer, as the API names it.
 *
 * The controller sends a `code` on every closure precisely because the status
 * cannot be told apart from the other refusals these routes make: a 403 here
 * would otherwise read exactly like a rejected CSRF token, and a 503 exactly
 * like the database being offline. `detail` is English operator prose, so the
 * code is the only thing a Korean sentence may be chosen from.
 */
export type CasinoClosure = 'disabled' | 'paused' | 'safe_mode';

const CLOSURE_CODES: Readonly<Record<string, CasinoClosure>> = Object.freeze({
  casino_disabled: 'disabled',
  casino_paused: 'paused',
  casino_safe_mode: 'safe_mode',
});

/**
 * Reads the closure out of whatever was thrown.
 *
 * Duck-typed rather than `instanceof ApiError`, because this module is
 * imported by a client component and `@/lib/api` is `server-only` — importing
 * it here would be a build error by design. The shape is the same either way:
 * an error carrying a string `code`.
 */
export function closureOf(error: unknown): CasinoClosure | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null;
  const code = (error as { readonly code?: unknown }).code;
  if (typeof code !== 'string') return null;
  return CLOSURE_CODES[code] ?? null;
}

/**
 * What a member is told for each closure, and it is three different things.
 *
 * 'disabled' is the game being shut rather than busy: the MVP keeps it closed
 * until the game rating, gambling-risk and youth-protection review named in
 * the specification is signed off, and no amount of waiting by the member
 * changes that — so the sentence must not promise "later today". The other
 * two are operator states meant to be lifted, where "come back later" is
 * literally true.
 */
export const CLOSURE_COPY: Readonly<
  Record<CasinoClosure, { readonly title: string; readonly description: string }>
> = Object.freeze({
  disabled: {
    title: '미니게임을 준비하고 있어요.',
    description: '시스템 정비가 완료된 후 다시 열릴 예정입니다. 조금만 기다려 주세요.',
  },
  paused: {
    title: '잠시 점검 중이에요.',
    description: '원활한 서비스 제공을 위해 점검 중입니다. 잠시 후 다시 이용해 주세요.',
  },
  safe_mode: {
    title: '안전 점검 모드입니다.',
    description: '데이터 무결성 확인을 위해 일시 제한됩니다. 잠시 후 다시 이용해 주세요.',
  },
});

/**
 * A figure in parts per million, as a decimal string with two places.
 *
 * `scale` is how many ppm make one hundredth of the unit being shown: 100 for
 * a percentage, 10,000 for a multiple of the stake. Rounded on the magnitude
 * so a negative house edge rounds the same distance a positive one does —
 * `Math.round` breaks ties towards positive infinity, which would otherwise
 * make the two directions disagree.
 *
 * These are counts out of a million and integer columns at that, never money,
 * which is why arithmetic on them is allowed here at all.
 */
function twoPlaces(ppm: number, scale: number): string {
  if (!Number.isFinite(ppm)) return '—';
  const negative = ppm < 0;
  const hundredths = Math.round(Math.abs(ppm) / scale);
  const whole = Math.trunc(hundredths / 100);
  const fraction = String(hundredths % 100).padStart(2, '0');
  // U+2212, the true minus sign, as `groupDigits` uses for an amount.
  return `${negative ? '−' : ''}${whole}.${fraction}`;
}

/** 500000 -> '50.00', for a probability disclosed as a percentage. */
export function percentFromPpm(ppm: number): string {
  return twoPlaces(ppm, 100);
}

/** 2000000 -> '2.00', for a payout disclosed as a multiple of the stake. */
export function multiplierFromPpm(ppm: number): string {
  return twoPlaces(ppm, 10_000);
}

/**
 * Drops the trailing zeros a `numeric(12,6)` arrives with, so a z-score reads
 * as `0.62` rather than `0.620000`. A value that is not a plain decimal is
 * returned untouched rather than mangled.
 */
export function trimZeros(value: string): string {
  if (!/^-?\d+\.\d+$/.test(value)) return value;
  return value.replace(/0+$/, '').replace(/\.$/, '');
}

/** The two faces the schema's CHECK allows. */
export function faceLabel(face: string): string {
  if (face === 'heads') return '앞면';
  if (face === 'tails') return '뒷면';
  return '알 수 없음';
}

/**
 * Which way one play went, read off the signed net amount.
 *
 * On the string, not through a number: a net amount is a `bigint` and the
 * only question asked of it here is its sign, which the leading character
 * answers exactly. A stake is always above zero so 'even' is unreachable
 * today, but a zero net is a fact this must not report as a win.
 */
export type PlayResult = 'win' | 'loss' | 'even';

export function resultOf(netAmount: string): PlayResult {
  if (netAmount.startsWith('-')) return 'loss';
  return /^0+$/.test(netAmount) ? 'even' : 'win';
}

/** The magnitude of a signed amount, still a string. */
export function absAmount(value: string): string {
  return value.startsWith('-') ? value.slice(1) : value;
}

/**
 * How long a member may lock their own limits for.
 *
 * A lock is what makes a self-limit a self-limit: the database refuses to
 * loosen one until it expires. Offered as a few fixed lengths rather than a
 * date field, because the member is answering "how long do I want to be kept
 * out", not picking a calendar day.
 */
export const LOCK_CHOICES: readonly { readonly value: string; readonly label: string }[] =
  Object.freeze([
    { value: 'none', label: '잠그지 않기' },
    { value: '1', label: '1일 동안 잠그기' },
    { value: '7', label: '7일 동안 잠그기' },
    { value: '30', label: '30일 동안 잠그기' },
  ]);

export function isLockChoice(value: string): boolean {
  return LOCK_CHOICES.some((choice) => choice.value === value);
}

const DAY_MS = 86_400_000;

/**
 * The moment a lock expires, or null for no lock.
 *
 * `from` is passed in rather than read here so the function stays pure and a
 * test can pin the clock. The database compares this against its own
 * `clock_timestamp()` and refuses anything not in the future, which is the
 * comparison that actually decides — this only has to send a moment far
 * enough ahead that the round trip cannot overtake it.
 */
export function lockUntilIso(choice: string, from: Date): string | null {
  const days = Number.parseInt(choice, 10);
  if (!Number.isSafeInteger(days) || days <= 0 || days > 365) return null;
  return new Date(from.getTime() + days * DAY_MS).toISOString();
}

/**
 * Reads a self-limit out of a form field.
 *
 * Zero is accepted, which is the whole reason this is not `wholeAmount` from
 * `@/lib/mutate`: that one refuses zero because no transfer, purchase or
 * stake of nothing makes sense, while a self-limit of zero is a member
 * saying they will stake nothing at all — the strongest setting on the form
 * and the one it would be worst to reject.
 *
 * `Number` here is the same exception `wholeAmount` takes: this is an inbound
 * request field that leaves as a JSON integer, bounded by what a member can
 * type, and re-checked by the database function. No balance is ever read
 * through it.
 */
export function selfLimitAmount(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.replaceAll(',', '').trim();
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}
