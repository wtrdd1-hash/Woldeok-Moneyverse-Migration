/**
 * Money in this application is an exact integer string, never a JavaScript number.
 * PostgreSQL stores authoritative WLD balances in unbounded-precision NUMERIC
 * columns; node-postgres returns those values as strings. Branding the type
 * prevents accidental conversion to IEEE-754 numbers in application code.
 */
export type WldAmount = string & { readonly __wld: unique symbol };

/** PostgreSQL NUMERIC's documented maximum digits before the decimal point. */
export const WLD_MAX_DIGITS = 131_072;

// Canonical: no leading zeros, no plus sign, no exponent, no separators and no
// negative zero. WLD is integer-only. The digit limit mirrors PostgreSQL's
// physical NUMERIC maximum rather than a game/economy policy limit.
const CANONICAL_INTEGER = /^(0|-?[1-9][0-9]*)$/;

function digitCount(value: string): number {
  return value.startsWith('-') ? value.length - 1 : value.length;
}

export function isWldAmount(value: unknown): value is WldAmount {
  return (
    typeof value === 'string' &&
    CANONICAL_INTEGER.test(value) &&
    digitCount(value) <= WLD_MAX_DIGITS
  );
}

export function wldAmount(value: string, field: string): WldAmount {
  if (!isWldAmount(value)) {
    throw new TypeError(`${field} must be a canonical WLD integer string`);
  }
  return value as WldAmount;
}
