/** Treasury SQL accepts decimal integer strings; never route WLD through IEEE-754 Number. */
const CANONICAL_WLD = /^[1-9][0-9]{0,29}$/;

export function isValidTreasuryAmount(value: string): boolean {
  return CANONICAL_WLD.test(value);
}

/** Add a fixed positive WLD preset to a canonical input; empty form starts at zero. */
export function addTreasuryPreset(current: string, increment: string): string | null {
  if ((current !== '' && !isValidTreasuryAmount(current)) || !isValidTreasuryAmount(increment)) {
    return null;
  }
  const sum = (BigInt(current || '0') + BigInt(increment)).toString();
  return isValidTreasuryAmount(sum) ? sum : null;
}
