import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));
vi.mock('@/app/actions/daily-quest', () => ({
  claimDailyQuestAction: vi.fn(),
  fetchDailyQuestStatusAction: vi.fn(),
}));
import { DailyEconomicQuestStation } from './daily-economic-quest-station';

describe('daily economic quest truthful practice mode', () => {
  it('does not advertise an uncertified WLD payout or enable a claim button', () => {
    const markup = renderToStaticMarkup(<DailyEconomicQuestStation />);
    expect(markup).toContain('정산 중단');
    expect(markup).not.toContain('보상 받기');
    expect(markup).not.toContain('3일 연속 스트릭');
    expect(markup).not.toContain('최대 5,000 WLD 지원금');
    expect(markup).not.toContain('+500 WLD');
    expect(markup).toContain('href="/stocks"');
  });
});
