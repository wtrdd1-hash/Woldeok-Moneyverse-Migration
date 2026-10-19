// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MinesGame } from './mines-game';
import { PlinkoGame } from './plinko-game';

describe('arcade browser-only demo honesty', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('shows prominent nonmonetary disclosure on both simulations', () => {
    render(<MinesGame />);
    expect(screen.getByRole('status').textContent).toMatch(/실제 WLD 잔액은 차감되지 않으며 상금 지급이나 거래 영수증은 생성되지 않습니다/);
    expect(screen.getByText(/Mines 지뢰찾기 보물찾기 · 모의 체험/)).toBeTruthy();
    cleanup();
    render(<PlinkoGame />);
    expect(screen.getByRole('status').textContent).toMatch(/실제 WLD 잔액은 차감되지 않으며 상금 지급이나 거래 영수증은 생성되지 않습니다/);
    expect(screen.getByText(/공정성 인증 아님/)).toBeTruthy();
    expect(screen.queryByText(/RNG 정규분포 검증 완료/)).toBeNull();
  });

  it('Mines rejects invalid amounts without replacing them with a fictional fallback', () => {
    render(<MinesGame />);
    fireEvent.change(screen.getByLabelText('모의 금액 (WLD 단위)'), { target: { value: '0' } });
    expect((screen.getByRole('button', { name: /모의 게임 시작/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('Mines last safe gem uses the current reveal count and never claims real WLD was paid', () => {
    let draw = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => (draw++ % 24) / 25);
    render(<MinesGame />);
    fireEvent.click(screen.getByRole('button', { name: '24개' }));
    fireEvent.click(screen.getByRole('button', { name: /모의 게임 시작/ }));
    fireEvent.click(screen.getByRole('button', { name: '모의 타일 25' }));
    expect(screen.getByText(/모의 정산 결과: 24\.5x/)).toBeTruthy();
    expect(screen.getByText(/122,500 WLD 상당, 실제 지급 없음/)).toBeTruthy();
  });

  it('Plinko blocks invalid money-sized inputs before the mock drop', () => {
    render(<PlinkoGame />);
    fireEvent.change(screen.getByLabelText('모의 금액 (WLD 단위)'), { target: { value: '0' } });
    expect((screen.getByRole('button', { name: /모의 공 떨어뜨리기/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});
