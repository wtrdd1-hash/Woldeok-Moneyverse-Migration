/** The budget is a search cap, not proof of wallet liquidity or purchase eligibility. */
export function parseBusinessBudget(value: string | string[] | undefined): {
  readonly value: string | null;
  readonly invalid: boolean;
} {
  if (value === undefined) return { value: null, invalid: false };
  if (typeof value !== 'string' || !/^(?:0|[1-9][0-9]{0,17})$/.test(value)) {
    return { value: null, invalid: true };
  }
  return { value, invalid: false };
}
