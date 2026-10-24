import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('pension control tower financial hold', () => {
  it('shows an explicitly disabled payout action and does not invoke the unverified gateway', () => {
    const source = readFileSync(fileURLToPath(new URL('./pension-control-tower.tsx', import.meta.url)), 'utf8');
    expect(source).toMatch(/disabled\s+aria-describedby="pension-payout-hold"/);
    expect(source).toContain('id="pension-payout-hold"');
    expect(source).not.toContain("fetch('/api/admin/pension/distribute'");
    expect(source).not.toContain('handleDistributePayouts');
  });
});
