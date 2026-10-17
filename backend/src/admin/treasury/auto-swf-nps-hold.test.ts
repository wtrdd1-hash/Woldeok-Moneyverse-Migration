import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

describe('SWF must not generate unjournaled pension payouts', () => {
  it('does not run the historical direct NPS wallet update and payout log SQL inside SWF', () => {
    const source = readFileSync(fileURLToPath(new URL('./auto-swf.service.ts', import.meta.url)), 'utf8');
    expect(source).not.toMatch(/UPDATE public\.national_pension_accounts SET total_payout_received_wld/);
    expect(source).not.toMatch(/INSERT INTO public\.national_pension_payout_logs/);
  });
});
