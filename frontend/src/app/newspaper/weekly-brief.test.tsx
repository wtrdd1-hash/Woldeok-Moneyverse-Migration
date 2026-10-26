import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { WeeklyWorldBrief } from './weekly-world-brief';
import { parseWeeklyBriefResponse } from './weekly-brief-contract';

afterEach(cleanup);

describe('Verified weekly brief source and presentation', () => {
  const data = {
    balanceSnapshotWld: '12345678901234567890',
    source: 'user_cash_and_bank_balances' as const,
    asOf: '2026-10-26T02:45:00.000Z',
  };

  it('unwraps the actual NestJS envelope and rejects invalid or fictional payloads', () => {
    expect(parseWeeklyBriefResponse({ success: true, data })).toEqual(data);
    expect(parseWeeklyBriefResponse({ success: true, data: { m0Supply: 12450000 } })).toBeUndefined();
    expect(parseWeeklyBriefResponse({ success: true, data: { ...data, balanceSnapshotWld: '-1' } })).toBeUndefined();
    expect(parseWeeklyBriefResponse({ success: true, data: { ...data, asOf: 'not-a-date' } })).toBeUndefined();
    expect(parseWeeklyBriefResponse({ success: false, data })).toBeUndefined();
    expect(parseWeeklyBriefResponse(null)).toBeUndefined();
  });

  it('shows actual large WLD balances without float precision loss and with source and snapshot time', () => {
    render(<WeeklyWorldBrief data={data} />);
    expect(screen.getByText('12,345,678,901,234,567,890 WLD')).toBeDefined();
    expect(screen.getByText(/회원 현금·예금 잔액 합계/)).toBeDefined();
    expect(screen.getByText(/집계 시각/)).toBeDefined();
    expect(screen.getByText(/M0 통화량이 아닌/)).toBeDefined();
    expect(screen.queryByText(/CHIPS|월덕파운더|인플레이션 1.4/)).toBeNull();
  });

  it('fails closed with an accessible unavailable state instead of the fictional September report', () => {
    render(<WeeklyWorldBrief />);
    expect(screen.getByRole('status').textContent).toContain('주간 경제 브리프를 확인할 수 없습니다.');
    expect(screen.queryByText('12,450,000 WLD')).toBeNull();
    expect(screen.queryByText('CHIPS')).toBeNull();
  });
});
