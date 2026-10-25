import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StockInteractiveChart } from './stock-interactive-chart';

const stockId = '11111111-1111-4111-8111-111111111111';
const candle = (at: string, open: string, high: string, low: string, close: string) => ({
  bucket_at: at, open_price: open, high_price: high, low_price: low, close_price: close,
});
const verified = [
  candle('2026-10-24T09:00:00Z', '15000', '15100', '14900', '15050'),
  candle('2026-10-24T09:30:00Z', '15050', '15200', '15000', '15150'),
];
const props = { stockId, symbol: 'WDG', currentPrice: '15150', dayOpenPrice: '15000' };
const response = (candles: unknown) => ({ ok: true, json: async () => ({ candles }) });

describe('stock chart verified candle provenance', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not invent candles when there is no server stock id', () => {
    render(<StockInteractiveChart symbol="WDG" currentPrice="15150" />);
    expect(screen.getByRole('status').textContent).toMatch(/종목 ID/);
    expect(screen.queryAllByTestId('verified-candle')).toHaveLength(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses a backend-supported 30-minute interval for 1D and displays only verified OHLC without synthetic volume', async () => {
    vi.mocked(fetch).mockResolvedValue(response(verified) as Response);
    render(<StockInteractiveChart {...props} />);
    await waitFor(() => expect(screen.getAllByTestId('verified-candle')).toHaveLength(2));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('interval=1800'), { cache: 'no-store' });
    expect(screen.getAllByText('15,150').length).toBeGreaterThan(0);
    expect(screen.queryByText('Vol')).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/서버/);
  });

  it('labels a selected historical close as a candle close, not a live quote', async () => {
    vi.mocked(fetch).mockResolvedValue(response(verified) as Response);
    render(<StockInteractiveChart {...props} currentPrice="15999" />);
    await waitFor(() => expect(screen.getAllByTestId('verified-candle')).toHaveLength(2));
    expect(screen.getByText('기록된 종가')).toBeDefined();
  });

  it('does not invent a 1,000 WLD current quote from an empty price', () => {
    render(<StockInteractiveChart symbol="WDG" currentPrice="" />);
    expect(screen.queryByText('1,000')).toBeNull();
    expect(screen.getByText('현재가 미확인')).toBeDefined();
  });

  it('shows an empty state rather than synthetic OHLC when no trades were recorded', async () => {
    vi.mocked(fetch).mockResolvedValue(response([]) as Response);
    render(<StockInteractiveChart {...props} />);
    expect(await screen.findByText(/확인된 캔들 기록이 없습니다/)).toBeDefined();
    expect(screen.queryAllByTestId('verified-candle')).toHaveLength(0);
  });

  it('shows a retryable failure state rather than a simulated chart on HTTP failure', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);
    render(<StockInteractiveChart {...props} />);
    expect(await screen.findByText(/차트 기록을 불러오지 못했습니다/)).toBeDefined();
    expect(screen.queryAllByTestId('verified-candle')).toHaveLength(0);
  });

  it('lets keyboard users retry the same timeframe after a transient API failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce(response(verified) as Response);
    render(<StockInteractiveChart {...props} />);
    expect(await screen.findByText(/차트 기록을 불러오지 못했습니다/)).toBeDefined();
    const retry = screen.getByRole('button', { name: '차트 다시 시도' });
    expect(retry.className).toContain('min-h-11');
    fireEvent.click(retry);
    await waitFor(() => expect(screen.getAllByTestId('verified-candle')).toHaveLength(2));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects inconsistent OHLC values instead of substituting the current quote', async () => {
    vi.mocked(fetch).mockResolvedValue(response([
      candle('2026-10-24T09:00:00Z', '15000', '14900', '14800', '15150'),
    ]) as Response);
    render(<StockInteractiveChart {...props} />);
    expect(await screen.findByText(/차트 기록을 불러오지 못했습니다/)).toBeDefined();
    expect(screen.queryAllByTestId('verified-candle')).toHaveLength(0);
  });

  it('does not keep prior timeframe candles visible while a new request is pending', async () => {
    let resolveSecond!: (value: Response) => void;
    const second = new Promise<Response>((resolve) => { resolveSecond = resolve; });
    vi.mocked(fetch).mockResolvedValueOnce(response(verified) as Response).mockReturnValueOnce(second);
    render(<StockInteractiveChart {...props} />);
    await waitFor(() => expect(screen.getAllByTestId('verified-candle')).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: '1W' }));
    expect(screen.getByRole('status').textContent).toMatch(/불러오는 중/);
    expect(screen.queryAllByTestId('verified-candle')).toHaveLength(0);
    resolveSecond(response([verified[0]]) as Response);
    await waitFor(() => expect(screen.getAllByTestId('verified-candle')).toHaveLength(1));
  });
});
