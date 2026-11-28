import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderKo } from '@/testing/render-ko';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminQuickJumperModal } from './admin-quick-jumper-modal';

vi.mock('next/navigation', () => ({ usePathname: () => '/admin' }));

afterEach(() => {
  document.body.style.overflow = '';
});

describe('admin quick jumper overlay', () => {
  it('portals the open dialog outside the clipped, scrolling admin navigation', () => {
    const { container } = renderKo(
      <nav aria-label="administrator navigation" className="overflow-x-auto backdrop-blur-xl">
        <AdminQuickJumperModal />
      </nav>,
    );
    fireEvent.click(screen.getByRole('button', { name: /관리자 전체 메뉴 열기/ }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.parentElement).toBe(document.body);
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.className).toContain('fixed');
    expect(dialog.className).toContain('inset-0');
  });

  it('closes the overlay without leaving the route list in the navigation', () => {
    renderKo(
      <nav>
        <AdminQuickJumperModal />
      </nav>,
    );
    fireEvent.click(screen.getByRole('button', { name: /관리자 전체 메뉴 열기/ }));
    expect(screen.getByRole('dialog')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
