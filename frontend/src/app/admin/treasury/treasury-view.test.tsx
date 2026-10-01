import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreasuryView, isTreasuryOutflow } from './treasury-view';
import type { AdminTreasuryLedger, AdminTreasuryOverview } from '../types';

describe('TreasuryView & isTreasuryOutflow Outflow Accounting Logic', () => {
  const mockOverview: AdminTreasuryOverview = {
    vaults: [
      {
        id: 'vault-1',
        code: 'VAULT_MAIN',
        name: '중앙 국고 금고',
        balance_wld: '10000000',
        description: '메인 금고',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_treasury_wld: '10000000',
    total_circulating_wld: '50000000',
    reserve_ratio_pct: 20,
    available_wld: '7000000',
    coverage_days: 30,
    stats_24h: {
      injected_wld: '0',
      absorbed_wld: '50000',
      stock_halt_funded_wld: '0',
      recirculated_wld: '0',
    },
  };

  const mockLedger: AdminTreasuryLedger[] = [
    {
      id: 'tx-dividend',
      vault_id: 'vault-1',
      vault_code: 'VAULT_MAIN',
      vault_name: '중앙 국고 금고',
      tx_type: 'CITIZEN_DIVIDEND',
      amount_wld: '30000',
      actor_id: null,
      actor_name: 'SYSTEM',
      reason: '2026년 정기 기본소득 배당 집행',
      balance_before: '9940750',
      balance_after: '9910750',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-community',
      vault_id: 'vault-1',
      vault_code: 'VAULT_MAIN',
      vault_name: '중앙 국고 금고',
      tx_type: 'COMMUNITY_FUNDING',
      amount_wld: '50000',
      actor_id: null,
      actor_name: 'SYSTEM',
      reason: '커뮤니티 지원금 펀딩 집행',
      balance_before: '9990750',
      balance_after: '9940750',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-inject',
      vault_id: 'vault-1',
      vault_code: 'VAULT_MAIN',
      vault_name: '중앙 국고 금고',
      tx_type: 'INJECTION',
      amount_wld: '1000000',
      actor_id: null,
      actor_name: '관리자',
      reason: '긴급 국고 유동성 주입',
      balance_before: '9000000',
      balance_after: '10000000',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-burn',
      vault_id: 'vault-1',
      vault_code: 'VAULT_MAIN',
      vault_name: '중앙 국고 금고',
      tx_type: 'ABSORPTION_SINK',
      amount_wld: '5000',
      actor_id: null,
      actor_name: 'SYSTEM',
      reason: '인플레이션 조절 잉여금 영구 소각',
      balance_before: '10005000',
      balance_after: '10000000',
      created_at: new Date().toISOString(),
    },
  ];

  it('isTreasuryOutflow detects balance drops and outflow types correctly', () => {
    // 1. 배당 지출 -> outflow = true
    expect(isTreasuryOutflow(mockLedger[0]!)).toBe(true);
    // 2. 커뮤니티 지원 -> outflow = true
    expect(isTreasuryOutflow(mockLedger[1]!)).toBe(true);
    // 3. 자금 주입 -> outflow = false
    expect(isTreasuryOutflow(mockLedger[2]!)).toBe(false);
    // 4. 소각 -> outflow = true
    expect(isTreasuryOutflow(mockLedger[3]!)).toBe(true);
  });

  it('renders negative sign and rose color for citizen dividend and community funding', () => {
    render(<TreasuryView overview={mockOverview} ledger={mockLedger} />);

    // 배당금 30,000 WLD가 - 로 렌더링되었는지 확인
    const dividendAmounts = screen.getAllByText(/-30,000 WLD/i);
    expect(dividendAmounts.length).toBeGreaterThan(0);

    // 커뮤니티 지원금 50,000 WLD가 - 로 렌더링되었는지 확인
    const communityAmounts = screen.getAllByText(/-50,000 WLD/i);
    expect(communityAmounts.length).toBeGreaterThan(0);

    // 자금 주입 1,000,000 WLD는 + 로 렌더링되었는지 확인
    const injectAmounts = screen.getAllByText(/\+1,000,000 WLD/i);
    expect(injectAmounts.length).toBeGreaterThan(0);
  });

  it('filters ledger entries by filter chips', () => {
    render(<TreasuryView overview={mockOverview} ledger={mockLedger} />);

    // '💸 국고 지출·배당' 필터 클릭
    const outflowChip = screen.getByRole('button', { name: /국고 지출·배당/i });
    fireEvent.click(outflowChip);

    // 배당과 커뮤니티 지원금은 보이고 주입은 필터링됨
    expect(screen.getAllByText(/-30,000 WLD/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/-50,000 WLD/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/\+1,000,000 WLD/i)).toBeNull();

    // '➕ 자금 주입' 필터 클릭
    const inflowChip = screen.getByRole('button', { name: /자금 주입/i });
    fireEvent.click(inflowChip);

    expect(screen.queryByText(/-30,000 WLD/i)).toBeNull();
    expect(screen.getAllByText(/\+1,000,000 WLD/i).length).toBeGreaterThan(0);
  });
});
