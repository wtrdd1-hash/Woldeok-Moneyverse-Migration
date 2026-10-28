/** Canonical WLD bigint query value, never rounded through Number(). */
export function normalizeShopPriceCeiling(input: unknown): { value: string; invalid: boolean } {
  if (input === undefined || input === '') return { value: '', invalid: false };
  if (typeof input !== 'string' || !/^(0|[1-9][0-9]{0,18})$/.test(input)) {
    return { value: '', invalid: true };
  }
  if (BigInt(input) > 9223372036854775807n) return { value: '', invalid: true };
  return { value: input, invalid: false };
}
