import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { AdminUser } from '../types';
import { UserDirectory } from './user-directory';

afterEach(cleanup);

const USERS: readonly AdminUser[] = [
  {
    user_id: '00000000-0000-4000-8000-000000000001',
    display_name: '월덕',
    status: 'active',
    created_at: '2026-09-01T00:00:00.000Z',
    restricted_at: null,
    restriction_reason: null,
    last_login_at: '2026-09-18T10:00:00.000Z',
    last_seen_at: '2026-09-18T11:00:00.000Z',
    last_admin_at: null,
  },
  {
    user_id: '00000000-0000-4000-8000-000000000002',
    display_name: '테스트 사용자',
    status: 'active',
    created_at: '2026-09-02T00:00:00.000Z',
    restricted_at: '2026-09-03T00:00:00.000Z',
    restriction_reason: '운영 검토 중',
    last_login_at: '2026-09-18T12:00:00.000Z',
    last_seen_at: '2026-09-18T13:45:00.000Z',
    last_admin_at: '2026-09-18T13:30:00.000Z',
  },
];

describe('UserDirectory', () => {
  it('filters by display name and preserves the matching detail destination', () => {
    render(<UserDirectory users={USERS} />);

    fireEvent.change(screen.getByRole('textbox', { name: '사용자 검색' }), {
      target: { value: '월덕' },
    });

    expect(screen.getByText('월덕')).toBeDefined();
    expect(screen.queryByText('테스트 사용자')).toBeNull();
    expect(screen.getByRole('link', { name: /상세·로그/ }).getAttribute('href')).toBe(
      '/admin/users/00000000-0000-4000-8000-000000000001',
    );
  });

  it('shows only restricted members when the restriction filter is selected', () => {
    render(<UserDirectory users={USERS} />);

    fireEvent.click(screen.getByRole('button', { name: '제한됨' }));

    expect(screen.queryByText('월덕')).toBeNull();
    expect(screen.getByText('테스트 사용자')).toBeDefined();
    expect(screen.getByText('운영 검토 중')).toBeDefined();
  });

  it('shows full Korea-time access dates and sorts by most recent access', () => {
    render(<UserDirectory users={USERS} />);

    expect(screen.getByText(/2026.*09.*18.*22.*45.*00/)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /최근 접속 순/ }));

    const detailLinks = screen.getAllByRole('link', { name: /상세·로그/ });
    expect(detailLinks[0]?.getAttribute('href')).toBe(
      '/admin/users/00000000-0000-4000-8000-000000000002',
    );
  });
});
