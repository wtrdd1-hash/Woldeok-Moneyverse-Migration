import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GlobalMacroPulseTicker, parseMacroPulse } from './global-macro-pulse-ticker';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));

const validPulse = {
  dataMode: 'SIMULATED_EDUCATIONAL',
  source: 'INTERNAL_DETERMINISTIC_SCENARIO',
  updatedAt: new Date().toISOString(),
  nextUpdateAt: new Date(Date.now() + 600000).toISOString(),
  domestic: [{ id: 'bok', name: '교육용 기준금리', nameEn: 'Example rate', value: 3.25, unit: '%', changeRate: 0, description: '예시', descriptionEn: 'Example', educationalTip: '설명', educationalTipEn: 'Explanation' }],
  global: [],
  exchangeRates: [],
  economicCalendar: [],
  marketSummary: { sentiment: 'NEUTRAL', summaryKo: '예시', summaryEn: 'Example', actionTipKo: '학습', actionTipEn: 'Learn' },
};

afterEach(() => { vi.restoreAllMocks(); });

describe('macro pulse fail-closed display', () => {
  it('does not accept unlabelled or malformed macro data', () => {
    expect(parseMacroPulse({ ...validPulse, dataMode: undefined })).toBeNull();
    expect(parseMacroPulse({ ...validPulse, domestic: [{ ...validPulse.domestic[0], value: 'fake' }] })).toBeNull();
    expect(parseMacroPulse({ ...validPulse, marketSummary: null })).toBeNull();
    expect(parseMacroPulse({ ...validPulse, updatedAt: new Date(Date.now() - 31 * 60_000).toISOString() })).toBeNull();
    expect(parseMacroPulse(validPulse)).not.toBeNull();
  });

  it('shows an accessible unavailable state rather than fictional fallback metrics when API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 503 } as Response);
    render(<GlobalMacroPulseTicker />);
    expect(await screen.findByRole('status')).toHaveProperty('textContent', expect.stringContaining('지표를 불러올 수 없습니다'));
    expect(screen.queryByText(/3,?25|2,?628/)).toBeNull();
    expect(screen.getByRole('button', { name: /다시 시도/ }).className).toContain('min-h-11');
  });

  it('labels server simulations explicitly and never calls them live economic data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => validPulse } as Response);
    render(<GlobalMacroPulseTicker />);
    expect(await screen.findByText('교육용 기준금리')).toBeDefined();
    expect(screen.getByText(/교육용 시뮬레이션/)).toBeDefined();
    expect(screen.queryByText(/실시간 거시경제 지표/)).toBeNull();
    expect(globalThis.fetch).toHaveBeenCalledWith('/app-api/v1/economy/macro-pulse', { cache: 'no-store' });
  });

  it('allows retry after a network failure without showing stale simulated figures', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ok: true, json: async () => validPulse } as Response);
    render(<GlobalMacroPulseTicker />);
    fireEvent.click(await screen.findByRole('button', { name: /다시 시도/ }));
    await waitFor(() => expect(screen.getByText('교육용 기준금리')).toBeDefined());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
