import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { WatchlistPromotionEngine } from './watchlist-promotion-engine';

vi.mock('@/lib/use-viewer', () => ({ useViewer: () => ({ signedIn: true, consentCurrent: true, adminRoles: [] }) }));
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('wdmv_saved_scenarios', JSON.stringify([{ ticker: 'CHIPS', stockName: 'CHIPS', targetPrice: '100 WLD', reboundRate: '+5%', savedAt: 1 }])); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('WatchlistPromotionEngine', () => {
  it('offers manual server-backed watchlist navigation without pretending to synchronize local scenarios', () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    render(<WatchlistPromotionEngine />);
    expect(screen.getByRole('link', { name: /거래소에서 직접 추가/ }).getAttribute('href')).toBe('/stocks');
    expect(screen.getByText(/이 브라우저에만 보관/)).toBeDefined();
    expect(screen.queryByText(/승격 저장되었습니다|안전하게 동기화됩니다/)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('wdmv_scenarios_promoted')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /안내 닫기/ }));
    expect(screen.queryByRole('link', { name: /거래소에서 직접 추가/ })).toBeNull();
  });
});
