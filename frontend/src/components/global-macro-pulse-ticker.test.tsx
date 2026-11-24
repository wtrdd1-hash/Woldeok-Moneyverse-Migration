import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));

const { GlobalMacroPulseTicker } = await import('./global-macro-pulse-ticker');

describe('GlobalMacroPulseTicker', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows no figures when the API has no verified indicator lists', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true, baseInterestRatePct: 3.25 }), { status: 200 })));
    render(<GlobalMacroPulseTicker />);
    await waitFor(() => expect(screen.getByText(/검증된 거시경제 지표를 지금 불러올 수 없어/)).toBeDefined());
    expect(screen.queryByText(/2,628|KOSPI/)).toBeNull();
  });

  it('says it is unavailable when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    render(<GlobalMacroPulseTicker />);
    await waitFor(() => expect(screen.getByText(/불러올 수 없어 표시하지 않습니다/)).toBeDefined());
  });
});
