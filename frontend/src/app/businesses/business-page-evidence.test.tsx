import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./business-forms', () => ({
  PurchaseButton: ({ lockedReason }: { lockedReason: string | null }) => <button disabled={lockedReason !== null}>사업권 구입</button>,
  ActivateLicenseButton: () => <button>라이선스 설립</button>,
  ApplyBoostModalButton: () => <button>부스트 적용</button>,
  SettleV2Button: () => <button>일일 정산</button>,
}));
vi.mock('./supply-chain-widget', () => ({ SupplyChainWidget: () => <div>공급망 연결</div> }));

import BusinessesPage from './page';

const id = '11111111-1111-4111-8111-111111111111';
const catalog = { id, symbol: 'CVS', name: 'Virtual shop', description: '', purchaseCost: '1000', dailyRevenue: '100', dailyOperatingCost: '30' };
const equity = { holdingsAmount: '10000', debtAmount: '0', equityAmount: '10000', minimumRatioBps: 3000 };

function provide(values: Record<string, unknown>) {
  apiMock.mockImplementation(async (path: string) => values[path] ?? null);
}
const validReads = {
  '/api/v1/business-types': { businessTypes: [catalog] },
  '/api/v1/businesses/my-v2': { businesses: [] },
  '/api/v1/progression/early-game': { unlocks: [] },
  '/api/v1/business-equity': { equity },
  '/api/v1/shop/holdings': { holdings: [] },
};

describe('business page owner-scoped read contract', () => {
  beforeEach(() => { cleanup(); apiMock.mockReset(); });

  it('does not mistake an unavailable owner read for a genuinely empty portfolio or permit purchase', async () => {
    provide({ ...validReads, '/api/v1/businesses/my-v2': null });
    render(await BusinessesPage());
    expect(screen.getByText('사업체 보유 내역을 확인할 수 없습니다.')).toBeTruthy();
    expect(screen.queryByText('확인된 사업체가 아직 없어요.')).toBeNull();
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('link', { name: '다시 조회' })).toBeTruthy();
    expect((screen.getByRole('button', { name: '사업권 구입' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText('공급망 연결')).toBeNull();
  });

  it('renders a verified empty portfolio without a false error and permits an eligible catalog action', async () => {
    provide(validReads);
    render(await BusinessesPage());
    expect(screen.getByText('확인된 사업체가 아직 없어요.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect((screen.getByRole('button', { name: '사업권 구입' }) as HTMLButtonElement).disabled).toBe(false);
    expect(apiMock).toHaveBeenCalledWith('/api/v1/shop/holdings');
  });

  it('fails closed on malformed money, missing equity or unlock evidence', async () => {
    provide({ ...validReads, '/api/v1/businesses/my-v2': { businesses: [{ ...catalog, ownershipId: id, businessTypeId: id, purchasedAt: '2026-10-31T00:00:00.000Z', lastSettlementDate: null, isSettledToday: false, boostActive: null, status: 'active', dailyRevenue: 'NaN' }] }, '/api/v1/business-equity': null });
    render(await BusinessesPage());
    expect(screen.getByText('사업체 보유 내역을 확인할 수 없습니다.')).toBeTruthy();
    expect((screen.getByRole('button', { name: '사업권 구입' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
