import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('portfolio source-of-truth UI', () => {
  const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

  it('does not present a manufactured weekly receipt as ledger evidence', () => {
    expect(page).not.toContain('WeeklyFinancialReceipt');
    expect(page).not.toContain('feeBurnContributionWld:');
    expect(page).not.toContain('weekNumber: 41');
  });

  it('distinguishes a verified empty response from an unavailable source', () => {
    expect(page).toContain('parsePortfolioResponse');
    expect(page).not.toContain('response.holdings ?? []');
    expect(page).toContain('<HaltReceiptsCard receipts={haltReceipts} isEn={isEn} />');
  });

  it('provides a keyboard-accessible retry path and avoids claiming realtime valuations', () => {
    expect(page).toContain('href="/stocks/portfolio"');
    expect(page).not.toContain('실시간 미실현 손익');
    expect(page).not.toContain('실시간 평가 합계');
    expect(page).toContain("holding.halt_status === 'ACTIVE'");
  });
});
