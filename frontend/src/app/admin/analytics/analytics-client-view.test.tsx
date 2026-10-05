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

  it('renders all chart cards properly and supports category filtering', () => {
    render(
      <AnalyticsClientView
        users={mockUsers}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    expect(screen.getByText(/통합 텔레메트리 & 전방위 통계 관제실/)).toBeDefined();
    expect(screen.getByText(/유저 활성도 & 코호트 텔레메트리 그래프/)).toBeDefined();
    expect(screen.getByText(/M0\/M1\/M2 가상 통화량 유동성 구성 비율/)).toBeDefined();
    expect(screen.getByText(/5분위 자산 계층 분배율 & 양극화 곡선/)).toBeDefined();
    expect(screen.getByText(/상위 상장 종목 시가총액 & 체결 랭킹/)).toBeDefined();
    expect(screen.getByText(/SEO 검색엔진 크롤러 색인 관제/)).toBeDefined();
    expect(screen.getByText(/전 시스템 300\+개 엔드포인트 가동 현황 매트릭스/)).toBeDefined();
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

  it('filters out administrator accounts by default and updates on toggle', () => {
    const usersWithAdmin: AdminUser[] = [
      ...mockUsers,
      {
        user_id: 'admin-1',
        display_name: 'Super Administrator',
        status: 'active',
        is_admin: true,
        last_admin_at: new Date().toISOString(),
        cash_balance: '999999999',
        bank_balance: '999999999',
        total_net_worth: '1999999998',
        created_at: new Date().toISOString(),
        restricted_at: null,
        restriction_reason: null,
      },
    ];

    render(
      <AnalyticsClientView
        users={usersWithAdmin}
        stocks={mockStocks}
        health={mockHealth}
        controls={mockControls}
      />
    );

    // 기본적으로 관리자 제외 뱃지 및 버튼 표시 확인
    expect(screen.getByText(/관리자 트래픽 제외 적용됨 \(1명\)/)).toBeDefined();
    const toggleBtn = screen.getByRole('button', { name: /관리자 제외 \(1명\)/ });
    expect(toggleBtn).toBeDefined();

    // 토글 클릭하여 관리자 포함으로 전환
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /관리자 포함/ })).toBeDefined();
  });
});
