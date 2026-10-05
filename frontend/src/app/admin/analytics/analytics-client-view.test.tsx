import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { AnalyticsClientView } from './analytics-client-view';
import type { AdminUser, AdminStock, ReconciliationHealth, FeatureSwitch } from '../types';

describe('AnalyticsClientView', () => {
  const mockUsers: AdminUser[] = [
    {
      user_id: 'user-1',
      display_name: 'VIP Trader',
      status: 'active',
      restricted_at: null,
      restriction_reason: null,
      cash_balance: '15000000',
      bank_balance: '85000000',
      bond_balance: '20000000',
      stock_eval: '50000000',
      total_net_worth: '170000000',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      last_login_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      last_seen_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      user_id: 'user-2',
      display_name: 'Regular Member',
      status: 'active',
      restricted_at: null,
      restriction_reason: null,
      cash_balance: '2000000',
      bank_balance: '8000000',
      bond_balance: '0',
      stock_eval: '5000000',
      total_net_worth: '15000000',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      last_login_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      last_seen_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
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
      m2Amount: '185000000',
      netMintIssuanceAmount: '185000000',
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

  it('renders all four chart cards properly', () => {
    render(
      <AnalyticsClientView
        users={mockUsers}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    expect(screen.getByText(/실시간 텔레메트리 & 그래프 분석실/)).toBeDefined();
    expect(screen.getByText(/유저 활성도 & 코호트 텔레메트리 그래프/)).toBeDefined();
    expect(screen.getByText(/M0\/M1\/M2 가상 통화량 유동성 구성 비율/)).toBeDefined();
    expect(screen.getByText(/5분위 자산 계층 분배율 & 양극화 곡선/)).toBeDefined();
    expect(screen.getByText(/상위 상장 종목 시가총액 & 체결 랭킹/)).toBeDefined();
  });

  it('triggers CSV download without error when clicking export button', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    render(
      <AnalyticsClientView
        users={mockUsers}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    const exportBtn = screen.getByRole('button', { name: /CSV 리포트 내보내기/ });
    fireEvent.click(exportBtn);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    createElementSpy.mockRestore();
  });
});
