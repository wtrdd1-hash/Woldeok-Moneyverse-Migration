// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('v1501 central-bank console source integrity', () => {
  const source = readFileSync(new URL('./central-bank-panel.tsx', import.meta.url), 'utf8');

  it('removes synthetic minted-batch claim and hardcoded supply totals', () => {
    expect(source).not.toContain('MINT-202610-002');
    expect(source).not.toContain('548,750,000 WLD');
    expect(source).not.toContain('987,750,000 WLD');
    expect(source).not.toContain('2,370,600,000 WLD');
    expect(source).toContain('/api/admin/central-bank/status');
  });

  it('does not let browser-only changes pretend to approve minted currency', () => {
    expect(source).not.toContain('setPendingAcceptance(false)');
    expect(source).not.toContain('setBaseRate(Number(rateInput)');
    expect(source).not.toContain('setReserveRatio(Number(ratioInput)');
  });
});
