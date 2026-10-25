import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorkEarningsView } from './work-earnings-view';

const sample = {
  receipt_id: 'a', assignment_id: 'b', code: 'task', name: 'Real task',
  reward_amount: '9007199254740993', experience_amount: '30',
  transaction_id: 'tx-1', created_at: '2026-10-25T00:00:00.000Z',
  settlement_status: 'VERIFIED' as const,
};

describe('verified work earnings presentation', () => {
  it('shows exact verified WLD and distinguishes unverified and EXP-only records', () => {
    const html = renderToStaticMarkup(<WorkEarningsView isEn={false} earnings={{
      window: 'RECENT_20', limit: 20, verified_wld: '9007199254740993', verified_count: 1,
      exp_only_count: 1, unverified_count: 1,
      receipts: [sample, { ...sample, receipt_id: 'c', reward_amount: '0', transaction_id: null, settlement_status: 'EXP_ONLY' },
        { ...sample, receipt_id: 'd', reward_amount: '10', transaction_id: null, settlement_status: 'UNVERIFIED' }],
    }} />);
    expect(html).toContain('9,007,199,254,740,993');
    expect(html).toContain('원장 확인');
    expect(html).toContain('EXP 전용');
    expect(html).toContain('미확인');
    expect(html).toContain('최근 최대 20건');
    expect(html).not.toContain('10 WLD 지급 완료');
  });

  it('does not render zero earnings when the API is unavailable', () => {
    const html = renderToStaticMarkup(<WorkEarningsView isEn={false} earnings={null} />);
    expect(html).toContain('불러올 수 없습니다');
    expect(html).not.toContain('확인된 보상: 0 WLD');
  });
});
