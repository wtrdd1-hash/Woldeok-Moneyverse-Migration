/**
 * Browser-only arcade *simulations*. Nothing in this module debits/credits WLD.
 * Actual stakes and winnings require an authenticated server ledger receipt.
 */
export function parseDemoStake(
  input: string,
  minStake: string,
  maxStake: string,
  remainingStake: string,
): number | null {
  const values = [input, minStake, maxStake, remainingStake];
  if (!values.every((value) => /^(0|[1-9][0-9]*)$/.test(value.trim()))) return null;
  const [amount, minimum, maximum, remaining] = values.map((value) => BigInt(value.trim()));
  if (amount < minimum || amount > maximum || amount > remaining) return null;
  if (amount < 1n || amount > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(amount);
}

/**
 * Simulated Mines cash-out multiplier for exactly `gemsFound` revealed gems.
 * Recomputing from the supplied count is essential for the last-gem auto-win:
 * React's previous render still has the *old* gemsFound-derived multiplier.
 */
export function demoMinesMultiplier(mineCount: number, gemsFound: number): number {
  if (!Number.isInteger(mineCount) || mineCount < 1 || mineCount > 24) return 1;
  if (!Number.isInteger(gemsFound) || gemsFound < 0 || gemsFound > 25 - mineCount) return 1;
  if (gemsFound === 0) return 1;

  let multiplier = 0.98;
  for (let revealed = 0; revealed < gemsFound; revealed += 1) {
    multiplier *= (25 - revealed) / (25 - mineCount - revealed);
  }
  return Math.max(1.01, Number(multiplier.toFixed(2)));
}
