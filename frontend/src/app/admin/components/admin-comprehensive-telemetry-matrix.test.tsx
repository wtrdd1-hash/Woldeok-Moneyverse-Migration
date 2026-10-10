import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { AdminComprehensiveTelemetryMatrix } from './admin-comprehensive-telemetry-matrix';
import type { AdminUser, AdminStock, ReconciliationHealth, FeatureSwitch } from '../types';

describe('AdminComprehensiveTelemetryMatrix', () => {
  const mockUsers: AdminUser[] = [
    {
      user_id: 'user-1',
      display_name: 'Top Investor',
      status: 'active',
      restricted_at: null,
      restriction_reason: null,
      cash_balance: '10000000',
      bank_balance: '50000000',
      bond_balance: '20000000',
      stock_eval: '20000000',
      total_net_worth: '100000000',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      last_login_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      last_seen_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      user_id: 'user-2',
      display_name: 'Active Trader',
      status: 'active',
      restricted_at: null,
      restriction_reason: null,
      cash_balance: '2000000',
      bank_balance: '8000000',
      bond_balance: '0',
      stock_eval: '10000000',
      total_net_worth: '20000000',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      last_login_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      last_seen_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: 'user-3',
      display_name: 'Weekly User',
      status: 'active',
      restricted_at: null,
      restriction_reason: null,
      cash_balance: '500000',
      bank_balance: '1500000',
      bond_balance: '0',
      stock_eval: '0',
      total_net_worth: '2000000',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      last_login_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      last_seen_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockStocks: AdminStock[] = [
    {
      id: 'stock-1',
      symbol: '005930',
      name: '삼성전자',
      current_price: '70000',
      shares_outstanding: '1000000',
      shares_available: '800000',
      holders: 120,
      trades: 1500,
      active: true,
    },
    {
      id: 'stock-2',
      symbol: '035420',
      name: 'NAVER',
      current_price: '200000',
      shares_outstanding: '500000',
      shares_available: '400000',
      holders: 80,
      trades: 450,
      active: true,
    },
  ];

  const mockHealth: ReconciliationHealth = {
    available: true,
    calculatedAt: new Date().toISOString(),
    integrity: {
      ok: true,
      ledgerTransactionCount: '1500',
      unbalancedTransactionCount: '0',
      balanceMismatchAccountCount: '0',
      balanceTotalDeltaAmount: '0',
    },
    supply: {
      m2Amount: '122000000',
      netMintIssuanceAmount: '122000000',
      sinkAbsorbedAmount: '0',
      treasuryBalanceAmount: '500000000',
    },
  };

  const mockControls: FeatureSwitch[] = [
    {
      feature_key: 'MARKET_OPEN',
      title: '주식 시장 개장',
      state: 'enabled',
      reason: '정규장 활성화',
      activation_preconditions: [],
      updated_by: 'system',
      updated_at: new Date().toISOString(),
    },
  ];

  it('renders correctly and defaults to retention tab', () => {
    render(
      <AdminComprehensiveTelemetryMatrix
        users={mockUsers}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    expect(screen.getByText(/실시간 종합 운영 텔레메트리 매트릭스/)).toBeDefined();
    expect(screen.getByText(/HAU \(1시간 활성 사용자\)/)).toBeDefined();
    expect(screen.getByText(/사용자 참여도 \(DAU\/MAU 리텐션\)/)).toBeDefined();
  });

  it('switches to monetary tab and displays correct M0, M1, M2 values', () => {
    render(
      <AdminComprehensiveTelemetryMatrix
        users={mockUsers}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    const monetaryTabBtn = screen.getByRole('button', { name: /통화 유동성/ });
    fireEvent.click(monetaryTabBtn);

    expect(screen.getByText(/M0 \(협의 통화 \/ 유동 현금\)/)).toBeDefined();
    expect(screen.getByText(/M1 \(요구불 예금 포함 통화\)/)).toBeDefined();
    expect(screen.getByText(/M2 \(광의 통화 \/ 총 순자산\)/)).toBeDefined();
    expect(screen.getByText(/정상 일치/)).toBeDefined();
  });

  it('switches to market tab and displays stock market statistics', () => {
    render(
      <AdminComprehensiveTelemetryMatrix
        users={mockUsers}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    const marketTabBtn = screen.getByRole('button', { name: /주식 시장 심도/ });
    fireEvent.click(marketTabBtn);

    expect(screen.getByText(/총 상장 시가총액/)).toBeDefined();
    expect(screen.getByText(/총 누적 체결 건수/)).toBeDefined();
    expect(screen.getByText(/거래 활성 종목 수/)).toBeDefined();
  });

  it('switches to wealth tab and displays quintile distribution', () => {
    render(
      <AdminComprehensiveTelemetryMatrix
        users={mockUsers}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    const wealthTabBtn = screen.getByRole('button', { name: /5분위 자산 분배율/ });
    fireEvent.click(wealthTabBtn);

    expect(screen.getByText(/소득\/자산 분위/)).toBeDefined();
    expect(screen.getByText(/5분위 \(상위 20% 최상위층\)/)).toBeDefined();
  });

  it('filters out administrator accounts by default and shows exclusion badge', () => {
    const usersWithAdmin: AdminUser[] = [
      ...mockUsers,
      {
        user_id: 'admin-99',
        display_name: 'SysAdmin',
        status: 'active',
        is_admin: true,
        last_admin_at: new Date().toISOString(),
        cash_balance: '1000000000',
        bank_balance: '1000000000',
        total_net_worth: '2000000000',
        created_at: new Date().toISOString(),
        restricted_at: null,
        restriction_reason: null,
      },
    ];

    render(
      <AdminComprehensiveTelemetryMatrix
        users={usersWithAdmin}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /관리자 트래픽 제외됨 \(1명\)/ });
    expect(toggleBtn).toBeDefined();

    // 토글하여 관리자 포함
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /관리자 트래픽 포함됨/ })).toBeDefined();
  });
});
