import { ShopInputError } from './shop.repository';

/** PostgreSQL bigint upper bound. Never convert WLD to a JavaScript Number. */
const MAX_WLD_PRICE = 9223372036854775807n;
const CANONICAL_NONNEGATIVE_INTEGER = /^(0|[1-9][0-9]{0,18})$/;

/** An absent or empty optional form field means no filter; ambiguous input is rejected. */
export function parseShopMaxPrice(raw: unknown): bigint | null {
  if (raw === undefined || raw === '') return null;
  if (typeof raw !== 'string' || !CANONICAL_NONNEGATIVE_INTEGER.test(raw)) {
    throw new ShopInputError('maxPrice must be a canonical nonnegative WLD integer string');
  }
  const amount = BigInt(raw);
  if (amount > MAX_WLD_PRICE) {
    throw new ShopInputError('maxPrice exceeds the WLD bigint range');
  }
  return amount;
}

/** Only filter the existing server-authoritative, already scoped SQL catalogue. */
export function filterShopByMaxPrice<T extends { readonly price: unknown }>(
  rows: readonly T[],
  ceiling: bigint | null,
): T[] {
  if (ceiling === null) return [...rows];
  return rows.filter((row) => {
    if (typeof row.price !== 'string' || !CANONICAL_NONNEGATIVE_INTEGER.test(row.price)) {
      throw new Error('database returned an invalid shop item price');
    }
    const price = BigInt(row.price);
    if (price > MAX_WLD_PRICE) throw new Error('database returned an out-of-range shop item price');
    return price <= ceiling;
  });
}
