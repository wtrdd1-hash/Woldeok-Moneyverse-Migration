import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AdminNationalTreasuryControlCard } from './admin-national-treasury-control-card';

afterEach(cleanup);

describe('AdminNationalTreasuryControlCard fail-closed policy controls', () => {
  it('never presents unverified lottery or monetary mutations as completed', () => {
    const { container } = render(<AdminNationalTreasuryControlCard />);

    const drawButton = screen.getByRole('button', { name: '서버 정산 연동 전 추첨 불가' }) as HTMLButtonElement;
    const applyButton = screen.getByRole('button', { name: '운영 금리 저장·적용 불가' }) as HTMLButtonElement;
    expect(drawButton.disabled).toBe(true);
    expect(applyButton.disabled).toBe(true);
    expect(screen.getByText('POLICY-SYNC: NOT CONNECTED')).toBeDefined();
    expect(screen.getByText(/운영 복권 회차·당첨금·실제 금리·국고 원장과 연결되지 않은 예시/)).toBeDefined();
    expect(container.textContent).not.toContain('영구 소각 완료');
    expect(container.textContent).not.toContain('실시간 동기화되었습니다');
    expect(container.textContent).not.toContain('POLICY-SYNC: ACTIVE');
  });

  it('calculates the illustrative Taylor rate locally and flags out-of-range inputs', () => {
    render(<AdminNationalTreasuryControlCard />);
    expect(screen.getByTestId('taylor-illustrative-rate').textContent).toBe('연 6.20%');

    fireEvent.change(screen.getByRole('spinbutton', { name: '중립금리 r* (%)' }), {
      target: { value: '3' },
    });
    expect(screen.getByTestId('taylor-illustrative-rate').textContent).toBe('연 7.20%');

    fireEvent.change(screen.getByRole('spinbutton', { name: '물가 갭 가중치 α' }), {
      target: { value: '3' },
    });
    expect(screen.getByTestId('taylor-illustrative-rate').textContent).toBe('입력 범위 확인 필요');
  });
});
