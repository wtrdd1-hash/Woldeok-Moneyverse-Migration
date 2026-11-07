import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NewspaperView } from './newspaper-view';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko', setLocale: () => {} }),
}));
afterEach(cleanup);

describe('newspaper truthful source UI', () => {
  it('reports unavailable market evidence instead of neutral/stable market or fabricated vote counts', () => {
    const { container } = render(<NewspaperView events={[]} stocks={[]} eventsAvailable={false} stocksAvailable={false} />);
    const text = container.textContent ?? '';
    expect(text).toContain('시장 사건 자료를 확인할 수 없습니다');
    expect(text).toContain('종목 시세를 확인할 수 없습니다');
    expect(text).not.toContain('시장 수급이 균형을 유지');
    expect(text).not.toContain('호재 50%');
    expect(text).not.toContain('총 참여자 316명');
    expect(container.querySelector('a[href="/newspaper"]')).not.toBeNull();
  });

  it('reports verified empty events without claiming trading is healthy', () => {
    const { container } = render(<NewspaperView events={[]} stocks={[]} />);
    const text = container.textContent ?? '';
    expect(text).toContain('확인된 진행 중인 시장 사건이 없습니다');
    expect(text).not.toContain('정규 원장 거래 및 자산 거래가 정상 진행');
    expect(text).not.toContain('호재 50%');
  });

  it('does not draw fabricated tick history from only two server price snapshots', () => {
    const { container } = render(<NewspaperView events={[]} stocks={[{
      id: '22222222-2222-4222-8222-222222222222',
      symbol: 'WDT', name: 'Woldeok Tech', current_price: '102', day_open_price: '100',
    }]} />);
    expect(container.textContent).toContain('마지막 서버 조회 가격');
    expect(container.querySelector('polyline')).toBeNull();
    expect(container.textContent).not.toContain('실시간 호가');
  });

  it('does not accept browser-only votes or render synthetic price history', () => {
    const { container } = render(<NewspaperView events={[]} stocks={[]} />);
    const text = container.textContent ?? '';
    expect(text).toContain('투표 결과를 검증할 수 없어');
    expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    expect(container.querySelector('button[aria-label="강력 상승 (Bullish Surge)"]')).toBeNull();
    expect(text).not.toContain('총 참여자 316명');
  });
});
