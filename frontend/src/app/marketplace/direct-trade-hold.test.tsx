import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DirectTradeView } from './direct-trade-view';

describe('member P2P direct trade fail-closed UI', () => {
  it('shows a truthful unavailable state and no invented offers or executable swap controls', () => {
    render(<DirectTradeView holdings={[]} userBalanceWld="0" />);
    expect(screen.getByRole('status').textContent).toContain('직거래 기능은 현재 중단');
    expect(screen.queryByText(/월덕헤지펀드/)).toBeNull();
    expect(screen.queryByRole('button', { name: /최종 교환 승인|1차 수락|새 직거래 제안/ })).toBeNull();
  });
});
