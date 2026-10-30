/**
 * Exact receipt amount range validation for the member search form.
 * Never coerce WLD to Number: balances can exceed Number.MAX_SAFE_INTEGER.
 */
export function receiptAmountRangeError(minimum: string, maximum: string): string | null {
  const canonical = /^[1-9][0-9]{0,29}$/;
  if (minimum && !canonical.test(minimum)) return '최소 금액은 0보다 큰 30자리 이하의 정수여야 합니다.';
  if (maximum && !canonical.test(maximum)) return '최대 금액은 0보다 큰 30자리 이하의 정수여야 합니다.';
  if (minimum && maximum && BigInt(minimum) > BigInt(maximum)) {
    return '최대 금액은 최소 금액보다 작을 수 없습니다.';
  }
  return null;
}
