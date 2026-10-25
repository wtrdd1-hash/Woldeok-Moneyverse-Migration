import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StockSentimentPoll } from './stock-sentiment-poll';

const marketEvent = {
  sentimentScore: 64,
  sentimentLabel: 'NEUTRAL' as const,
  activeEventsCount: 1,
  leadHeadline: 'Verified market event',
  leadSummary: 'Verified market pressure, not a vote.',
  updatedAt: '2026-10-15T01:00:00.000Z',
};

const stock = { symbol: 'WDG', name: 'Woldeok Games' };

describe('Stock market event pressure integrity', () => {
  it('renders verified market-wide event pressure, not fabricated member votes', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    try {
      render(<StockSentimentPoll {...stock} pulse={marketEvent} />);
      expect(screen.getByText(/64\/100/)).toBeDefined();
      expect(screen.getByText(/Verified market event/)).toBeDefined();
      expect(screen.getByText(/전체 시장 이벤트 압력/)).toBeDefined();
      expect(screen.getByText(/1건/)).toBeDefined();
      expect(screen.getByRole('link', { name: /시장 소식/ }).getAttribute('href')).toBe('/newspaper');
      expect(screen.queryByRole('button', { name: /상승 전망|하락 전망/ })).toBeNull();
      expect(screen.queryByText(/명 참여|\d+표|자동 체결/)).toBeNull();
      expect(getItem).not.toHaveBeenCalled();
      expect(setItem).not.toHaveBeenCalled();
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });

  it('shows an unavailable state when the server cannot verify market events', () => {
    render(<StockSentimentPoll {...stock} pulse={null} />);
    expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없습니다/);
    expect(screen.queryByText(/50\/100|명 참여|\d+표/)).toBeNull();
  });

  it('does not turn an empty verified market into invented bullish votes', () => {
    render(<StockSentimentPoll {...stock} pulse={{ ...marketEvent, activeEventsCount: 0, sentimentScore: 50, sentimentLabel: 'NEUTRAL' }} />);
    expect(screen.getByRole('status').textContent).toMatch(/진행 중인 시장 이벤트가 없습니다/);
    expect(screen.queryByText(/50\/100|명 참여|\d+표/)).toBeNull();
  });

  it('fails closed on malformed server payloads and out-of-range scores', () => {
    const { rerender } = render(<StockSentimentPoll {...stock} pulse={{ ...marketEvent, sentimentScore: Number.NaN }} />);
    expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없습니다/);
    rerender(<StockSentimentPoll {...stock} pulse={{ ...marketEvent, sentimentScore: 120 }} />);
    expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없습니다/);
    rerender(<StockSentimentPoll {...stock} pulse={{ ...marketEvent, activeEventsCount: -1 }} />);
    expect(screen.getByRole('status').textContent).toMatch(/확인할 수 없습니다/);
  });
});
