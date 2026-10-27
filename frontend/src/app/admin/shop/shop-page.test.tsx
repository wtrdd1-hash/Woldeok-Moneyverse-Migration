import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminShopPage from './page';

const getCatalog = vi.fn();
vi.mock('@/lib/session', () => ({ requireAdminConsole: async () => ({}) }));
vi.mock('@/lib/api', () => ({ api: (...args: unknown[]) => getCatalog(...args) }));
vi.mock('@/components/translated-text', () => ({ TranslatedText: ({ korean }: { korean: string }) => <span>{korean}</span> }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ children, title }: { children: React.ReactNode; title: React.ReactNode }) => <header>{title}{children}</header>, Accent: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('./admin-shop-view', () => ({ AdminShopView: ({ items }: { items: unknown[] }) => <div data-testid="verified-shop-view">{items.length} items</div> }));

describe('admin shop page read evidence', () => {
  it('blocks the editor when backend is unavailable', async () => {
    getCatalog.mockRejectedValueOnce(new Error('backend unavailable'));
    render(await AdminShopPage());
    expect(screen.getByRole('alert').textContent).toContain('상품 상태를 변경할 수 없습니다');
    expect(screen.queryByTestId('verified-shop-view')).toBeNull();
    expect(screen.getByRole('link', { name: '다시 조회' }).getAttribute('href')).toBe('/admin/shop');
  });
  it('distinguishes verified zero items from backend failure', async () => {
    getCatalog.mockResolvedValueOnce({ items: [] });
    render(await AdminShopPage());
    expect(screen.getByRole('status').textContent).toContain('상품 0종');
    expect(screen.getByTestId('verified-shop-view')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
