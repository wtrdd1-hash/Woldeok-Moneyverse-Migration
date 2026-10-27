import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
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

  it('labels a bounded read as a sample and does not invent MAU for dormant users', () => {
    const dormant = [{ ...mockUsers[0]!, created_at: '2025-01-01T00:00:00Z', last_seen_at: null, last_login_at: null }];
    const markup = renderToStaticMarkup(<AdminTelemetryMetricsTable users={dormant} sampled />);
    expect(markup).toContain('조회된 회원 1명');
    expect(markup).not.toContain('등록된 전체 회원');
    expect(markup).not.toContain('실시간 집계 새로고침');
    expect(markup).toContain('MAU (월간 활성)');
    expect(markup).toMatch(/MAU \(월간 활성\)[\s\S]*?0명/);
  });

  it('renders MAU, WAU, and DAU metrics correctly based on timestamps', () => {
    const markup = renderToStaticMarkup(<AdminTelemetryMetricsTable users={mockUsers} showDetailsLink={true} />);

    // Header & Badge
    expect(markup).toContain('실시간 활성 사용자(MAU/WAU/DAU) 및 유저 리텐션 분석');
    expect(markup).toContain('실측 데이터 연동');

    // Table metric labels
    expect(markup).toContain('월간 활성 유저 (MAU)');
    expect(markup).toContain('주간 활성 유저 (WAU)');
    expect(markup).toContain('일간 활성 유저 (DAU)');
    expect(markup).toContain('회원 1인당 평균 순자산');
    expect(markup).toContain('상위 10% 순자산 집중도');
  });
});
