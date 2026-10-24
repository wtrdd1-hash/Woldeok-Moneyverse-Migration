import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { NewspaperView } from './newspaper-view';
import type { MarketEvent, StockTickerItem } from './newspaper-view';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko', setLocale: () => {} }),
}));

afterEach(cleanup);

const MOCK_EVENTS: readonly MarketEvent[] = [
  {
    id: 'evt-1',
    stock_id: 'stock-wdt',
    symbol: 'WDT',
    name: '월덱테크',
    direction: 'up',
    strength: 3,
    headline: '월덱테크 차세대 AI 가속 클라우드 서비스 계약 체결',
    body: '대규모 엔터프라이즈 공급 계약으로 향후 실적 개선 기대감이 시장 전반에 확산되고 있습니다.',
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
    id: 'stock-wdt',
    symbol: 'WDT',
    name: '월덱테크',
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

    expect(text).toContain('월덱테크 차세대 AI 가속 클라우드 서비스 계약 체결');
    expect(text).toContain('월덕바이오 신약 임상 일정 일시적 조정 발표');
    expect(text).toContain('진행 중인 사건: 2건');
  });

  it('computes sentiment percentages accurately', () => {
    const { container } = render(<NewspaperView events={MOCK_EVENTS} stocks={MOCK_STOCKS} />);
    const text = container.textContent ?? '';

    expect(text).toContain('호재 50%');
    expect(text).toContain('악재 50%');
  });

  it('shows measured active event counts instead of fabricated reader votes', () => {
    const { container } = render(<NewspaperView events={MOCK_EVENTS} stocks={MOCK_STOCKS} />);
    const text = container.textContent ?? '';

    expect(text).toContain('검증된 활성 시장 사건');
    expect(text).toContain('호재 사건 1건');
    expect(text).toContain('악재 사건 1건');
    expect(text).not.toContain('총 참여자 316명');
    expect(text).not.toContain('투표에 참여해 주셔서 감사합니다');
    expect(Array.from(container.querySelectorAll('button')).some((button) => button.textContent?.includes('강력 상승'))).toBe(false);
    const bars = Array.from(container.querySelectorAll('progress'));
    expect(bars).toHaveLength(2);
    expect(bars.map((bar) => [bar.value, bar.max])).toEqual([[1, 2], [1, 2]]);
    expect(bars.every((bar) => Boolean(bar.getAttribute('aria-label')))).toBe(true);
    const exchangeLink = container.querySelector('a[href="/stocks"].min-h-11');
    expect(exchangeLink?.className).toContain('focus-visible:outline-2');
  });

  it('does not depict static momentum as a real market history', () => {
    const { container } = render(<NewspaperView events={MOCK_EVENTS} stocks={MOCK_STOCKS} />);
    const text = container.textContent ?? '';

    expect(text).toContain('서버 조회 시세');
    const source = readFileSync('src/app/newspaper/newspaper-view.tsx', 'utf8');
    expect(source).not.toContain('<polyline');
    expect(text).not.toContain('호가 변동 모멘텀');
    expect(text).not.toContain('실시간 호가');
    expect(container.querySelector('polyline[points="0,20 20,16 40,18 60,10 80,12 100,4"]')).toBeNull();
  });

  it('distinguishes an unavailable event API from an empty active event list', () => {
    const { container } = render(<NewspaperView events={[]} stocks={[]} eventsUnavailable />);
    const text = container.textContent ?? '';

    expect(text).toContain('시장 사건 정보를 불러오지 못했습니다');
    expect(text).not.toContain('원장과 시장 수급이 균형을 유지');
    expect(text).not.toContain('총 참여자');
    expect(text).not.toContain('호재 50%');
  });

  it('renders clean fallback state when no events exist', () => {
    const { container } = render(<NewspaperView events={[]} stocks={[]} />);
    const text = container.textContent ?? '';

    expect(text).toContain('진행 중인 사건: 0건');
    expect(text).toContain('현재 활성 시장 사건이 없습니다');
    expect(text).not.toContain('원장과 시장 수급이 균형을 유지');
    expect(text).not.toContain('총 참여자');
    expect(text).not.toContain('호재 50%');
  });
});
