import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('@/components/use-mounted-viewer', () => ({ useMountedViewer: () => ({ signedIn: false, consentCurrent: false, adminRoles: [] }) }));

const { LedgerStrip } = await import('./ledger-strip');

function respond(map: Record<string, unknown>) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const body = map[url];
    return body === undefined ? new Response('{}', { status: 503 }) : new Response(JSON.stringify(body), { status: 200 });
  }));
}

describe('LedgerStrip', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('derives breadth and clock from live responses', async () => {
    respond({
      '/app-api/v1/game-clock': { dayIndex: 10181, weekIndex: 1454, dayOfWeek: 4 },
      '/app-api/v1/stocks': { stocks: [
        { current_price: '110', day_open_price: '100' },
        { current_price: '90', day_open_price: '100' },
        { current_price: '95', day_open_price: '100' },
      ] },
      '/app-api/v1/economy/macro-pulse': { baseInterestRatePct: 3.25 },
    });
    render(<LedgerStrip />);
    await waitFor(() => expect(screen.getByText('D+10182, 1455주 4일')).toBeDefined());
    expect(screen.getByText('1종목')).toBeDefined();
    expect(screen.getByText('2종목')).toBeDefined();
    expect(screen.getByText('3.25%')).toBeDefined();
    expect(screen.getByText('로그인 필요')).toBeDefined();
  });

  it('says unavailable instead of inventing values when sources fail', async () => {
    respond({});
    render(<LedgerStrip />);
    await waitFor(() => expect(screen.getAllByText('확인 불가').length).toBeGreaterThanOrEqual(4));
  });
});
