/**
 * Money formatting.
 *
 * Every amount that crosses the API is a canonical integer *string*, and it
 * stays one here. `numeric(38,0)` columns hold values that a JavaScript number
 * cannot represent, and `Number('9' + '0'.repeat(37))` rounds without raising
 * anything — so grouping is done by walking the string.
 */

/** Groups thousands and renders a leading minus as a true minus sign (U+2212). */
export function groupDigits(amount: string): string {
  const negative = amount.startsWith('-');
  const digits = negative ? amount.slice(1) : amount;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return negative ? `−${grouped}` : grouped;
}

/** Compares two canonical integer strings without converting either to a number. */
export function compareAmounts(left: string, right: string): number {
  const leftNegative = left.startsWith('-');
  const rightNegative = right.startsWith('-');
  if (leftNegative !== rightNegative) return leftNegative ? -1 : 1;

  const a = leftNegative ? left.slice(1) : left;
  const b = rightNegative ? right.slice(1) : right;
  const trimmedA = a.replace(/^0+(?=\d)/, '');
  const trimmedB = b.replace(/^0+(?=\d)/, '');

  let magnitude: number;
  if (trimmedA.length !== trimmedB.length) {
    magnitude = trimmedA.length < trimmedB.length ? -1 : 1;
  } else {
    magnitude = trimmedA === trimmedB ? 0 : trimmedA < trimmedB ? -1 : 1;
  }
  return leftNegative ? -magnitude : magnitude;
}

/** `rise` when the current price is above the day's open, `fall` below, null when level. */
export function priceDirection(current: string, open: string): 'rise' | 'fall' | null {
  const comparison = compareAmounts(current, open);
  if (comparison === 0) return null;
  return comparison > 0 ? 'rise' : 'fall';
}

const DATE_TIME = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
const DATE_ONLY = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatMoment(value: string | null | undefined, fallback = ''): string {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? fallback : DATE_TIME.format(date);
}

export function formatDay(value: string | null | undefined, fallback = ''): string {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? fallback : DATE_ONLY.format(date);
}

/**
 * The difference between two canonical integer strings, as a signed one.
 *
 * BigInt, not Number, for the reason every other amount here avoids Number: a
 * price is a `numeric(38,0)` and subtracting through a double silently rounds
 * past 2^53.
 */
export function changeAmount(current: string, open: string): string {
  if (!/^-?\d+$/.test(current) || !/^-?\d+$/.test(open)) return '0';
  return (BigInt(current) - BigInt(open)).toString();
}

/**
 * The same difference as a percentage, to two places, sign included.
 *
 * Returns null when the opening price is zero — a move from nothing has no
 * percentage, and rendering one would be inventing a number.
 */
export function changePercent(current: string, open: string): string | null {
  if (!/^-?\d+$/.test(current) || !/^-?\d+$/.test(open)) return null;
  const base = BigInt(open);
  if (base === 0n) return null;

  // Scaled by 10,000 so two decimal places survive integer division, then
  // split back apart rather than divided into a float.
  const scaled = ((BigInt(current) - base) * 10_000n) / (base < 0n ? -base : base);
  const negative = scaled < 0n;
  const magnitude = negative ? -scaled : scaled;
  const whole = magnitude / 100n;
  const fraction = (magnitude % 100n).toString().padStart(2, '0');
  return `${negative ? '−' : '+'}${whole.toString()}.${fraction}`;
}
