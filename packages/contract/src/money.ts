/**
 * Money in this application is an integer string, never a JavaScript number.
 * Database money columns are NUMERIC integer values and node-postgres returns
 * them as strings. Services may use BigInt only for exact in-process arithmetic. Branding the type
 * makes it a compile error to put a number where an amount belongs.
 */
export type WldAmount = string & { readonly __wld: unique symbol };

// Canonical: no leading zeros, no plus sign, no exponent, no separators, no
// negative zero. Monetary magnitude is intentionally not capped here; HTTP body
// limits remain the abuse-control boundary, while PostgreSQL NUMERIC stores the
// authoritative integer exactly.
const CANONICAL_INTEGER = /^(0|-?[1-9][0-9]*)$/;

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
