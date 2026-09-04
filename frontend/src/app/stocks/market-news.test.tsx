import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MarketNews, eventScope } from './market-news';
import type { MarketEvent } from './market-news';

const event = (overrides: Partial<MarketEvent> = {}): MarketEvent => ({
  id: 'e1',
  stock_id: 's1',
  symbol: 'MYUY',
  name: '뮤야얌 전자',
  direction: 'up',
  strength: 2,
  headline: '뮤야얌 전자, 신제품 발표',
  body: '시장의 기대가 높다.',
  source: 'operator',
  starts_at: '2026-09-04T08:00:00Z',
  ends_at: '2026-09-04T14:00:00Z',
  ...overrides,
});

describe('eventScope', () => {
  it('names the stock, or the whole market', () => {
    expect(eventScope(event())).toBe('MYUY 뮤야얌 전자');
    expect(eventScope(event({ symbol: null, name: null }))).toBe('시장 전체');
  });
});

describe('MarketNews', () => {
  it('draws nothing when there is no news, rather than an empty card', () => {
    const { container } = render(<MarketNews events={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('says what each item is about, which way it leans, and how hard', () => {
    const { container } = render(
      <MarketNews events={[event(), event({ id: 'e2', direction: 'down', strength: 3, symbol: null, name: null })]} />,
    );
    const text = container.textContent ?? '';
    expect(text).toContain('뮤야얌 전자, 신제품 발표');
    expect(text).toContain('▲ 호재 · 보통');
    expect(text).toContain('MYUY 뮤야얌 전자');
    expect(text).toContain('▼ 악재 · 강력');
    expect(text).toContain('시장 전체');
  });
});
