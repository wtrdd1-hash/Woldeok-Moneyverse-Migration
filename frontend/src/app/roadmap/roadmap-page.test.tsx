import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoadmapPage, { metadata } from './page';
import { publicApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn() }));
const market = vi.mocked(publicApi);

describe('public roadmap onboarding source truth', () => {
  beforeEach(() => market.mockReset());
  it('shows actual market evidence without a promised WLD reward', async () => {
    market.mockResolvedValue({ stocks: [{ id: '11111111-1111-4111-8111-111111111111', symbol: 'WDG', name: 'WDG', current_price: '1200', shares_available: '0' }] });
    render(await RoadmapPage());
    expect(screen.getByText(/서버 응답에서 1개 종목을 확인했습니다/)).toBeDefined();
    expect(screen.queryByText(/10만 WLD 시드/)).toBeNull();
    expect(market).toHaveBeenCalledWith('/api/v1/stocks', 0);
  });
  it('explains a backend outage without claiming zero listings', async () => {
    market.mockResolvedValue(null);
    render(await RoadmapPage());
    expect(screen.getByRole('status').textContent).toContain('시장 정보를 확인할 수 없습니다');
  });
  it('keeps SEO descriptive rather than guaranteed reward claims', () => {
    expect(String(metadata.title)).toContain('시작 가이드');
    expect(String(metadata.description)).not.toMatch(/100,000|보장|7\.2%/);
  });
});
