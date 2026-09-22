import { cleanup, render, fireEvent } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { NewspaperView } from './newspaper-view';
import type { MarketEvent, StockTickerItem } from './newspaper-view';

afterEach(cleanup);

const MOCK_EVENTS: readonly MarketEvent[] = [
  {
    id: 'evt-1',
    stock_id: 'stock-fnak',
    symbol: 'FNAK',
    name: '프낙반도체',
    direction: 'up',
    strength: 3,
    headline: '프낙반도체 차세대 고대역폭 메모리 공급 계약 체결',
    body: '대규모 수출 계약으로 향후 실적 개선 기대감이 시장 전반에 확산되고 있습니다.',
    source: '월덕경제일보',
    starts_at: '2026-09-22T00:00:00.000Z',
    ends_at: '2026-09-22T23:59:59.000Z',
  },
  {
    id: 'evt-2',
    stock_id: 'stock-wdb',
    symbol: 'WDB',
    name: '월덕바이오',
    direction: 'down',
    strength: 1,
    headline: '월덕바이오 신약 임상 일정 일시적 조정 발표',
    body: '임상 데이터 보완 요청으로 일부 품목 허가 일정이 순연되었습니다.',
    source: '머니버스통신',
    starts_at: '2026-09-22T00:00:00.000Z',
    ends_at: '2026-09-22T18:00:00.000Z',
  },
];

const MOCK_STOCKS: readonly StockTickerItem[] = [
  {
    id: 'stock-fnak',
    symbol: 'FNAK',
    name: '프낙반도체',
    current_price: '54200',
    day_open_price: '50000',
  },
];

describe('NewspaperView', () => {
  it('renders masthead, title, and game-only disclaimer', () => {
    const { container } = render(<NewspaperView events={MOCK_EVENTS} stocks={MOCK_STOCKS} />);
    const text = container.textContent ?? '';

    expect(text).toContain('월덕 주간 경제 브리프 & 월드 펄스');
    expect(text).toContain('WOLDEOK MONEYVERSE');
    expect(text).toContain('본 지면의 모든 기사, 시세, 사건 및 시나리오는 게임 내 가상 통화');
  });

  it('renders active market events in headline and stream', () => {
    const { container } = render(<NewspaperView events={MOCK_EVENTS} stocks={MOCK_STOCKS} />);
    const text = container.textContent ?? '';

    expect(text).toContain('프낙반도체 차세대 고대역폭 메모리 공급 계약 체결');
    expect(text).toContain('월덕바이오 신약 임상 일정 일시적 조정 발표');
    expect(text).toContain('진행 중인 사건: 2건');
  });

  it('computes sentiment percentages accurately', () => {
    const { container } = render(<NewspaperView events={MOCK_EVENTS} stocks={MOCK_STOCKS} />);
    const text = container.textContent ?? '';

    expect(text).toContain('호재 50%');
    expect(text).toContain('악재 50%');
  });

  it('handles user poll interaction and shows percentage tally', () => {
    const { container } = render(<NewspaperView events={MOCK_EVENTS} stocks={MOCK_STOCKS} />);
    const pollButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('강력 상승') || b.textContent?.includes('Bullish')
    );
    expect(pollButtons.length).toBeGreaterThan(0);

    // Click first poll option button
    if (pollButtons[0]) {
      fireEvent.click(pollButtons[0]);
    }

    const text = container.textContent ?? '';
    expect(text).toContain('투표에 참여해 주셔서 감사합니다');
  });

  it('renders clean fallback state when no events exist', () => {
    const { container } = render(<NewspaperView events={[]} stocks={[]} />);
    const text = container.textContent ?? '';

    expect(text).toContain('진행 중인 사건: 0건');
    expect(text).toContain('가상 경제 원장과 시장 수급이 균형을 유지하고 있습니다');
  });
});
