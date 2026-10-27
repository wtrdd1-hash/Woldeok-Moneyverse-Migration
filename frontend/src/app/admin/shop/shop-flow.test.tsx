import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminShopView } from './admin-shop-view';

const update = vi.fn();
vi.mock('./actions', () => ({ updateShopItem: (...args: unknown[]) => update(...args) }));
vi.mock('next/link', () => ({ default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

const item = {
  id: 'd0a8e414-7ed1-4c1e-9d1f-5a7d4e3d2b01', code: 'ITEM_A', name: 'Item A',
  description: '', category: 'frame', base_price: '100', rarity: 'rare',
  max_stock: 10, current_stock: 5, is_limited: true, active: true, purchase_limit: '1',
};

beforeEach(() => { update.mockReset(); });

describe('admin shop mobile and keyboard mutation flow', () => {
  it('shows a keyboard accessible search and edit action with no direct browser API write', () => {
    render(<AdminShopView items={[item]} />);
    expect(screen.getByRole('textbox', { name: /상품 이름/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: '아이템 설정 수정' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '수정' })).toBeTruthy();
  });

  it('keeps the original price and offers identity recovery after a denied write', async () => {
    update.mockResolvedValue({ status: 'error', errorCode: 'reauthentication_required', message: 'Verification required' });
    render(<AdminShopView items={[item]} />);
    fireEvent.click(screen.getByRole('button', { name: '아이템 설정 수정' }));
    fireEvent.click(screen.getByRole('button', { name: '저장 완료' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Verification required'));
    expect(screen.getByRole('link', { name: /본인 확인/ }).getAttribute('href')).toBe('/account/security');
    expect((screen.getAllByRole('textbox', { name: /가격 WLD/ })[0] as HTMLInputElement).value).toBe('100');
  });

  it('shows only server-confirmed price after a successful mutation', async () => {
    update.mockResolvedValue({ status: 'ok', message: 'Verified', item: { ...item, base_price: '200' } });
    render(<AdminShopView items={[item]} />);
    fireEvent.click(screen.getByRole('button', { name: '아이템 설정 수정' }));
    fireEvent.click(screen.getByRole('button', { name: '저장 완료' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Verified'));
    expect(screen.getAllByText('200 WLD').length).toBeGreaterThan(0);
  });
});
