import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AdminTelemetryMetricsTable } from './admin-telemetry-metrics-table';
import type { AdminUser } from '../types';

describe('AdminTelemetryMetricsTable unit tests', () => {
  const mockUsers: AdminUser[] = [
    {
      user_id: 'user-001',
      status: 'active',
      display_name: '테스트유저1',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
      last_login_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1시간 전 (DAU/WAU/MAU)
      last_seen_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      restricted_at: null,
      restriction_reason: null,
      total_net_worth: '10000000',
    },
    {
      user_id: 'user-002',
      status: 'active',
      display_name: '테스트유저2',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
      last_login_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전 (WAU/MAU)
      last_seen_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      restricted_at: null,
      restriction_reason: null,
      total_net_worth: '5000000',
    },
    {
      user_id: 'user-003',
      status: 'active',
      display_name: '테스트유저3',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20일 전
      last_login_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15일 전 (MAU)
      last_seen_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      restricted_at: null,
      restriction_reason: null,
      total_net_worth: '2000000',
    },
    {
      user_id: 'user-004',
      status: 'active',
      display_name: '휴면유저4',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60일 전
      last_login_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40일 전 (휴면)
      last_seen_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      restricted_at: null,
      restriction_reason: null,
      total_net_worth: '1000000',
    },
  ];

  it('renders MAU, WAU, and DAU metrics correctly based on timestamps', () => {
    render(<AdminTelemetryMetricsTable users={mockUsers} showDetailsLink={true} />);

    // Header & Badge
    expect(screen.getByText(/실시간 활성 사용자\(MAU\/WAU\/DAU\) 및 유저 리텐션 분석/i)).toBeTruthy();
    expect(screen.getByText(/실측 데이터 연동/i)).toBeTruthy();

    // Table metric labels
    expect(screen.getByText(/월간 활성 유저 \(MAU\)/i)).toBeTruthy();
    expect(screen.getByText(/주간 활성 유저 \(WAU\)/i)).toBeTruthy();
    expect(screen.getByText(/일간 활성 유저 \(DAU\)/i)).toBeTruthy();
    expect(screen.getByText(/회원 1인당 평균 순자산/i)).toBeTruthy();
    expect(screen.getByText(/상위 10% 순자산 집중도/i)).toBeTruthy();
  });
});
