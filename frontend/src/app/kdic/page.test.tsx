import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import KdicPortalPage from './page';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('virtual KDIC portal safety', () => {
  it('discloses that WLD is not legally insured and never invents balances when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { container } = render(<KdicPortalPage />);

    await waitFor(() => {
      expect(container.textContent).toContain('현재 기금 데이터를 조회할 수 없습니다');
    });

    expect(container.textContent).toContain('WLD는 실제 예금보험공사의 법적 보호 대상이 아닙니다');
    expect(container.textContent).not.toContain('10,000,000 WLD');
    expect(container.textContent).not.toContain('2개사 완벽 보증');

    fireEvent.click(screen.getByRole('button', { name: /가상 금융기관 현황/ }));
    expect(container.textContent).toContain('조회된 가상 금융기관 정보가 없습니다');
    expect(container.textContent).not.toContain('월덕상업은행 (Commercial Bank)');
  });
});
