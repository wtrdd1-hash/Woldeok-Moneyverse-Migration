import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AntiInflationBurnEventCard } from './anti-inflation-burn-event-card';

describe('burn draw ledger provenance UI', () => {
  it('does not invite an unverified debit or fabricate a verified zero before source load', () => {
    const html = renderToStaticMarkup(<AntiInflationBurnEventCard />);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*(?:<[^>]*>[^<]*<\/[^>]*>)*[^<]*원장 검증 전 참여 중단/);
    expect(html).toContain('누적 소각: 미확인');
  });
});
