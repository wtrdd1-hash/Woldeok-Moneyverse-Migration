import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FinancialKnowledgeHub } from './financial-knowledge-hub';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko' }),
}));

afterEach(() => cleanup());

describe('FinancialKnowledgeHub verified education boundary', () => {
  it('uses clearly illustrative fiat-only currency examples, never WLD cash redemption or live FX claims', () => {
    render(<FinancialKnowledgeHub />);
    expect(screen.getByLabelText('예시 금액 (KRW)')).toBeDefined();
    expect(screen.getByText(/실제 환율이 아니며/)).toBeDefined();
    expect(screen.queryByText(/글로벌 실시간 환율/)).toBeNull();
    expect(screen.queryByText(/1,382\.4원/)).toBeNull();
    expect(screen.queryByText(/가상 자산 입력 \(WLD\)/)).toBeNull();
  });

  it('recalculates illustrative fiat values without touching any WLD balance', () => {
    render(<FinancialKnowledgeHub />);
    fireEvent.change(screen.getByLabelText('예시 금액 (KRW)'), { target: { value: '13824' } });
    expect(screen.getByText('$10')).toBeDefined();
    expect(screen.getByText('₩13,824')).toBeDefined();
  });

  it('never issues a local phantom WLD reward or fake fill, and links to server-backed stock flows', () => {
    const saveSpy = vi.spyOn(Storage.prototype, 'setItem');
    render(<FinancialKnowledgeHub />);
    fireEvent.click(screen.getByRole('button', { name: /가상 시장 알아보기/ }));
    expect(screen.getByRole('link', { name: /서버 시세로 종목 비교/ }).getAttribute('href')).toBe('/stocks/compare');
    expect(screen.getByRole('link', { name: /실제 가상 거래소/ }).getAttribute('href')).toBe('/stocks');
    expect(screen.getByText(/WLD 보상이나 주식 체결은 발생하지 않습니다/)).toBeDefined();
    expect(screen.queryByText(/무료 지원금 제공|체결 완료|온보딩 퀘스트 보상/)).toBeNull();
    expect(saveSpy).not.toHaveBeenCalled();
    saveSpy.mockRestore();
  });

  it('provides keyboard-sized controls and makes optional navigation explicit', () => {
    render(<FinancialKnowledgeHub />);
    expect(screen.getByRole('button', { name: '한국어 (KR)' }).className).toContain('min-h-11');
    expect(screen.getByRole('button', { name: 'English (Global)' }).className).toContain('min-h-11');
    expect(screen.getByRole('button', { name: /가상 시장 알아보기/ }).className).toContain('min-h-11');
  });
});
