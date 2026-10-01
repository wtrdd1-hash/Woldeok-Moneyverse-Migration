import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditLogsFilterForm, type AuditFilters } from './audit-logs-filter-form';
import { AuditLogsView } from './audit-logs-view';
import type { AuditSearchRow } from '../types';

const mockFilters: AuditFilters = {
  from: '',
  to: '',
  administrator: '',
  member: '',
  feature: '',
  action: '',
  request: '',
  transaction: '',
  address: '',
  outcome: '',
  limit: '30',
};

const mockUsers = [
  { user_id: '850e7583-6589-4371-bffd-e76c3e9f8d31', display_name: 'SuperAdmin' },
  { user_id: '999488db-d28e-4a53-9a10-7dca4eeabd1a', display_name: 'TestUser' },
];

const mockEvents: AuditSearchRow[] = [
  {
    sequence: '2387',
    audit_id: '9fa720e4-cc96-4e2a-96e2-deb5438d8803',
    created_at: '2026-09-30T16:26:51.026Z',
    hash_version: 2,
    actor_user_id: '850e7583-6589-4371-bffd-e76c3e9f8d31',
    action: 'admin.policy',
    feature: 'controls',
    target_kind: null,
    target_id: null,
    subject_user_id: '999488db-d28e-4a53-9a10-7dca4eeabd1a',
    transaction_id: null,
    request_id: null,
    trace_id: null,
    session_hash: 'abc123def456',
    client_ip: '211.43.18.200',
    outcome: 'success',
    response_status: 200,
    metadata: {},
    context: {},
    previous_integrity_hash: '00000000000000000000000000000000',
    integrity_hash: '11112222333344445555666677778888',
  },
];

describe('AuditLogsFilterForm', () => {
  it('renders collapsed state by default when no filters are active', () => {
    render(<AuditLogsFilterForm filters={mockFilters} users={mockUsers} />);

    expect(screen.getByText('감사 로그 조건 검색')).toBeDefined();
    expect(screen.getByText('전체 최신순')).toBeDefined();
    expect(screen.getByText('필터 열기')).toBeDefined();
    expect(screen.queryByLabelText(/관리자/)).toBeNull();
  });

  it('toggles filter accordion on click', () => {
    render(<AuditLogsFilterForm filters={mockFilters} users={mockUsers} />);

    const trigger = screen.getByText('감사 로그 조건 검색');
    fireEvent.click(trigger);

    expect(screen.getByText('필터 접기')).toBeDefined();
    expect(screen.getByLabelText(/관리자/)).toBeDefined();
    expect(screen.getByLabelText(/대상 회원/)).toBeDefined();
    expect(screen.getByLabelText(/기능/)).toBeDefined();
  });

  it('renders active filter count badge when filters are passed', () => {
    const activeFilters: AuditFilters = {
      ...mockFilters,
      feature: 'controls',
      administrator: 'SuperAdmin',
    };

    render(<AuditLogsFilterForm filters={activeFilters} users={mockUsers} />);

    expect(screen.getByText('2개 필터 적용 중')).toBeDefined();
    expect(screen.getByText('필터 접기')).toBeDefined();
  });
});

describe('AuditLogsView with userMap', () => {
  it('renders user display names alongside UUIDs in timeline view', () => {
    const userMap = {
      '850e7583-6589-4371-bffd-e76c3e9f8d31': { display_name: 'SuperAdmin' },
      '999488db-d28e-4a53-9a10-7dca4eeabd1a': { display_name: 'TestUser' },
    };

    render(<AuditLogsView events={mockEvents} userMap={userMap} />);

    expect(screen.getByText('SuperAdmin')).toBeDefined();
    expect(screen.getByText('TestUser')).toBeDefined();
  });

  it('renders empty message when no events match filter', () => {
    render(<AuditLogsView events={[]} />);
    expect(screen.getByText('검색 조건과 일치하는 감사 로그가 없습니다.')).toBeDefined();
  });
});

