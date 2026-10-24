import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiMock, memberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), memberMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: memberMock }));
vi.mock('./inventory-view', () => ({ InventoryView: ({ holdings }: { holdings: unknown[] }) => <div data-testid="inventory-view">{holdings.length} verified holdings</div> }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>, Accent: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('@/components/translated-text', () => ({ TranslatedText: ({ korean }: { korean: string }) => <span>{korean}</span> }));
import InventoryPage, { metadata } from './page';

describe('member inventory read integrity', () => {
  it('shows a failure state rather than a fabricated empty inventory when holdings API fails', async () => {
    apiMock.mockImplementation(async (path: string) => path.includes('holdings') ? null : { chosenName: '회원' });
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('보유 정보를 확인할 수 없어요');
    expect(html).not.toContain('data-testid="inventory-view"');
    expect(html).toContain('href="/inventory"');
  });

  it('distinguishes a verified empty shelf from API failure', async () => {
    apiMock.mockImplementation(async (path: string) => path.includes('holdings') ? { holdings: [] } : null);
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('0 verified holdings');
    expect(html).not.toContain('보유 정보를 확인할 수 없어요');
  });

  it('rejects a malformed holdings response rather than inventing zero items', async () => {
    apiMock.mockImplementation(async (path: string) => path.includes('holdings') ? { holdings: null } : null);
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('보유 정보를 확인할 수 없어요');
    expect(html).not.toContain('data-testid="inventory-view"');
  });

  it('does not index a member-specific inventory page', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
