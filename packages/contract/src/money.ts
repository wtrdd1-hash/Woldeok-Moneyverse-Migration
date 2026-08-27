/**
 * Money in this application is an integer string, never a JavaScript number.
 * The database columns are bigint and numeric(38, 0); node-postgres returns
 * both as strings, and the services convert with BigInt(). Branding the type
 * makes it a compile error to put a number where an amount belongs.
 */
export type WldAmount = string & { readonly __wld: unique symbol };

// Canonical: no leading zeros, no plus sign, no exponent, no separators, no
// negative zero, and up to 38 digits — matching the widest money columns in
// use, numeric(38, 0) (see
// packages/database/migrations/018-economy-reconciliation-health.sql).
const CANONICAL_INTEGER = /^(0|-?[1-9][0-9]{0,37})$/;

export function isWldAmount(value: unknown): value is WldAmount {
  return typeof value === 'string' && CANONICAL_INTEGER.test(value);
}

export function wldAmount(value: string, field: string): WldAmount {
  if (!CANONICAL_INTEGER.test(value)) {
    throw new TypeError(`${field} must be a canonical integer string`);
  }
  // Invariant: CANONICAL_INTEGER has just matched `value`, so it is a
  // canonical integer string and safe to brand as WldAmount.
  return value as WldAmount;
}
