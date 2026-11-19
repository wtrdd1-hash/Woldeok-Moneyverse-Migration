import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminLayout from './layout';

vi.mock('@/components/admin-sub-nav', () => ({
  AdminSubNav: () => <nav data-testid="admin-sub-nav">Admin links</nav>
}));

describe('Admin layout visual transition', () => {
  it('wraps the original admin navigation and content in a scoped v2 theme', () => {
    const { container } = render(<AdminLayout><p>Protected original content</p></AdminLayout>);
    expect(container.querySelector('[data-admin-theme="v2026.11.18.17"]')).not.toBeNull();
    expect(screen.getByTestId('admin-sub-nav')).toBeDefined();
    expect(screen.getByText('Protected original content')).toBeDefined();
    expect(screen.getByText('ADMIN CONTROL CENTER')).toBeDefined();
  });

  it('has a visible non-fabricated status disclaimer rather than pretending backend is healthy', () => {
    render(<AdminLayout><p>Protected data</p></AdminLayout>);
    expect(screen.getByText(/서비스 상태는 각 관리자 API의 실제 조회 결과를 기준으로 표시/)).toBeDefined();
  });
});
