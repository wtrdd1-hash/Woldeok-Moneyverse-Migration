import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FinancialKnowledgeHub } from './financial-knowledge-hub';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('financial education practice integrity', () => {
  it('does not portray virtual WLD as convertible fiat or publish stale FX as live', () => {
    render(<FinancialKnowledgeHub />);
    expect(screen.queryByText(/실시간 환율 변환기/)).toBeNull();
    expect(screen.queryByText(/기준 환율: \$1/)).toBeNull();
    expect(screen.getAllByText(/WLD는 실제 통화로 환전할 수 없습니다/).length).toBeGreaterThan(0);
  });

  it('shows a practice-only result without minting grants or claiming a stock fill', () => {
    const storage = vi.spyOn(Storage.prototype, 'setItem');
    render(<FinancialKnowledgeHub />);
    fireEvent.click(screen.getByRole('button', { name: /모의 매수 연습 시작/ }));
    expect(screen.getByText(/연습용 가상 종목/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /연습 주문 완료하기/ }));
    expect(screen.getByRole('status').textContent).toMatch(/연습 완료/);
    expect(screen.getByRole('status').textContent).toMatch(/실제 WLD.*지급되지/);
    expect(screen.queryByText(/보상 자동 청구 완료/)).toBeNull();
    expect(screen.getByRole('link', { name: /실제 가상 주식 목록 보기/ }).getAttribute('href')).toBe('/stocks');
    expect(storage).not.toHaveBeenCalled();
    storage.mockRestore();
  });
});
