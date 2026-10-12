import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StockOrderbook } from './stock-orderbook';
import { StockInteractiveChart } from './stock-interactive-chart';

describe('StockOrderbook & Interactive Chart Suite', () => {
  it('renders orderbook with ask/bid levels, intensity badge, and recent trades stream', () => {
    render(
      <StockOrderbook
        stockId="WDG"
        symbol="WDG"
        currentPrice="15,000"
        isEn={false}
      />
    );

    // 체결강도 배지 렌더링 검증
    expect(screen.getByText(/체결강도/i)).toBeDefined();
    // 호가창 단계 타이틀 검증 (5단계 실시간 호가)
    expect(screen.getByText(/5단계 실시간 호가/i)).toBeDefined();
    // 5D, 10D 깊이 토글 버튼 검증
    expect(screen.getByText('5D')).toBeDefined();
    expect(screen.getByText('10D')).toBeDefined();
    // 최근 체결 틱 스트림 헤더 검증
    expect(screen.getByText(/최근 체결 틱/i)).toBeDefined();
    // 매도/매수 압력 비율 표시 검증
    expect(screen.getByText(/매도 \d+%/i)).toBeDefined();
    expect(screen.getByText(/매수 \d+%/i)).toBeDefined();
  });

  it('renders interactive chart and supports toggling between candlestick and line chart modes', () => {
    render(
      <StockInteractiveChart
        currentPrice="15,000"
        dayOpenPrice="14,800"
        dayHighPrice="15,200"
        dayLowPrice="14,700"
        symbol="WDG"
        isEn={false}
      />
    );

    // 차트 헤더 및 타임프레임 버튼 검증
    expect(screen.getByText('1D')).toBeDefined();
    expect(screen.getByText('1W')).toBeDefined();
    expect(screen.getByText('1M')).toBeDefined();
    expect(screen.getByText('1Y')).toBeDefined();

    // 캔들스틱 / 라인 토글 버튼 검증 (title 및 라벨)
    const candleBtn = screen.getByTitle('캔들스틱 봉차트');
    const lineBtn = screen.getByTitle('라인 에어리어 차트');
    expect(candleBtn).toBeDefined();
    expect(lineBtn).toBeDefined();

    // 이동평균선(MA5 / MA20) 인디케이터 검증 (상단 OHLC 바 및 범례)
    expect(screen.getAllByText('MA5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MA20').length).toBeGreaterThan(0);

    // 라인 차트 모드로 전환 클릭
    fireEvent.click(lineBtn);
    expect(lineBtn.className).toContain('bg-primary');

    // 다시 캔들 차트 모드로 전환 클릭
    fireEvent.click(candleBtn);
    expect(candleBtn.className).toContain('bg-primary');
  });
});
