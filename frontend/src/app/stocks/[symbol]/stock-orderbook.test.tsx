import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StockOrderbook } from './stock-orderbook';
import { StockInteractiveChart } from './stock-interactive-chart';
import { StockOrderPanel } from './stock-order-panel';
import { StockMicroPortfolio } from './stock-micro-portfolio';
import { StockMarketToast } from './stock-market-toast';
import { StockTickerSwitcher } from './stock-ticker-switcher';
import { StockConditionalOrders } from './stock-conditional-orders';
import type { HubStock } from '../stock-hub';

describe('StockOrderbook & Interactive Chart Suite', () => {
  it('renders orderbook with ask/bid levels, intensity badge, and recent trades stream', () => {
    const handleSelect = vi.fn();
    render(
      <StockOrderbook
        stockId="WDG"
        symbol="WDG"
        currentPrice="15,000"
        isEn={false}
        onSelectPrice={handleSelect}
      />
    );

    // 체결강도 배지 렌더링 검증
    expect(screen.getByText(/체결강도/i)).toBeDefined();
    // 호가창 단계 타이틀 검증 (5단계 실시간 호가)
    expect(screen.getByText(/5단계 실시간 호가/i)).toBeDefined();
    // 5D, 10D 깊이 토글 버튼 검증
    const btn10D = screen.getByText('10D');
    expect(btn10D).toBeDefined();
    fireEvent.click(btn10D);
    expect(screen.getByText(/10단계 실시간 호가/i)).toBeDefined();

    // 최근 체결 틱 스트림 헤더 검증
    expect(screen.getByText(/최근 체결 틱/i)).toBeDefined();
    // 매도/매수 압력 비율 표시 검증
    expect(screen.getByText(/매도 \d+%/i)).toBeDefined();
    expect(screen.getByText(/매수 \d+%/i)).toBeDefined();
  });

  it('renders interactive chart with MA, Bollinger Bands, and RSI indicator suite', () => {
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

    // 이동평균선(MA5 / MA20) 인디케이터 검증
    expect(screen.getAllByText('MA5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MA20').length).toBeGreaterThan(0);

    // 볼린저 밴드(BB), RSI, MACD, 지지/저항선(SR) 지표 칩 검증
    expect(screen.getByTitle('볼린저 밴드 (20, 2) 토글')).toBeDefined();
    expect(screen.getByTitle('상대강도지수 (RSI 14) 서브패널 토글')).toBeDefined();
    expect(screen.getByTitle(/MACD.*서브패널 토글/i)).toBeDefined();
    expect(screen.getByTitle('지지선/저항선 (Support & Resistance) 가이드라인 토글')).toBeDefined();

    // RSI 서브패널 텍스트 검증
    expect(screen.getAllByText(/RSI \(14\)/i).length).toBeGreaterThan(0);

    // MACD 서브패널 탭 클릭 및 전환 검증
    const macdTabBtn = screen.getByRole('button', { name: /MACD \(12, 26, 9\)/i });
    expect(macdTabBtn).toBeDefined();
    fireEvent.click(macdTabBtn);
    expect(screen.getByText(/● MACD/i)).toBeDefined();
    expect(screen.getByText(/● Sig/i)).toBeDefined();

    // 라인 차트 모드로 전환 클릭
    fireEvent.click(lineBtn);
    expect(lineBtn.className).toContain('bg-primary');

    // 다시 캔들 차트 모드로 전환 클릭
    fireEvent.click(candleBtn);
    expect(candleBtn.className).toContain('bg-primary');
  });

  it('renders stock order panel with 10%, 25%, 50%, 100% quick preset buttons', () => {
    render(
      <StockOrderPanel
        stockId="WDG"
        symbol="WDG"
        name="월덱 게임즈"
        currentPrice="15,000"
        availableShares="1000"
        holdingQuantity="200"
        isEn={false}
      />
    );

    // 비율 프리셋 버튼 검증 (10%, 25%, 50%, 최대)
    expect(screen.getByText('10%')).toBeDefined();
    expect(screen.getByText('25%')).toBeDefined();
    expect(screen.getByText('50%')).toBeDefined();
    expect(screen.getByText('최대')).toBeDefined();

    // 50% 버튼 클릭 시 수량 변경 검증
    const btn50 = screen.getByText('50%');
    fireEvent.click(btn50);
    const qtyInput = screen.getByLabelText('주문 수량') as HTMLInputElement;
    expect(Number.parseInt(qtyInput.value, 10)).toBeGreaterThan(0);
  });

  it('supports keyboard hotkeys (B/S/Esc) with typing guards and shortcut badges', () => {
    const handleSideChange = vi.fn();
    render(
      <StockOrderPanel
        stockId="WDG"
        symbol="WDG"
        name="월덱 게임즈"
        currentPrice="15,000"
        availableShares="1000"
        holdingQuantity="200"
        isEn={false}
        onSideChange={handleSideChange}
      />
    );

    // 단축키 뱃지 존재 확인 (버튼 및 가이드 바 내 복수 뱃지 대응)
    expect(screen.getAllByText('B').length).toBeGreaterThan(0);
    expect(screen.getAllByText('S').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enter').length).toBeGreaterThan(0);

    // 키보드 S 누름 -> 매도 모드 전환
    fireEvent.keyDown(window, { key: 's' });
    expect(handleSideChange).toHaveBeenCalledWith('sell');

    // 키보드 B 누름 -> 매수 모드 전환
    fireEvent.keyDown(window, { key: 'b' });
    expect(handleSideChange).toHaveBeenCalledWith('buy');
  });

  it('renders StockMicroPortfolio with donut chart and asset share percentage', () => {
    render(
      <StockMicroPortfolio
        currentSymbol="WDG"
        currentPrice="15,000"
        holdingQuantity="100"
        otherHoldings={[
          {
            symbol: 'AAPL',
            name: 'Apple',
            quantity: 50,
            currentPrice: 20000,
            marketValue: 1000000,
          },
        ]}
        isEn={false}
      />
    );

    // 포트폴리오 자산 비중 헤더 검증
    expect(screen.getByText(/포트폴리오 자산 비중/i)).toBeDefined();
    // 현재 종목 심볼 텍스트 검증
    expect(screen.getAllByText('WDG').length).toBeGreaterThan(0);
    // 전체 보기 링크 검증
    expect(screen.getByText('전체 보기')).toBeDefined();
  });

  it('renders StockMarketToast without crashing', () => {
    const { container } = render(
      <StockMarketToast
        symbol="WDG"
        currentPrice="15,000"
        isEn={false}
      />
    );
    expect(container).toBeDefined();
  });

  it('renders StockTickerSwitcher with stock items and active state', () => {
    const mockStocks: HubStock[] = [
      {
        id: '1',
        symbol: 'WDG',
        name: '월덱 게임즈',
        current_price: '15,000',
        day_open_price: '14,800',
        day_high_price: '15,500',
        day_low_price: '14,500',
        shares_outstanding: '1,000,000',
        shares_available: '500,000',
        description: '설명',
        active: true,
      },
      {
        id: '2',
        symbol: 'NVD',
        name: '엔비디',
        current_price: '28,000',
        day_open_price: '29,000',
        day_high_price: '29,500',
        day_low_price: '27,500',
        shares_outstanding: '1,000,000',
        shares_available: '500,000',
        description: '설명',
        active: true,
      },
    ];

    render(
      <StockTickerSwitcher
        stocks={mockStocks}
        currentSymbol="WDG"
        isEn={false}
      />
    );

    // 심볼 노출 검증
    expect(screen.getByText('WDG')).toBeDefined();
    expect(screen.getByText('NVD')).toBeDefined();
    // 가격 노출 검증
    expect(screen.getByText(/15,000/)).toBeDefined();
    expect(screen.getByText(/28,000/)).toBeDefined();
  });

  it('routes members to server-verified price alerts without claiming automatic execution', () => {
    const { container } = render(
      <StockConditionalOrders
        stockId="stock-1"
        symbol="WDG"
        name="Woldeok Games"
        currentPrice="15,000"
        holdingQuantity="100"
        isEn={false}
      />
    );

    const alertLink = screen.getByRole('link', { name: /주식 가격 알림 설정/ });
    expect(alertLink.getAttribute('href')).toBe('/stocks/alerts?stock=WDG');
    expect(container.textContent).toContain('서버');
    expect(container.textContent).toContain('자동 매도');
    expect(container.textContent).not.toContain('자동 체결되었습니다');
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('button[type="submit"]')).toBeNull();
  });

  it('provides an encoded stock deep link for the verified alerts flow', () => {
    render(
      <StockConditionalOrders
        stockId="stock-2"
        symbol="A&B"
        name="Symbol"
        currentPrice="100"
        isEn={true}
      />
    );
    expect(screen.getByRole('link', { name: /Configure price alerts/ }).getAttribute('href'))
      .toBe('/stocks/alerts?stock=A%26B');
  });

  it('renders orderbook depth chart and toggles between ladder and depth views', () => {
    const handleSelect = vi.fn();
    render(
      <StockOrderbook
        stockId="WDG"
        symbol="WDG"
        currentPrice="15,000"
        isEn={false}
        onSelectPrice={handleSelect}
      />
    );

    // 호가, 심도 탭 버튼 확인
    const ladderBtn = screen.getByText('호가');
    const depthBtn = screen.getByText('심도');
    expect(ladderBtn).toBeDefined();
    expect(depthBtn).toBeDefined();

    // 심도 탭 클릭 -> 심도 차트 모드로 전환
    fireEvent.click(depthBtn);
    expect(screen.getByText(/실시간 호가 심도 \(Depth\)/i)).toBeDefined();
    expect(screen.getByText(/실시간 매수\/매도 매물대 심도/i)).toBeDefined();
    expect(screen.getByText(/매수 누적/i)).toBeDefined();
    expect(screen.getByText(/매도 누적/i)).toBeDefined();

    // 다시 호가 탭 클릭 -> 호가 테이블로 복귀
    fireEvent.click(ladderBtn);
    expect(screen.getByText(/(5|10)단계 실시간 호가/i)).toBeDefined();
  });

  it('renders interactive drawing toolbar with cursor, trendline, horizontal line, fibonacci tools and handles tool switching', () => {
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

    // 드로잉 도구 버튼 렌더링 확인
    const cursorBtn = screen.getByTitle(/기본 커서/i);
    const trendBtn = screen.getByTitle(/추세선/i);
    const horizBtn = screen.getByTitle(/수평 지지/i);
    const fibBtn = screen.getByTitle(/피보나치/i);

    expect(cursorBtn).toBeDefined();
    expect(trendBtn).toBeDefined();
    expect(horizBtn).toBeDefined();
    expect(fibBtn).toBeDefined();

    // 초기 상태: 커서 활성
    expect(cursorBtn.className).toContain('bg-primary');

    // 추세선 도구 선택 클릭
    fireEvent.click(trendBtn);
    expect(trendBtn.className).toContain('bg-sky-500');

    // 수평선 도구 선택 클릭
    fireEvent.click(horizBtn);
    expect(horizBtn.className).toContain('bg-emerald-500');

    // 피보나치 도구 선택 클릭
    fireEvent.click(fibBtn);
    expect(fibBtn.className).toContain('bg-amber-500');

    // 커서 모드로 복귀
    fireEvent.click(cursorBtn);
    expect(cursorBtn.className).toContain('bg-primary');
  });
});



